"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import InputDemo from "../../../generativeUI/InputDemo";

interface ChatInterfaceProps {
  isWorkflowViewOpen: boolean;
  projectId : any
  onToggleWorkflowView: () => void;
}

export function ChatInterface({
  projectId , 
  isWorkflowViewOpen,
  onToggleWorkflowView,
}: ChatInterfaceProps) {
  return (
    <section className="flex flex-col h-full transition-all duration-500 ease-in-out">
      <div className="flex flex-col h-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <div>
            <h3 className="text-base font-semibold text-slate-50">Chat</h3>
            <p className="text-xs text-slate-400">
              Converse with your agent
            </p>
          </div>

          {/* Workflow View toggle button */}
          <Button
            size="sm"
            onClick={onToggleWorkflowView}
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:text-white hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:border-white/50 transition-all duration-300 h-7 w-7 p-0 flex items-center justify-center"
            title={
              isWorkflowViewOpen
                ? "Collapse Workflow View"
                : "Expand Workflow View"
            }
          >
            {isWorkflowViewOpen ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </Button>
        </div>

        {/* Main chat content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <InputDemo  projectId = {projectId}/>
        </div>
      </div>
    </section>
  );
}
