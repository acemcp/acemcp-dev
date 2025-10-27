"use client";

import { Button } from "@/components/ui/button";
import { UIMessage } from "ai";
import AgentPreview from "../../../generativeUI/AgentPreview";

interface WorkflowViewProps {
  messages: UIMessage[];
}

export function WorkflowView({ messages }: WorkflowViewProps) {
  return (
    <section className="flex flex-col h-full transition-all duration-700 ease-in-out">
      <div className="flex flex-col h-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div>
            <h3 className="text-base font-semibold text-slate-50">
              Agent View
            </h3>
            <p className="text-xs text-slate-400">
              Visualize orchestration and active tools
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 text-xs h-7 px-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/50 hover:border-white/50 transition-all duration-300"
          >
            Manage
          </Button>
        </div>
        <div className="flex-1 overflow-hidden rounded-b-3xl border-t border-slate-800/60 bg-slate-900/70">
          <AgentPreview messages={messages} />
        </div>
      </div>
    </section>
  );
}
