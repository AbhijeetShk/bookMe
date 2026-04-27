import { BaseMessage } from "@langchain/core/messages";
import { PIPELINE_NODE_NAMES } from "./constants";
import { MessageMetadata, NodeStatus, PipelineNode } from "./types";

export function getStreamingContent(
  messages: BaseMessage[],
  getMetadata: (msg: BaseMessage) => MessageMetadata | undefined
): Record<string, string> {
  const content: Record<string, string> = {};

  for (const message of messages) {
    if (message.type !== "ai") continue;

    const metadata = getMetadata(message);
    const node = metadata?.streamMetadata?.langgraph_node;

    if (node && PIPELINE_NODE_NAMES.has(node)) {
      content[node] =
        typeof message.content === "string"
          ? message.content
          : "";
    }
  }

  return content;
}

export function getNodeStatus(
  node: PipelineNode,
  streamingContent: Record<string, string>,
  values: Record<string, unknown>
): NodeStatus {
  if (values?.[node.stateKey]) return "complete";
  if (streamingContent[node.name]) return "streaming";
  return "idle";
}

export function formatContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return JSON.stringify(value, null, 2);
}