"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import {
  DefaultChatTransport,
  isToolUIPart,
  getToolName,
} from "ai";
import {
  LayoutDashboard,
  Bot,
  MessageCircle,
  GitBranch,
  Server,
  BarChart3,
  ShoppingBag,
  Settings,
  Sparkles,
  Bell,
  Search,
  Download,
  Plus,
  Play,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import MCPCard from "../../generativeUI/mcpConfigUI";
import AgentPreview from "../../generativeUI/AgentPreview";
import AgentConfig from "../../generativeUI/agnetConfig";

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

const quickActions = ["Check Order", "Return Item", "Track Package", "Escalate"];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  
  const [input, setInput] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isSyncingTools, setIsSyncingTools] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("GPT-4 Turbo");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/");
    }
  }, [user, authLoading, router]);
  
  const modelConfigs = {
    "GPT-4 Turbo": { temperature: 0.7, maxTokens: 4000, responseTime: "1.2s" },
    "GPT-4": { temperature: 0.7, maxTokens: 8000, responseTime: "2.1s" },
    "GPT-3.5 Turbo": { temperature: 0.9, maxTokens: 4000, responseTime: "0.8s" },
    "Claude 3 Opus": { temperature: 0.7, maxTokens: 4096, responseTime: "1.5s" },
    "Claude 3 Sonnet": { temperature: 0.7, maxTokens: 4096, responseTime: "1.0s" },
  };

  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
    }),
  });

  const tokensUsed = useMemo(() => {
    let total = 0;
    messages.forEach((message) => {
      message.parts?.forEach((part) => {
        if (part.type === "text") {
          total += Math.max(1, Math.ceil(part.text.length / 4));
        }
      });
    });
    return total;
  }, [messages]);

  const toolCalls = useMemo(() => {
    let total = 0;
    messages.forEach((message) => {
      message.parts?.forEach((part) => {
        if (isToolUIPart(part)) {
          total += 1;
        }
      });
    });
    return total;
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const syncTools = async () => {
    try {
      setIsSyncingTools(true);
      const response = await fetch("/api/mcp");
      const payload = await response.json();
      const normalized = Array.isArray(payload) ? payload : [payload];
      setTools(normalized);
    } catch (error) {
      console.error("Failed to sync tools", error);
    } finally {
      setIsSyncingTools(false);
    }
  };

  const breadcrumb =
    activeTab === "chat"
      ? "Chat Playground"
      : activeTab === "workflow"
        ? "Workflow View"
        : "Create Agent";

  const sessionStats = {
    messages: messages.length,
    tools: toolCalls,
    avgResponse: "1.4s",
    sentiment: "Positive",
    duration: "4m 23s",
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Collapsible Sidebar */}
      <aside className={cn(
        "hidden flex-col border-r border-slate-800/60 bg-slate-950/80 backdrop-blur lg:flex transition-all duration-300 relative",
        isSidebarCollapsed ? "w-20" : "w-68"
      )}>
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/80 px-3 py-2">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-500/40">
              A
            </span>
            {!isSidebarCollapsed && (
              <span className="text-lg font-semibold text-slate-100 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Akron</span>
            )}
          </div>
          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-8 flex items-center justify-center size-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:text-white hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:border-white/50 transition-all shadow-lg z-10"
          >
            {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
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
                      isActive ? "bg-white/20" : "bg-slate-900/80 text-slate-300"
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
        <header className="relative flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="#" className="hover:text-slate-100">
                Dashboard
              </Link>
              <Play className="size-3 text-slate-600" />
              <span className="font-medium text-slate-100">{breadcrumb}</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">Chat Playground</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-400 md:flex">
              <Search className="size-4" />
              <input
                className="bg-transparent text-slate-200 outline-none placeholder:text-slate-500"
                placeholder="Search agents, runs, MCP"
              />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" /> MCP Connected
            </span>
            <button className="rounded-full border border-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-900/80 hover:text-slate-100">
              <Bell className="size-4" />
            </button>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              PR
            </span>
          </div>
          {/* Floating Tab Buttons in Header */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/90 p-1.5 backdrop-blur-xl shadow-2xl">
            {(["chat", "workflow", "workflow_builder"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300",
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 border border-white/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:border hover:border-white/40"
                )}
              >
                {tab === "chat"
                  ? "Chat Playground"
                  : tab === "workflow"
                    ? "Workflow View"
                    : "Workflow Builder"}
              </button>
            ))}
          </div>
        </header>
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

          {activeTab === "chat" ? (
            <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)_340px] h-[calc(100vh-140px)]">
              {/* Chat Interface Section */}
              <section className="flex flex-col h-full">
                <div className="flex flex-col h-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
                          A
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-slate-50">Akron AI</h2>
                        <p className="text-xs text-slate-400">Active • {selectedModel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-slate-800/60 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                        {tokensUsed} / 4K
                      </div>
                      <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white h-7 px-3 text-xs shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:border hover:border-white/50 transition-all duration-300">
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/60 bg-slate-900/40 p-10 text-center">
                        <div className="inline-flex p-4 rounded-xl bg-slate-800/50 mb-4">
                          <Sparkles className="size-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-50 mb-2">Welcome to Akron AI</h3>
                        <p className="max-w-sm text-sm text-slate-400 leading-relaxed">
                          Start a conversation with your AI assistant. Describe workflows, ask questions, or explore MCP capabilities.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex w-full",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] space-y-2 rounded-2xl px-4 py-3 text-sm leading-relaxed",
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-900/80 border border-slate-800/60 text-slate-200"
                            )}
                          >
                            <div className="text-xs font-medium text-slate-400">
                              {message.role === "assistant" ? "Akron AI" : "You"}
                            </div>
                            {message.parts?.map((part, index) => {
                              if (part.type === "text") {
                                return <p key={`${message.id}-text-${index}`}>{part.text}</p>;
                              }
                              if (isToolUIPart(part)) {
                                const toolName = getToolName(part);
                                const toolCallId = part.toolCallId;
                                if (
                                  toolName === "gatherMcpInformation" &&
                                  part.state === "input-available"
                                ) {
                                  return (
                                    <div
                                      key={toolCallId}
                                      className="rounded-2xl border border-blue-500/30 bg-slate-900/80 p-4 text-slate-200"
                                    >
                                      <p className="text-sm font-medium text-slate-100">
                                        Provide MCP configuration
                                      </p>
                                      <p className="mt-1 text-xs text-slate-400">
                                        Upload OpenAPI spec or connect an existing server.
                                      </p>
                                      <div className="mt-4">
                                        <MCPCard
                                          handelSubmit={async () => {
                                            await addToolResult({
                                              toolCallId,
                                              tool: toolName,
                                              output: "Submitted MCP configuration",
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Model Selection Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg border border-slate-800/60 bg-slate-900/80 text-slate-300 hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Bot className="size-3.5" />
                          <span className="font-medium">{selectedModel}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500">Temp: {modelConfigs[selectedModel as keyof typeof modelConfigs].temperature}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500">Tokens: {modelConfigs[selectedModel as keyof typeof modelConfigs].maxTokens}</span>
                        </div>
                        <ChevronDown className={cn("size-3.5 transition-transform", showModelDropdown && "rotate-180")} />
                      </button>
                      
                      {showModelDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-slate-800/60 bg-slate-900 shadow-xl z-50 overflow-hidden">
                          {Object.entries(modelConfigs).map(([model, config]) => (
                            <button
                              key={model}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model);
                                setShowModelDropdown(false);
                              }}
                              className={cn(
                                "w-full px-4 py-3 text-left hover:bg-slate-800/80 transition-colors border-b border-slate-800/60 last:border-b-0",
                                selectedModel === model && "bg-slate-800/60"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-200">{model}</span>
                                {selectedModel === model && (
                                  <span className="text-xs text-blue-400">✓ Selected</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>Temp: {config.temperature}</span>
                                <span>•</span>
                                <span>Max Tokens: {config.maxTokens}</span>
                                <span>•</span>
                                <span>Response: {config.responseTime}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input Box */}
                    <form onSubmit={handleSubmit}>
                      <div className="relative flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/80 px-4 py-3 shadow-sm">
                        <Textarea
                          value={input}
                          onChange={(event) => setInput(event.target.value)}
                          placeholder="Ask anything (Ctrl+L)"
                          className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 resize-none min-h-[24px] max-h-[120px] p-0"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e as any);
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white h-8 w-8 p-0 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:border hover:border-white/50 transition-all duration-300"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>

              {/* Workflow View Section - Increased Size */}
              <section className="flex flex-col h-full">
                <div className="flex flex-col h-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
                    <div>
                      <h3 className="text-base font-semibold text-slate-50">Workflow View</h3>
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

              {/* Agent Configuration Section */}
              <aside className="flex flex-col h-full overflow-y-auto pr-1">
                <div className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 to-slate-900/80 shadow-2xl shadow-slate-950/60 backdrop-blur p-6 h-full">
                  <AgentConfig />
                </div>
              </aside>
            </div>
          ) : null}

          {activeTab === "workflow" ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-50">Customer Support Workflow</h2>
                    <p className="text-sm text-slate-400">
                      Monitor orchestration steps, execution timers, and branching decisions.
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
                    <p className="mt-2 text-xs text-emerald-300">Processing step 26 of 29</p>
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
                    <p className="mt-2 text-xs text-slate-400">OpenAI GPT-4, Sentiment API, Vector DB, Slack</p>
                  </div>
                </div>
                <div className="mt-6 h-[520px] overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70">
                  <AgentPreview messages={messages} />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "workflow_builder" ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center max-w-md">
                <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-800/60 shadow-2xl mb-6">
                  <GitBranch className="size-16 text-slate-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-50 mb-3">Workflow Builder</h2>
                <p className="text-lg text-slate-400 mb-2">Coming Soon</p>
                <p className="text-sm text-slate-500">
                  Build complex AI workflows with drag-and-drop interface, conditional logic, and multi-agent orchestration.
                </p>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
