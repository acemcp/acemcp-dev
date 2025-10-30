"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { DefaultChatTransport } from "ai";
import { Loader2 } from "lucide-react";

// Shared dashboard components
import {
  DashboardHeader,
  WorkflowTab,
  WorkflowBuilderTab,
} from "@/features/dashboard";
import InputDemo from "../../../../generativeUI/InputDemo";
import AgentConfig from "../../../../generativeUI/agnetConfig";

type TabKey = "chat" | "workflow" | "workflow_builder";

export default function ProjectPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { id: projectId } = useParams();

  console.log("projectId in dashboard", projectId);

  const [activeTab, setActiveTab] = useState<TabKey>("chat");
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#5F96F1]" />
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
      <main className="flex-1 overflow-hidden bg-background">
        {activeTab === "chat" && (
          <div className="grid h-[calc(100vh-60px)] grid-cols-[1fr_320px] gap-0">
            {/* Chat Interface Section */}
            <section className="flex flex-col h-full border-r border-border overflow-hidden">
              <InputDemo projectId={projectId} />
            </section>

            {/* Agent Configuration Section */}
            <aside className="flex flex-col h-full bg-card overflow-hidden">
              <div className="flex flex-col h-full p-4 overflow-y-auto">
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
