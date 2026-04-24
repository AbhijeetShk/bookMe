import dotenv from 'dotenv';
dotenv.config();
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';

const USER_ID='df1f93ae-6827-4c42-b8a3-9a0e2e80784f';
const supabase=createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const embeddings=new HuggingFaceInferenceEmbeddings({apiKey:process.env.HUGGINGFACEHUB_API_KEY});
const llm=new ChatGroq({model:'llama-3.3-70b-versatile',temperature:0,apiKey:process.env.GROQ_KEY});

const vectorStore = new SupabaseVectorStore(embeddings,{client:supabase as any,tableName:'documents',queryName:'match_documents'});

async function loadPdf(path:string){
 const docs=await new PDFLoader(path).load();
 const splitter=new RecursiveCharacterTextSplitter({chunkSize:900,chunkOverlap:180});
 const chunks=await splitter.splitDocuments(docs);
 const enriched=chunks.map((d,i)=>({...d,metadata:{...d.metadata,user_id:USER_ID,chunk_id:i,source:path}}));
 await SupabaseVectorStore.fromDocuments(enriched,embeddings,{client:supabase as any,tableName:'documents',queryName:'match_documents'});
 console.log(`Indexed ${enriched.length} chunks`);
}

function buildRetriever(k=5, mmr=true){
 return vectorStore.asRetriever({
   filter:{user_id:USER_ID},
   k,
   searchType:mmr?'mmr':'similarity'
 });
}

async function queryExpansion(q:string){
 const prompt=`Rewrite into 3 search queries:\n${q}`;
 const res=await llm.invoke(prompt);
 const text=String(res.content);
 return [q,...text.split('\n').map(s=>s.replace(/^[-0-9. ]+/,'').trim()).filter(Boolean)].slice(0,4);
}

async function retrieveHybrid(question:string,k=5){
 const queries=await queryExpansion(question);
 const all=[] as any[];
 for(const q of queries){
   const docs=await buildRetriever(k,true).invoke(q);
   all.push(...docs);
 }
 const unique=Array.from(new Map(all.map((d:any)=>[d.pageContent,d])).values());
 return unique.slice(0,k);
}

async function ask(question:string){
 const docs=await retrieveHybrid(question,6);
 const prompt=ChatPromptTemplate.fromMessages([
  ['system','Use ONLY the context. If insufficient, say you do not know.\n\n{context}'],
  ['human','{input}']
 ]);
 const chain=await createStuffDocumentsChain({llm,prompt});
 const answer=await chain.invoke({input:question,context:docs});
 return {answer,docs};
}

async function evaluate(question:string,answer:string,docs:any[]){
 return {
   contextCount:docs.length,
   avgChunkSize:Math.round(docs.reduce((a,d)=>a+d.pageContent.length,0)/Math.max(docs.length,1)),
   faithfulnessHint: docs.length? 'grounded-context-present':'no-context'
 };
}

async function main(){
 // await loadPdf('./src/Stoner.pdf');
 const q='What is the significance of Stoner relationship with Katherine Driscoll?';
 const {answer,docs}=await ask(q);
 console.log('ANSWER:',answer);
 console.log('CHUNKS:',docs.length);
 console.log(await evaluate(q,String(answer),docs));
}
main();
