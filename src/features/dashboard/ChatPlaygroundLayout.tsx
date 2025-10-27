"use client";

import { cn } from "@/lib/utils";
import { UIMessage } from "ai";
import { ChatInterface } from "./ChatInterface";
import { WorkflowView } from "./WorkflowView";
import { AgentConfigSidebar } from "./AgentConfigSidebar";

interface ChatPlaygroundLayoutProps {
  messages: UIMessage[];
  isWorkflowViewOpen: boolean;
  onToggleWorkflowView: () => void;
}

export function ChatPlaygroundLayout({
  messages,
  isWorkflowViewOpen,
  onToggleWorkflowView,
}: ChatPlaygroundLayoutProps) {
  return (
    <div
      className={cn(
        "grid gap-4 h-[calc(100vh-140px)] transition-[grid-template-columns] duration-500 ease-in-out",
        isWorkflowViewOpen
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px]" // 3 columns (default)
          : "lg:grid-cols-[minmax(0,1.2fr)_0.5fr]" // 2 columns (chat + config)
      )}
    >
      {/* Chat Interface Section */}
      <ChatInterface
        isWorkflowViewOpen={isWorkflowViewOpen}
        onToggleWorkflowView={onToggleWorkflowView}
      />

      {/* Workflow View Section */}
      {isWorkflowViewOpen && <WorkflowView messages={messages} />}

      {/* Agent Configuration Section */}
      <AgentConfigSidebar />
    </div>
  );
}
