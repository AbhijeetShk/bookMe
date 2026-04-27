export type NodeStatus =
  | "idle"
  | "streaming"
  | "complete";

export type PipelineNode = {
  name: string;
  stateKey: string;
  label: string;
};

export type MessageMetadata = {
  streamMetadata?: {
    langgraph_node?: string;
  };
};