"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import {
  LayoutDashboard,
  Bot,
  MessageCircle,
  GitBranch,
  Server,
  BarChart3,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Shared dashboard components
import {
  ChatPlaygroundLayout,
  DashboardHeader,
  WorkflowTab,
  WorkflowBuilderTab,
} from "@/features/dashboard";

type Tool = {
  name: string;
  description: string;
  type: string;
  inputSchema: {
    jsonSchema: Record<string, any>;
  };
};

type TabKey = "chat" | "workflow" | "workflow_builder";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "agents", label: "My Agents", icon: Bot, badge: "24" },
  { key: "playground", label: "Playground", icon: MessageCircle },
  { key: "workflows", label: "Workflows", icon: GitBranch },
  { key: "servers", label: "MCP Servers", icon: Server },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "settings", label: "Settings", icon: Settings },
];

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWorkflowViewOpen, setIsWorkflowViewOpen] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(true);

  // Redirect to user's project or landing page
  useEffect(() => {
    const redirectToProject = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push("/authentication?redirectTo=/");
        return;
      }

      try {
        // Fetch user's projects
        const response = await fetch("/api/user/projects");
        const data = await response.json();
        
        if (data.success && data.projects && data.projects.length > 0) {
          // Redirect to the most recent project
          const latestProject = data.projects[0];
          router.push(`/project/${latestProject.id}`);
        } else {
          // No projects found, redirect to landing
          router.push("/landing");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        // On error, redirect to landing
        router.push("/landing");
      }
    };

    redirectToProject();
  }, [user, authLoading, router]);

  const { messages } = useChat({
    transport: new DefaultChatTransport({
      api: "https://workerdemo.rushikeshpatil8208.workers.dev/",
    }),
  });

  const breadcrumb =
    activeTab === "chat"
      ? "Chat Playground"
      : activeTab === "workflow"
      ? "Workflow View"
      : "Create Agent";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-slate-800/60 bg-slate-950/80 backdrop-blur lg:flex transition-all duration-300 relative",
          isSidebarCollapsed ? "w-20" : "w-68"
        )}
      >
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/80 px-3 py-2">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-500/40">
              A
            </span>
            {!isSidebarCollapsed && (
              <span className="text-lg font-semibold text-slate-100 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                Akron
              </span>
            )}
          </div>
          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 flex items-center justify-center size-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:text-white hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:border-white/50 transition-all shadow-lg z-10"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
        <nav className="mt-8 space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === "playground";
            return (
              <button
                key={item.key}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {!isSidebarCollapsed && item.label}
                </span>
                {!isSidebarCollapsed && item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive
                        ? "bg-white/20"
                        : "bg-slate-900/80 text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        {!isSidebarCollapsed && (
          <div className="mt-auto mx-4 rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-900/60 p-4 text-sm text-slate-300 backdrop-blur">
            <p className="font-semibold text-slate-100">Need help?</p>
            <p className="mt-1 text-slate-400">
              Chat with Akron concierge to optimize your agents.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full rounded-xl bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:border hover:border-white/50 transition-all duration-300"
            >
              Chat with us
            </Button>
          </div>
        )}
      </aside>
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          {/* Metrics Section - Commented out as requested */}
          {/* <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-slate-800/60 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40"
              >
                <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">{metric.value}</p>
                <p className="mt-1 text-xs text-emerald-300">{metric.delta}</p>
              </div>
            ))}
          </div> */}

          {activeTab === "chat" && (
            <ChatPlaygroundLayout
              messages={messages}
              isWorkflowViewOpen={isWorkflowViewOpen}
              onToggleWorkflowView={() => setIsWorkflowViewOpen(!isWorkflowViewOpen)}
            />
          )}

          {activeTab === "workflow" && <WorkflowTab messages={messages} />}

          {activeTab === "workflow_builder" && <WorkflowBuilderTab />}
        </main>
      </div>
    </div>
  );
}
