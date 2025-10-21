"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
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

type TabKey = "chat" | "workflow" | "create";

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
  const [input, setInput] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isSyncingTools, setIsSyncingTools] = useState(false);

  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "https://acemcp-service.rushikeshpatil8208.workers.dev/",
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
      <aside className="hidden w-68 flex-col border-r border-slate-800/60 bg-slate-950/80 px-4 py-6 backdrop-blur lg:flex">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/80 px-3 py-2">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-blue-500/20 text-base font-semibold text-blue-300">
            A
          </span>
          <span className="text-lg font-semibold text-slate-100">AcEMCP</span>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === "playground";
            return (
              <button
                key={item.key}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                    : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                {item.badge ? (
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
        <div className="mt-auto rounded-2xl border border-slate-800/60 bg-slate-900/80 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">Need help?</p>
          <p className="mt-1 text-slate-400">
            Chat with AcEMCP concierge to optimize your agents.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full rounded-xl bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
          >
            Chat with us
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
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
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-400">
            {(["chat", "workflow", "create"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full px-5 py-2 transition",
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                    : "bg-slate-900/80 text-slate-300 hover:bg-slate-900"
                )}
              >
                {tab === "chat"
                  ? "Chat Playground"
                  : tab === "workflow"
                    ? "Workflow View"
                    : "Create Agent"}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          </div>

          {activeTab === "chat" ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="space-y-6">
                <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-12 items-center justify-center rounded-3xl bg-emerald-500/20 text-lg font-semibold text-emerald-300">
                        CS
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-50">Customer Support Agent</h2>
                        <p className="text-sm text-slate-400">GPT-4 • Sentiment Analysis • Escalation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-slate-800/60 px-4 py-2 text-sm text-slate-300">
                        Tokens {tokensUsed} / 4,000
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-full border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                      >
                        <Download className="mr-2 size-4" /> Export Chat
                      </Button>
                      <Button className="rounded-full bg-blue-600 hover:bg-blue-500">
                        <Plus className="mr-2 size-4" /> New Chat
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 h-[440px] space-y-4 overflow-y-auto pr-2">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-blue-500/40 bg-blue-500/10 p-8 text-center">
                        <Sparkles className="size-8 text-blue-300" />
                        <p className="mt-4 text-lg font-semibold text-slate-50">Start a conversation</p>
                        <p className="mt-2 max-w-sm text-sm text-slate-300">
                          Describe the workflow or task you want the agent to handle. Try one of the quick actions below.
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
                              "max-w-[78%] space-y-3 rounded-3xl px-5 py-4 text-sm leading-relaxed",
                              message.role === "user"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                                : "bg-slate-900/70 text-slate-200 shadow-lg shadow-slate-950/30"
                            )}
                          >
                            <div className="text-xs uppercase tracking-wide text-slate-200/70">
                              {message.role === "assistant" ? "Customer Support Agent" : "You"}
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
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <Textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Describe what the agent should do next..."
                      className="min-h-[120px] rounded-3xl border border-slate-800/60 bg-slate-900/80 text-base text-slate-100 placeholder:text-slate-500"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {quickActions.map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setInput(action)}
                            className="rounded-full border border-slate-800/60 bg-slate-900/80 px-4 py-1.5 text-sm text-slate-300 transition hover:border-blue-500/40 hover:text-blue-200"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="submit"
                        className="rounded-full bg-blue-600 px-6 text-sm font-semibold hover:bg-blue-500"
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-50">Workflow Snapshot</h3>
                      <p className="text-sm text-slate-400">
                        Visualize the current orchestration path and active tools.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                    >
                      Manage Nodes
                    </Button>
                  </div>
                  <div className="mt-4 h-[420px] overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70">
                    <AgentPreview messages={messages} />
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-3xl bg-emerald-500/20 text-base font-semibold text-emerald-300">
                      CS
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-50">Agent Information</h3>
                      <p className="text-xs text-slate-400">Customer Support Agent • GPT-4</p>
                    </div>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <dt>Model</dt>
                      <dd className="font-medium text-slate-100">GPT-4 Turbo</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Temperature</dt>
                      <dd className="font-medium text-slate-100">0.7</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Max Tokens</dt>
                      <dd className="font-medium text-slate-100">4,000</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Response Time</dt>
                      <dd className="font-medium text-emerald-300">1.2s avg</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-50">Available MCP Tools</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-slate-300 hover:bg-slate-900"
                      onClick={syncTools}
                      disabled={isSyncingTools}
                    >
                      {isSyncingTools ? "Syncing..." : "Sync"}
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {(tools.length ? tools : []).map((tool) => (
                      <div
                        key={tool.name}
                        className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-4"
                      >
                        <p className="font-medium text-slate-100">{tool.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{tool.description}</p>
                        <p className="mt-2 text-xs text-slate-500">Type: {tool.type}</p>
                      </div>
                    ))}
                    {tools.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-400">
                        No tools connected yet. Sync to fetch the latest MCP capabilities.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                  <h3 className="text-base font-semibold text-slate-50">Session Statistics</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Messages</span>
                      <span className="font-semibold text-slate-100">{sessionStats.messages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tools Used</span>
                      <span className="font-semibold text-slate-100">{sessionStats.tools}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Response</span>
                      <span className="font-semibold text-slate-100">{sessionStats.avgResponse}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sentiment</span>
                      <span className="font-semibold text-emerald-300">{sessionStats.sentiment}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Session Time</span>
                      <span className="font-semibold text-slate-100">{sessionStats.duration}</span>
                    </div>
                  </div>
                  <Button className="mt-5 w-full rounded-full bg-blue-600 hover:bg-blue-500">
                    Export Conversation
                  </Button>
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
                      className="rounded-full border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                    >
                      <Download className="mr-2 size-4" /> Export Workflow
                    </Button>
                    <Button className="rounded-full bg-blue-600 hover:bg-blue-500">
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

          {activeTab === "create" ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                <h3 className="text-base font-semibold text-slate-50">Create Your Agent</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Follow these steps to configure an AI agent for your team.
                </p>
                <ol className="mt-5 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      1
                    </span>
                    Basic Information
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-semibold text-slate-400">
                      2
                    </span>
                    Model Selection
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-semibold text-slate-400">
                      3
                    </span>
                    MCP Tools
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-semibold text-slate-400">
                      4
                    </span>
                    System Prompt
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-semibold text-slate-400">
                      5
                    </span>
                    Test & Deploy
                  </li>
                </ol>
                <div className="mt-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-slate-100">Need Help?</p>
                  <p className="mt-2 text-slate-400">
                    Check guides or schedule time with our expert team.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full rounded-full border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
                  >
                    View Guide
                  </Button>
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-800/60 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-50">Let’s Create Your First AI Agent</h2>
                    <p className="text-sm text-slate-400">
                      Provide foundational details about your agent to get started.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                  >
                    Save Draft
                  </Button>
                </div>
                <div className="mt-6">
                  <AgentConfig />
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
