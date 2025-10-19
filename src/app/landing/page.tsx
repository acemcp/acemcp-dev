"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Terminal,
  Box,
  Workflow,
  ShieldCheck,
  Cpu,
  Layers,
  Orbit,
  Check,
  Infinity,
  Github,
  Twitter,
  Rocket,
  Gauge,
  BarChart3,
  Shield,
  Cloud,
} from "lucide-react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import createGlobe from "cobe";
import { motion } from "motion/react";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const suggestions = [
  "E-commerce agent with inventory automation",
  "CRM agent that enriches leads automatically",
  "Analytics agent for real-time insights",
];

const heroHighlights = [
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "SOC2 ready with secrets vaulting and granular audit trails.",
  },
  {
    icon: Rocket,
    title: "Deploy Anywhere",
    description: "One-click deployments to edge regions with smart rollouts.",
  },
  {
    icon: Infinity,
    title: "Tool-Native",
    description: "Connect any API, database, or SaaS with zero boilerplate.",
  },
];

const featureClusters = [
  {
    icon: Terminal,
    tag: "Builder",
    title: "Natural Language to Production",
    description:
      "Describe your agent and generate MCP servers with typed tools, deployments, and observability in minutes.",
    bullets: [
      "Auto-generated project structure",
      "Type-safe API adapters",
      "Live preview environments",
    ],
  },
  {
    icon: Box,
    tag: "Runtime",
    title: "Resilient Infrastructure",
    description:
      "Deploy on auto-healing infrastructure with intelligent retries, queueing, and distributed logging built-in.",
    bullets: [
      "Multi-region routing",
      "Real-time monitoring",
      "Role-based access control",
    ],
  },
  {
    icon: Workflow,
    tag: "Orchestration",
    title: "Visual Agent Workflows",
    description:
      "Compose multi-agent flows with drag-and-drop tools, human approvals, and deterministic state management.",
    bullets: [
      "Visual flow designer",
      "Human-in-the-loop checkpoints",
      "Custom webhook triggers",
    ],
  },
  {
    icon: Cpu,
    tag: "Optimization",
    title: "Continuous Improvement",
    description:
      "Automate prompt tuning, evaluation, and learning from production feedback with guardrails applied.",
    bullets: [
      "Automated regression testing",
      "Policy-based guardrails",
      "Warehouse-ready exports",
    ],
  },
];

const integrationHighlights = [
  { name: "Notion", category: "Knowledge" },
  { name: "Salesforce", category: "CRM" },
  { name: "Slack", category: "Collaboration" },
  { name: "Postgres", category: "Data" },
  { name: "Zendesk", category: "Support" },
  { name: "Custom REST", category: "Adapter" },
];

const pipelineStages = [
  {
    icon: Sparkles,
    title: "Blueprint",
    description: "Capture requirements with natural language briefs and templates.",
    detail:
      "Outline responsibilities, guardrails, and data connections in minutes with collaborative drafting.",
    metric: "3 min setup",
  },
  {
    icon: Terminal,
    title: "Generate",
    description: "Compile ready-to-run MCP servers with typed tools instantly.",
    detail:
      "Adapters, secrets, and deployment configs ship out of the box with infrastructure-as-code.",
    metric: "Zero boilerplate",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Deploy globally with built-in observability and governance.",
    detail:
      "Edge deployments auto-scale, route intelligently, and keep telemetry flowing into your warehouse.",
    metric: "One-click deploy",
  },
  {
    icon: Cpu,
    title: "Optimize",
    description: "Continuously evaluate, A/B test, and improve performance.",
    detail:
      "Feedback, evaluation suites, and regression tracking keep agents improving safely in production.",
    metric: "+18% success",
  },
];

const capabilityShowcase = [
  {
    icon: BarChart3,
    title: "Realtime Monitoring",
    description: "Live dashboards track latency, throughput, sentiment, and compliance in one view.",
    stat: "Unified Ops Center",
  },
  {
    icon: Shield,
    title: "Adaptive Guardrails",
    description: "Dynamic safety nets enforce policy, redact PII, and block escalation risks automatically.",
    stat: "Policy Engine",
  },
  {
    icon: Cloud,
    title: "Global Footprint",
    description: "Multi-cloud, multi-region distribution keeps workloads close to users with failover baked in.",
    stat: "14 Regions",
  },
  {
    icon: Gauge,
    title: "Performance Automation",
    description: "Autonomous tuning improves conversion and reduces manual prompt iteration over time.",
    stat: "Auto-Tuning",
  },
];

const customerSignals = [
  {
    icon: ShieldCheck,
    title: "Human-in-the-loop",
    description: "Route high-risk actions for approval with contextual snapshots and replay history.",
    metric: "12k reviews synced",
  },
  {
    icon: Workflow,
    title: "Deterministic orchestration",
    description: "Stateful flows, retries, and fallbacks so every task completes predictably.",
    metric: "4.8M flows executed",
  },
  {
    icon: Infinity,
    title: "Continuous learning",
    description: "Evaluation suites and telemetry loops keep experiences improving weekly.",
    metric: "Continuous evaluation",
  },
];

