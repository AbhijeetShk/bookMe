"use client";

import { useStream } from "@langchain/react";
import type { myAgent } from "@/agent/agent";

import { PIPELINE_NODES } from "@/lib/pipeline/constants";
import { getStreamingContent } from "@/lib/pipeline/helpers";

import PipelineProgress from "./pipelineProgress";
import NodeCardList from "./NodeCardList";

const AGENT_URL = "http://localhost:2024";

export default function PipelineChat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "graph_execution_cards",
  });

  const streamingContent = getStreamingContent(
    stream.messages,
    stream.getMessagesMetadata
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PipelineProgress
        nodes={PIPELINE_NODES}
        values={stream.values}
        streamingContent={streamingContent}
      />

      <NodeCardList
        nodes={PIPELINE_NODES}
        messages={stream.messages}
        values={stream.values}
        getMetadata={stream.getMessagesMetadata}
      />
    </div>
  );
}