import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

const State = Annotation.Root({
  input: Annotation<string>(),
  classify: Annotation<string>(),
  research: Annotation<string>(),
  analyze: Annotation<string>(),
  synthesize: Annotation<string>(),
});

async function classifyNode(state:any){
  return { classify: "Tech Question" };
}

async function researchNode(state:any){
  return { research: "Searching docs..." };
}

async function analyzeNode(state:any){
  return { analyze: "Comparing findings..." };
}

async function synthesizeNode(state:any){
  return { synthesize: "Final answer generated." };
}

export const graph = new StateGraph(State)
  .addNode("classify", classifyNode)
  .addNode("research", researchNode)
  .addNode("analyze", analyzeNode)
  .addNode("synthesize", synthesizeNode)

  .addEdge(START, "classify")
  .addEdge("classify", "research")
  .addEdge("research", "analyze")
  .addEdge("analyze", "synthesize")
  .addEdge("synthesize", END)

  .compile();