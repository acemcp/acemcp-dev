"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
  X,
  Rocket,
  Gauge,
  BarChart3,
  Shield,
  Cloud,
  Loader2,
  Plus,
  FileText,
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
import { useMCP } from "@/context";
import axios from "axios";

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
    description:
      "Capture requirements with natural language briefs and templates.",
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
    description:
      "Live dashboards track latency, throughput, sentiment, and compliance in one view.",
    stat: "Unified Ops Center",
  },
  {
    icon: Shield,
    title: "Adaptive Guardrails",
    description:
      "Dynamic safety nets enforce policy, redact PII, and block escalation risks automatically.",
    stat: "Policy Engine",
  },
  {
    icon: Cloud,
    title: "Global Footprint",
    description:
      "Multi-cloud, multi-region distribution keeps workloads close to users with failover baked in.",
    stat: "14 Regions",
  },
  {
    icon: Gauge,
    title: "Performance Automation",
    description:
      "Autonomous tuning improves conversion and reduces manual prompt iteration over time.",
    stat: "Auto-Tuning",
  },
];

const customerSignals = [
  {
    icon: ShieldCheck,
    title: "Human-in-the-loop",
    description:
      "Route high-risk actions for approval with contextual snapshots and replay history.",
    metric: "12k reviews synced",
  },
  {
    icon: Workflow,
    title: "Deterministic orchestration",
    description:
      "Stateful flows, retries, and fallbacks so every task completes predictably.",
    metric: "4.8M flows executed",
  },
  {
    icon: Infinity,
    title: "Continuous learning",
    description:
      "Evaluation suites and telemetry loops keep experiences improving weekly.",
    metric: "Continuous evaluation",
  },
];

const metricsPulse = [
  { label: "Avg Build Time", value: "2m 18s" },
  { label: "Automations", value: "320+" },
  { label: "Enterprise Teams", value: "68" },
  { label: "Regions", value: "14" },
];

