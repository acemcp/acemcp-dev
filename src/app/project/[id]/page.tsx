"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared dashboard components
import {
  DashboardHeader,
  WorkflowTab,
  WorkflowBuilderTab,
} from "@/features/dashboard";
import InputDemo from "../../../../generativeUI/InputDemo";
import AgentConfig from "../../../../generativeUI/agnetConfig";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

type Tool = {
  name: string;
  description: string;
  type: string;
  inputSchema: {
    jsonSchema: Record<string, any>;
  };
};

type TabKey = "chat" | "workflow" | "workflow_builder";

const metrics = [
  { label: "Active Agents", value: "24", delta: "+12% vs last week" },
  { label: "Total Executions", value: "1,847", delta: "+28% vs last month" },
  { label: "Success Rate", value: "94.2%", delta: "+2.3% vs last week" },
  { label: "Avg Response", value: "1.2s", delta: "-15% vs last week" },
];

const quickActions = [
  "Check Order",
  "Return Item",
  "Track Package",
  "Escalate",
];

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { id: projectId } = useParams();

  console.log("projectId in dashboard", projectId);

  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isWorkflowViewOpen, setIsWorkflowViewOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Validate project access
  useEffect(() => {
    const validateProject = async () => {
      if (authLoading) return;

      if (!user) {
        router.push(`/authentication?redirectTo=/project/${projectId}`);
        return;
      }

      try {
        // Validate project exists and user has access
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          // Project not found or no access, redirect to landing
          // router.push("/404");
          return;

          console.log("validated");
        }

        setIsValidating(false);
      } catch (error) {
        console.error("Error validating project:", error);
        router.push("/landing");
      }
    };

    validateProject();
  }, [user, authLoading, projectId, router]);

  const { messages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
      body: {
        projectId,
      },
    }),
  });

  const breadcrumb =
    activeTab === "chat"
      ? "Chat Playground"
      : activeTab === "workflow"
      ? "Workflow View"
      : "Create Agent";

  // Show loading while validating
  if (authLoading || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        breadcrumb={breadcrumb}
      />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        {activeTab === "chat" && (
          <div
            className={cn(
              "grid gap-4 h-[calc(100vh-140px)] transition-[grid-template-columns] duration-500 ease-in-out",
              isWorkflowViewOpen
                ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px]" // 3 columns (default)
                : "lg:grid-cols-[minmax(0,1.3fr)_0.4fr]" // 2 columns (chat + config)
            )}
          >
            {/* Chat Interface Section */}
            <section className="flex flex-col h-full transition-all duration-500 ease-in-out">
              {/* <div className="flex flex-col h-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur overflow-hidden"> */}
                {/* Header */}
                {/* <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                  <div>
                    <h3 className="text-base font-semibold text-slate-50">
                      Chat
                    </h3>
                    <p className="text-xs text-slate-400">
                      Converse with your agent
                    </p>
                  </div> */}
                  {/* Workflow View toggle button */}
                  {/* <Button
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
            </Button> */}
                {/* </div> */}

                {/* Main chat content area */}
                {/* <div className="flex flex-col flex-1 overflow-hidden h-screen"> */}
                  <InputDemo projectId={projectId} />
                {/* </div> */}
              {/* </div> */}
            </section>
            {/* Workflow View Section */}
            {/* {isWorkflowViewOpen && <WorkflowView messages={messages} />} */}

            {/* Agent Configuration Section */}
            <aside className="flex flex-col flex-1 h-full transition-all duration-700 ease-in-out">
              <div className="flex flex-col flex-1 rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur p-6 overflow-y-auto">
                <AgentConfig />
              </div>
            </aside>
          </div>
        )}

        {activeTab === "workflow" && <WorkflowTab messages={messages} />}

        {activeTab === "workflow_builder" && <WorkflowBuilderTab />}
      </main>
    </>
  );
}
