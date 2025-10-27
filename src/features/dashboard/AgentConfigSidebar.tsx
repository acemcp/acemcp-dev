"use client";

import AgentConfig from "../../../generativeUI/agnetConfig";

export function AgentConfigSidebar() {
  return (
    <aside className="flex flex-col flex-1 h-full transition-all duration-700 ease-in-out">
      <div className="flex flex-col flex-1 rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur p-6 overflow-y-auto">
        <AgentConfig />
      </div>
    </aside>
  );
}