function LandingContent() {
  const { promptMetadata, setPromptMetadata } = useMCP();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [identity, setIdentity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("");
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const { session, isLoading, signOut } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % pipelineStages.length);
    }, 3800);
    return () => window.clearInterval(interval);
  }, []);

  // Populate prompt from URL when user returns from authentication
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt && !prompt) {
      setPrompt(urlPrompt);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    //call the api
    if (!prompt.trim()) return;
    if (!session) {
      // Not authenticated - redirect to authentication page
      // After auth, user will come back to landing page with the prompt
      const params = new URLSearchParams();
      params.set("redirectTo", "/landing");
      params.set("mode", "signin");
      params.set("prompt", prompt);
      router.push(`/authentication?${params.toString()}`);
      return;
    }
    setIsGenerating(true);
    const CreateprojectResponse = await fetch("/api/project/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: " ",
        description: " ",
        prompt: searchParams.get("prompt"),
        identity,
        instructions,
        tone,
      }),
    });
    const data = await CreateprojectResponse.json();

    let { project: { id } } = data;

    const postData = {
      text: prompt,
      projectId: id,
    };
    await axios
      .post(
        "https://acemcp-service.rushikeshpatil8208.workers.dev/template",
        postData,
      )
      .then((res) => {
        let { projectMetadata } = res.data;
        setPromptMetadata(projectMetadata[0]);
      })
      .catch((err) => { })
      .finally(() => {
        setIsGenerating(false);
      });
    //project id
    // const data = await response.json();
    // console.log(data);
    // Authenticated user - redirect to onboarding with prompt
    const params = new URLSearchParams();
    params.set("prompt", prompt)
    // router.push(`/onboarding?projectId=${id}`);
    router.push(`/onboarding?projectId=${id}&${params.toString()}`);

    // router.push(`/onboarding?${params.toString()}`);
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

  const handleDashboardClick = async () => {
    if (!session) {
      router.push("/authentication?mode=signin&redirectTo=%2Flanding");
      return;
    }

    setIsDashboardLoading(true);
    try {
      // Fetch user's projects
      const response = await fetch("/api/user/projects");
      const data = await response.json();

      if (data.success && data.projects && data.projects.length > 0) {
        // Redirect to the most recent project
        const latestProject = data.projects[0];
        router.push(`/project/${latestProject.id}`);
      } else {
        // No projects found, stay on landing or show message
        alert("You don't have any projects yet. Create one to get started!");
        setIsDashboardLoading(false);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to load your projects. Please try again.");
      setIsDashboardLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] font-sans text-white">
      {/* Full Screen Flowing Blue Gradient - Dark to Light */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base flowing gradient - Dark blue to lighter blue */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, 
                #0a0a0a 0%, 
                #0f1419 15%, 
                #1a1f2e 30%, 
                #1e2a3a 45%, 
                #243447 60%, 
                #2a3f54 75%, 
                #304a61 90%, 
                #36556e 100%
              )
            `,
          }}
        />

        {/* Complementary blue tone overlays for depth */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(30, 58, 138, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 70%, rgba(29, 78, 216, 0.35) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(30, 64, 175, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 10% 60%, rgba(31, 81, 194, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 90% 40%, rgba(28, 100, 242, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Gritty texture with blue tones only */}
        <div
          className="absolute inset-0 opacity-35 mix-blend-overlay"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.6) 1px, transparent 0),
              radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.4) 1px, transparent 0),
              radial-gradient(circle at 3px 3px, rgba(29, 78, 216, 0.3) 1px, transparent 0),
              radial-gradient(circle at 4px 4px, rgba(30, 64, 175, 0.2) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px, 30px 30px, 40px 40px, 50px 50px',
            backgroundPosition: '0 0, 10px 10px, 20px 20px, 30px 30px',
          }}
        />

        {/* Large flowing orbs - Only blue tones */}
        <div
          className="absolute top-0 left-0 w-[100vh] h-[100vh] rounded-full opacity-12 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.8) 0%, rgba(37, 99, 235, 0.3) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '12s',
            transform: 'translate(-40%, -40%)',
          }}
        />

        <div
          className="absolute top-1/4 right-0 w-[90vh] h-[90vh] rounded-full opacity-15 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(29, 78, 216, 0.7) 0%, rgba(30, 64, 175, 0.4) 35%, transparent 65%)',
            filter: 'blur(70px)',
            animationDuration: '10s',
            animationDelay: '4s',
            transform: 'translate(40%, -20%)',
          }}
        />

        <div
          className="absolute bottom-0 left-1/2 w-[120vh] h-[120vh] rounded-full opacity-10 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(31, 81, 194, 0.6) 0%, rgba(28, 100, 242, 0.3) 30%, transparent 60%)',
            filter: 'blur(90px)',
            animationDuration: '14s',
            animationDelay: '2s',
            transform: 'translate(-50%, 40%)',
          }}
        />

        {/* Additional mid-screen flowing orb */}
        <div
          className="absolute top-1/2 left-1/3 w-[80vh] h-[80vh] rounded-full opacity-8 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.5) 0%, rgba(30, 58, 138, 0.2) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '16s',
            animationDelay: '6s',
            transform: 'translate(-30%, -50%)',
          }}
        />

        {/* Enhanced grain effect with blue noise */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%231e3a8a' opacity='0.3'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Subtle blue-tinted grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      <div className="relative">
        <header className="relative border-b border-white/[0.08] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#5F96F1] to-[#2472eb] blur-sm" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5F96F1] to-[#2472eb]">
                  <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-lg font-semibold text-white">Akron</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="hidden h-9 rounded-md px-3 text-sm text-white/70 transition hover:text-white md:inline-flex"
              >
                Docs
              </Button>
              {session ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleDashboardClick}
                    disabled={isDashboardLoading}
                    className="h-9 rounded-md px-3 text-sm text-white/70 transition hover:text-white disabled:opacity-50"
                  >
                    {isDashboardLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      "Dashboard"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="h-9 rounded-md px-3 text-sm text-white/70 transition hover:text-white"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() =>
                    router.push(
                      "/authentication?mode=signin&redirectTo=%2Flanding",
                    )
                  }
                  className="h-9 rounded-md px-3 text-sm text-white/70 transition hover:text-white"
                >
                  Sign in
                </Button>
              )}
              <Button
                onClick={handlePrimaryCta}
                className="h-9 rounded-md bg-gradient-to-r from-[#5F96F1] to-[#2472eb] px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                {session ? "Continue building" : "Get started"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          {/* Hero Section - Bolt.new inspired */}
          <div className="relative flex flex-col items-center text-center">

            {/* Background AKRON text effect */}
            <div className="pointer-events-none absolute inset-x-0 -top-16 flex h-[400px] w-full items-center justify-center -z-10">
              <div className="h-full w-full max-w-4xl scale-100 mix-blend-screen opacity-30">
                <TextHoverEffect text="Akron" automatic duration={12} />
              </div>
            </div>

            {/* Badge */}
            <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Akron V1
            </div>

            {/* Main Heading - Bolt.new style */}
            <h1 className="relative z-10 mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              What will you{" "}
              <span className="bg-gradient-to-r from-[#5F96F1] to-[#2472eb] bg-clip-text text-transparent font-serif mb-1 italic">
                build
              </span>{" "}
              today?
            </h1>

            <p className="relative z-10 mb-12 max-w-2xl text-lg text-white/60 sm:text-xl">
              Create powerful MCP powered Agents by chatting with AI.
            </p>

            {/* Main Input Area - Bolt.new style */}
            <div className="relative z-10 w-full max-w-3xl">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]/80 backdrop-blur-xl">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Plus className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          event.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="Let's build an AI agent..."
                      className="w-full resize-none border-0 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Removed Figma and GitHub indicators */}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    {/* Removed import options */}
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="h-8 rounded-md bg-gradient-to-r from-[#5F96F1] to-[#2472eb] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Building...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Build now
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Feature highlights - simplified */}
            <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex flex-col items-start gap-3 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
                      <item.icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-medium text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/50">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section - Simplified */}
          <section className="mt-24">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Everything you need to build AI agents
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/60">
                From natural language to production-ready infrastructure, Akron
                handles the entire agent lifecycle.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {featureClusters.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">
                    {feature.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-white/60">
                    {feature.description}
                  </p>
                  <ul className="space-y-2 text-sm text-white/50">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-white/40" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Pipeline Section - Simplified */}
          <section className="mt-24">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      From prompt to production
                    </h3>
                    <p className="mt-2 text-white/60">
                      Follow the real-time journey as Akron assembles, deploys, and
                      optimizes your agent across the stack.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {pipelineStages.map((stage, index) => {
                      const isActive = index === activeStage;
                      return (
                        <button
                          key={stage.title}
                          type="button"
                          onMouseEnter={() => setActiveStage(index)}
                          className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-300 ${isActive
                            ? "border-[#5F96F1]/50 bg-[#5F96F1]/10"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${isActive
                                ? "bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white"
                                : "bg-white/10 text-white/70"
                                }`}
                            >
                              <stage.icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">
                                {stage.title}
                              </p>
                              <p className="text-xs text-white/50">
                                {stage.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-white/60">
                            {stage.metric}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-3">
                      <h4 className="text-lg font-medium text-white">
                        {pipelineStages[activeStage].title}
                      </h4>
                      <p className="text-sm text-white/60">
                        {pipelineStages[activeStage].detail}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {metricsPulse.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/70"
                        >
                          <p className="text-xs uppercase tracking-wide text-white/45">
                            {metric.label}
                          </p>
                          <p className="mt-1 text-base font-medium text-white">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilityShowcase.map((capability) => (
                  <div
                    key={capability.title}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
                      <capability.icon className="h-4 w-4" />
                    </div>
                    <h4 className="mb-2 text-base font-medium text-white">
                      {capability.title}
                    </h4>
                    <p className="mb-3 text-sm text-white/60">
                      {capability.description}
                    </p>
                    <div className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
                      {capability.stat}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Outcomes Section - Simplified */}
          <section className="mt-24">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Modern teams rely on Akron
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/60">
                Product, support, and operations teams deliver faster cycles
                with human-in-the-loop control and measurable gains.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {customerSignals.map((signal) => (
                <div
                  key={signal.title}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
                    <signal.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">
                    {signal.title}
                  </h3>
                  <p className="mb-3 text-sm text-white/60">
                    {signal.description}
                  </p>
                  <div className="text-sm font-medium text-white/70">
                    {signal.metric}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Integrations Section - Simplified */}
          <section className="mt-24">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Connect your entire stack
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-white/60">
                Pre-built adapters for popular tools, with type-safe clients and
                automatic credential management.
              </p>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {integrationHighlights.map((integration) => (
                <div
                  key={integration.name}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                      {integration.name}
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
                      {integration.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section - Simplified */}
          <section className="mt-24">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Start building your agent today
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-white/60">
                  Join teams shipping production AI agents with enterprise-grade
                  infrastructure and security.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={handlePrimaryCta}
                    className="h-10 rounded-md bg-gradient-to-r from-[#5F96F1] to-[#2472eb] px-6 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    {session ? "Resume your agents" : "Get started for free"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSecondaryCta}
                    variant="ghost"
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {session ? "Explore advanced flows" : "Schedule a demo"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/[0.08] backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-br from-[#5F96F1] to-[#2472eb] blur-sm" />
                  <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#5F96F1] to-[#2472eb]">
                    <Zap className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-sm font-medium text-white/80">
                  Akron
                </span>
              </div>
              <p className="text-sm text-white/40">
                © 2025 Akron. All rights reserved.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="text-white/40 transition-colors hover:text-white/70"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="text-white/40 transition-colors hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
