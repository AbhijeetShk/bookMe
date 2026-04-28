import { ChatGroq } from "@langchain/groq";
import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";
import dotenv from "dotenv";
dotenv.config();
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

const GraphState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  classification: Annotation<string>(),
  research: Annotation<string>(),
  analysis: Annotation<string>(),
  synthesis: Annotation<string>(),
});

async function classify() {
  return {
    classification: "User Query Classified",
  };
}

async function doResearch() {
  return {
    research: "Research completed",
  };
}

async function analyze() {
  return {
    analysis: "Analysis completed",
  };
}

async function synthesize() {
  return {
    synthesis: "Final synthesis ready",
  };
}

export const graph = new StateGraph(GraphState)
  .addNode("classify", classify)
  .addNode("do_research", doResearch)
  .addNode("analyze", analyze)
  .addNode("synthesize", synthesize)

  .addEdge(START, "classify")
  .addEdge("classify", "do_research")
  .addEdge("do_research", "analyze")
  .addEdge("analyze", "synthesize")
  .addEdge("synthesize", END)

  .compile();