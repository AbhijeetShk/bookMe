import { useStream } from "@langchain/react";

const AGENT_URL = "http://localhost:2024";

export function PipelineChat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "graph_execution_cards",
  });

  return (
    <div>
      <PipelineProgress nodes={PIPELINE_NODES} values={stream.values} />
      <NodeCardList
        nodes={PIPELINE_NODES}
        messages={stream.messages}
        values={stream.values}
        getMetadata={stream.getMessagesMetadata}
      />
    </div>
  );
}