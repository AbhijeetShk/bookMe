"use client";

import { PipelineNode } from "@/lib/pipeline/types";
import { getNodeStatus } from "@/lib/pipeline/helpers";

type Props = {
  nodes: PipelineNode[];
  values: Record<string, unknown>;
  streamingContent: Record<string, string>;
};

export default function PipelineProgress({
  nodes,
  values,
  streamingContent,
}: Props) {
  return (
    <div className="mb-6 flex items-center gap-1 flex-wrap">
      {nodes.map((node, i) => {
        const status = getNodeStatus(
          node,
          streamingContent,
          values
        );

        const colors = {
          idle: "bg-gray-200 text-gray-500",
          streaming:
            "bg-blue-500 text-white animate-pulse",
          complete: "bg-green-500 text-white",
        };

        return (
          <div
            key={node.name}
            className="flex items-center"
          >
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status]}`}
            >
              {node.label}
            </div>

            {i < nodes.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-6 ${
                  status === "complete"
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}