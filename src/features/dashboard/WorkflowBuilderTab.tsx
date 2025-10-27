"use client";

import { GitBranch } from "lucide-react";

export function WorkflowBuilderTab() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center max-w-md">
        <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-800/60 shadow-2xl mb-6">
          <GitBranch className="size-16 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-50 mb-3">
          Workflow Builder
        </h2>
        <p className="text-lg text-slate-400 mb-2">Coming Soon</p>
        <p className="text-sm text-slate-500">
          Build complex AI workflows with drag-and-drop interface, conditional
          logic, and multi-agent orchestration.
        </p>
      </div>
    </div>
  );
}
