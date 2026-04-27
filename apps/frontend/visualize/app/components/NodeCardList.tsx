"use client";

import { BaseMessage } from "@langchain/core/messages";
import NodeCard from "./NodeCard";
import { PipelineNode, MessageMetadata } from "@/lib/pipeline/types";
import {
  getNodeStatus,
  getStreamingContent,
} from "@/lib/pipeline/helpers";

type Props = {
  nodes: PipelineNode[];
  messages: BaseMessage[];
  values: Record<string, unknown>;
  getMetadata: (
    msg: BaseMessage
  ) => MessageMetadata | undefined;
};

export default function NodeCardList({
  nodes,
  messages,
  values,
  getMetadata,
}: Props) {
  const streamingContent = getStreamingContent(
    messages,
    getMetadata
  );

  return (
    <div className="space-y-3">
      {nodes.map((node) => {
        const status = getNodeStatus(
          node,
          streamingContent,
          values
        );

        return (
          <NodeCard
            key={node.name}
            node={node}
            status={status}
            streamingContent={streamingContent[node.name]}
            completedContent={values[node.stateKey]}
          />
        );
      })}
    </div>
  );
}