"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NodeStatus, PipelineNode } from "@/lib/pipeline/types";
import { formatContent } from "@/lib/pipeline/helpers";

type Props = {
  node: PipelineNode;
  status: NodeStatus;
  streamingContent?: string;
  completedContent?: unknown;
};

export default function NodeCard({
  node,
  status,
  streamingContent,
  completedContent,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const displayContent =
    status === "complete"
      ? formatContent(completedContent)
      : streamingContent ?? "";

  const statusBadge = {
    idle: {
      text: "Waiting",
      className: "bg-gray-100 text-gray-600",
    },
    streaming: {
      text: "Running",
      className: "bg-blue-100 text-blue-700 animate-pulse",
    },
    complete: {
      text: "Done",
      className: "bg-green-100 text-green-700",
    },
  };

  const badge = statusBadge[status];

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{node.label}</h3>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.text}
          </span>
        </div>

        {collapsed ? (
          <ChevronDown size={18} />
        ) : (
          <ChevronUp size={18} />
        )}
      </button>

      {!collapsed && displayContent && (
        <div className="border-t px-4 py-3 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {displayContent}

            {status === "streaming" && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-blue-500" />
            )}
          </pre>
        </div>
      )}
    </div>
  );
}