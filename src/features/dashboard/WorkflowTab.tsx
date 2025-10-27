"use client";

import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { UIMessage } from "ai";
import AgentPreview from "../../../generativeUI/AgentPreview";

interface WorkflowTabProps {
  messages: UIMessage[];
}

export function WorkflowTab({ messages }: WorkflowTabProps) {
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              Customer Support Workflow
            </h2>
            <p className="text-sm text-slate-400">
              Monitor orchestration steps, execution timers, and branching
              decisions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/50 hover:border-white/50 transition-all duration-300"
            >
              <Download className="mr-2 size-4" /> Export Workflow
            </Button>
            <Button className="rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/70 hover:border hover:border-white/50 transition-all duration-300">
              <Play className="mr-2 size-4" /> Execute
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <p className="font-semibold">Current Step</p>
            <p className="mt-1 text-lg text-emerald-100">Sentiment Analysis</p>
            <p className="mt-2 text-xs text-emerald-300">
              Processing step 26 of 29
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Active Nodes</p>
            <p className="mt-1 text-lg text-slate-100">5</p>
            <p className="mt-2 text-xs text-slate-400">3 optimized • 2 ready</p>
          </div>
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Success Rate</p>
            <p className="mt-1 text-lg text-slate-100">94.2%</p>
            <p className="mt-2 text-xs text-emerald-300">Stable</p>
          </div>
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">MCP Servers</p>
            <p className="mt-1 text-lg text-slate-100">4 connected</p>
            <p className="mt-2 text-xs text-slate-400">
              OpenAI GPT-4, Sentiment API, Vector DB, Slack
            </p>
          </div>
        </div>
        <div className="mt-6 h-[520px] overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70">
          <AgentPreview messages={messages} />
        </div>
      </div>
    </div>
  );
}