const metricsPulse = [
  { label: "Avg Build Time", value: "2m 18s" },
  { label: "Automations", value: "320+" },
  { label: "Enterprise Teams", value: "68" },
  { label: "Regions", value: "14" },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const { session, isLoading, signOut } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % pipelineStages.length);
    }, 3800);
    return () => window.clearInterval(interval);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    if (!session) {
      const params = new URLSearchParams();
      params.set("redirectTo", "/landing");
      params.set("mode", "signin");
      params.set("prompt", prompt);
      router.push(`/authentication?${params.toString()}`);
      return;
    }

    setIsGenerating(true);
    window.setTimeout(() => setIsGenerating(false), 2000);
  };

  const handlePrimaryCta = () => {
    if (session) {
      router.push("/generate");
      return;
    }

    const params = new URLSearchParams();
    params.set("redirectTo", "/generate");
    router.push(`/authentication?${params.toString()}`);
  };

  const handleSecondaryCta = () => {
    if (session) {
      router.push("/advanced-agentic-loop");
      return;
    }

    const params = new URLSearchParams();
    params.set("redirectTo", "/advanced-agentic-loop");
    router.push(`/authentication?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/12 blur-[150px]" />
        <div className="absolute right-0 top-1/4 h-[460px] w-[460px] translate-x-1/4 rounded-full bg-sky-500/12 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] -translate-x-1/4 translate-y-1/3 rounded-full bg-blue-600/25 blur-[120px]" />
        <div
          className="absolute left-1/3 top-1/3 h-[300px] w-[300px] animate-[pulse_4s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/25 blur-3xl"
        />
        <div
          className="absolute right-1/4 top-2/3 h-[260px] w-[260px] animate-[pulse_5s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-sky-500/25 to-blue-500/25 blur-3xl"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="relative">
        <header className="border-b border-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 blur-md" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
                  <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="hidden h-10 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white md:inline-flex"
              >
                Documentation
              </Button>
              {session ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/generate")}
                    className="h-10 rounded-lg px-4 text-sm text-white/80 transition hover:text-white"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="h-10 rounded-lg px-4 text-sm text-white/80 transition hover:text-white"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/authentication?mode=signin&redirectTo=%2Flanding")}
                  className="h-10 rounded-lg px-4 text-sm text-white/80 transition hover:text-white"
                >
                  Sign in
                </Button>
              )}
              <Button
                onClick={handlePrimaryCta}
                className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 shadow-[0_24px_60px_-30px_rgba(59,130,246,0.85)] transition hover:bg-white/90"
              >
                {session ? "Continue building" : "Get started"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-2 py-20 lg:px-8 lg:py-28">
          <div className="relative z-2 flex flex-col items-center text-center pt-4 md:pt-20">
            <div className="pointer-events-none absolute inset-x-0 -top-24 flex h-[520px] w-full items-center justify-center -z-10 md:-top-32">
              <div className="h-full w-full max-w-6xl scale-100 mix-blend-screen opacity-100">
                <TextHoverEffect text="AceMCP" automatic duration={12} />
              </div>
            </div>
            {/* <Badge className="flex items-center gap-2 border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Model Context Protocol
            </Badge> */}

            <h1 className="mt-10 font-sans text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Generate MCP-powered
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-cyan-200 bg-clip-text text-transparent">
                AI agents in seconds
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
              Describe your agent once. Get production-grade MCP servers with orchestration, monitoring, and enterprise security automatically.
            </p>

            <div className="relative mt-12 w-full max-w-3xl">
              <div className="absolute -inset-[1px] animate-[pulse_3s_ease-in-out_infinite] rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 opacity-75 blur-sm" />
              <div className="relative rounded-2xl border border-white/10 bg-black/50 p-1 shadow-2xl backdrop-blur-2xl">
                <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="Describe your AI agent... e.g., 'Build a customer support agent that handles tickets, emails, and Slack messages with sentiment analysis'"
                    className="min-h-[140px] resize-none border-0 bg-transparent text-base text-white/90 placeholder:text-white/45 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-white/45">
                      <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono">⌘</kbd>
                      <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono">Enter</kbd>
                      <span>to generate</span>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="h-auto rounded-lg border border-white/10 bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white disabled:opacity-50 disabled:hover:border-white/10"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Generate Agent
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  type="button"
                  className="rounded-full border border-white/10 bg-black px-4 py-2 text-sm text-white backdrop-blur-xl transition hover:border-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.05] hover:shadow-[0_30px_90px_-50px_rgba(59,130,246,0.9)]"
                >
                  <div className="flex flex-col items-start gap-4 text-left">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 via-sky-500/20 to-cyan-500/25 text-white">
                      <item.icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-white/60">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          

          <section className="mt-32">
            <div className="flex flex-col items-center text-center">
              <Badge className="mb-6 flex items-center gap-2 border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-xl">
                <Layers className="h-4 w-4" /> Features
              </Badge>
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Everything you need to build AI agents
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                From natural language to production-ready infrastructure, AceMCP handles the entire agent lifecycle.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featureClusters.map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_30px_90px_-50px_rgba(59,130,246,0.85)]"
                >
                  <CardHeader className="gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition duration-500 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:via-sky-500 group-hover:to-cyan-500">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <Badge className="border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white/70">
                        {feature.tag}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-white/65">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-white/70">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-32 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-sky-500/5 to-cyan-500/10" />
              <div className="relative flex flex-col gap-6">
                <Badge className="w-fit border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/75">
                  Animated pipeline
                </Badge>
                <h3 className="text-3xl font-bold text-white">From prompt to production</h3>
                <p className="text-white/65">
                  Follow the real-time journey as AceMCP assembles, deploys, and optimizes your agent across the stack.
                </p>
                <div className="space-y-4">
                  {pipelineStages.map((stage, index) => {
                    const isActive = index === activeStage;
                    return (
                      <button
                        key={stage.title}
                        type="button"
                        onMouseEnter={() => setActiveStage(index)}
                        className={`group flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-500 ${
                          isActive
                            ? "border-blue-400/70 bg-blue-500/10 shadow-[0_30px_100px_-60px_rgba(59,130,246,0.9)]"
                            : "border-white/10 bg-white/5 hover:border-blue-400/40 hover:bg-blue-500/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex size-11 items-center justify-center rounded-xl transition-all duration-500 ${
                              isActive
                                ? "bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 text-white"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            <stage.icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">{stage.title}</p>
                            <p className="text-xs text-white/55">{stage.description}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-white/60">{stage.metric}</span>
                      </button>
                    );
                  })}
                </div>
                <Card className="relative border border-white/10 bg-white/[0.05] shadow-none">
                  <CardHeader className="gap-3">
                    <Badge className="w-fit border-white/15 bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                      Live preview
                    </Badge>
                    <CardTitle className="text-2xl text-white">
                      {pipelineStages[activeStage].title}
                    </CardTitle>
                    <CardDescription className="text-white/65">
                      {pipelineStages[activeStage].detail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    {metricsPulse.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/70"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-white/45">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilityShowcase.map((capability) => (
                <Card
                  key={capability.title}
                  className="group overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_30px_100px_-60px_rgba(59,130,246,0.8)]"
                >
                  <CardHeader className="gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition duration-500 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:via-sky-500 group-hover:to-cyan-500">
                      <capability.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl text-white">{capability.title}</CardTitle>
                    <CardDescription className="text-white/65">
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                      {capability.stat}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-32 space-y-12">
            <div className="flex flex-col items-center text-center">
              <Badge className="mb-6 flex items-center gap-2 border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-xl">
                <Layers className="h-4 w-4" /> Outcomes
              </Badge>
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Modern teams rely on AceMCP
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Product, support, and operations teams deliver faster cycles with human-in-the-loop control and measurable gains.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {customerSignals.map((signal) => (
                <Card
                  key={signal.title}
                  className="group relative overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_35px_110px_-60px_rgba(59,130,246,0.85)]"
                >
                  <CardHeader className="gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white transition duration-500 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:via-sky-500 group-hover:to-cyan-500">
                      <signal.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl text-white">{signal.title}</CardTitle>
                    <CardDescription className="text-white/65">
                      {signal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium text-white/70">
                      {signal.metric}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-32">
            <div className="flex flex-col items-center text-center">
              <Badge className="mb-6 flex items-center gap-2 border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-xl">
                <Layers className="h-4 w-4" /> Integrations
              </Badge>
              <h2 className="text-4xl font-bold text-white sm:text-5xl">
                Connect your entire stack
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/65">
                Pre-built adapters for popular tools, with type-safe clients and automatic credential management.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {integrationHighlights.map((integration) => (
                <div
                  key={integration.name}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_30px_100px_-60px_rgba(59,130,246,0.85)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{integration.name}</span>
                    <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/70">
                      {integration.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-32">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-12 backdrop-blur-2xl">
              <div className="absolute right-0 top-0 h-[380px] w-[380px] translate-x-1/4 -translate-y-1/4 rounded-full bg-sky-500/25 blur-3xl" />
              <div className="relative flex flex-col items-center text-center">
                <Badge className="mb-6 flex items-center gap-2 border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" /> Ready to ship
                </Badge>
                <h2 className="text-4xl font-bold text-white sm:text-5xl">
                  Start building your agent today
</h2>
                <p className="mt-4 max-w-2xl text-lg text-white/70">
                  Join teams shipping production AI agents with enterprise-grade infrastructure and security.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handlePrimaryCta}
                    className="h-auto rounded-lg border border-white/10 bg-black px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                  >
                    {session ? "Resume your agents" : "Get started for free"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    onClick={handleSecondaryCta}
                    variant="ghost"
                    className="h-auto rounded-lg border border-white/10 bg-black px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
                  >
                    {session ? "Explore advanced flows" : "Schedule a demo"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 blur-sm" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
                    <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white/85">AceMCP</span>
              </div>
              <p className="text-sm text-white/45">© 2025 AceMCP. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-white/45 transition-colors hover:text-white">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/45 transition-colors hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
