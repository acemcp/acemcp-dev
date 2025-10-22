"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Github,
  MessageSquare,
  Database,
  Mail,
  Calendar,
  FileText,
  Cloud,
  Code,
  Zap,
  CheckCircle2,
  ArrowRight,
  Server,
} from "lucide-react";

// Popular MCP Servers from the ecosystem
const POPULAR_MCP_SERVERS = [
  {
    id: "github",
    name: "GitHub",
    description: "Access repositories, issues, PRs, and code search",
    icon: Github,
    category: "Development",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
    },
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send messages, manage channels, and read conversations",
    icon: MessageSquare,
    category: "Communication",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: { SLACK_BOT_TOKEN: "", SLACK_TEAM_ID: "" },
    },
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Query and manage PostgreSQL databases",
    icon: Database,
    category: "Database",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: { POSTGRES_CONNECTION_STRING: "" },
    },
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read, send, and manage emails",
    icon: Mail,
    category: "Communication",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gmail"],
      env: { GMAIL_CREDENTIALS: "" },
    },
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Manage events and schedules",
    icon: Calendar,
    category: "Productivity",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-calendar"],
      env: { GOOGLE_CALENDAR_CREDENTIALS: "" },
    },
  },
  {
    id: "notion",
    name: "Notion",
    description: "Access and manage Notion pages and databases",
    icon: FileText,
    category: "Productivity",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-notion"],
      env: { NOTION_API_KEY: "" },
    },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Access and manage files in Google Drive",
    icon: Cloud,
    category: "Storage",
    configTemplate: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: { GOOGLE_DRIVE_CREDENTIALS: "" },
    },
  },
  {
    id: "custom",
    name: "Custom Server",
    description: "Add your own MCP server configuration",
    icon: Code,
    category: "Custom",
    configTemplate: {
      command: "",
      args: [],
      env: {},
    },
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Project metadata
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [identity, setIdentity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("");

  // MCP Server selection
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [mcpConfigString, setMcpConfigString] = useState("");
  const [customServers, setCustomServers] = useState<
    Array<{ id: string; name: string; config: any }>
  >([
    {
      id: "custom-1",
      name: "Custom Server 1",
      config: { command: "", args: [], env: {} },
    },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/onboarding");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Get initial prompt from URL if available
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setProjectDescription(prompt);
    }
  }, [searchParams]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    setIsLoading(true);
    try {
      // Sync user first
      await fetch("/api/user/sync", { method: "POST" });

      // Create project
      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          prompt: searchParams.get("prompt"),
          identity,
          instructions,
          tone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProjectId(data.project.id);
        setStep(2);
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          identity,
          instructions,
          tone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
      } else {
        alert(data.error || "Failed to update metadata");
      }
    } catch (error) {
      console.error("Error updating metadata:", error);
      alert("Failed to update metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServer = (serverId: string) => {
    setSelectedServers((prev) =>
      prev.includes(serverId)
        ? prev.filter((id) => id !== serverId)
        : [...prev, serverId]
    );
  };

  const addCustomServer = () => {
    const newId = `custom-${Date.now()}`;
    setCustomServers((prev) => [
      ...prev,
      {
        id: newId,
        name: `Custom Server ${prev.length + 1}`,
        config: { command: "", args: [], env: {} },
      },
    ]);
  };

  const removeCustomServer = (serverId: string) => {
    setCustomServers((prev) => prev.filter((server) => server.id !== serverId));
  };

  const updateCustomServer = (
    serverId: string,
    updates: Partial<{ name: string; config: any }>
  ) => {
    setCustomServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, ...updates } : server
      )
    );
  };

  const handleDeploy = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // Build MCP config from selected servers and custom servers
      const mcpServers: any = {};

      // Add selected popular servers
      selectedServers.forEach((serverId) => {
        const server = POPULAR_MCP_SERVERS.find((s) => s.id === serverId);
        if (server && server.id !== "custom") {
          mcpServers[serverId] = server.configTemplate;
        }
      });

      // Add custom servers
      customServers.forEach((server) => {
        mcpServers[server.id] = server.config;
      });

      // Merge with manual MCP config if provided
      let finalConfig = { mcpServers };
      if (mcpConfigString.trim()) {
        try {
          const manualConfig = JSON.parse(mcpConfigString);
          finalConfig = { ...finalConfig, ...manualConfig };
        } catch (parseError) {
          alert("Invalid MCP configuration JSON");
          setIsLoading(false);
          return;
        }
      }

      // Save MCP config
      await fetch("/api/mcp-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mcpString: JSON.stringify(finalConfig),
          authToken: "",
          configJson: finalConfig,
        }),
      });

      // Redirect to main dashboard
      router.push(`/?projectId=${projectId}`);
    } catch (error) {
      console.error("Error deploying:", error);
      alert("Failed to deploy");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to Akron
          </h1>
          <p className="text-lg text-slate-400">
            Let's set up your AI agent in 3 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step >= stepNum
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-500"
                  }`}
                >
                  {step > stepNum ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-0.5 ${
                      step > stepNum ? "bg-blue-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Metadata */}
        {step === 1 && (
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Project Details
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tell us about your AI agent project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-slate-200">
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Customer Support Agent"
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-slate-200">
                  Description
                </Label>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="What does this agent do?"
                  className="bg-slate-950 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="identity" className="text-slate-200">
                    Agent Identity
                  </Label>
                  <Input
                    id="identity"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="e.g., Helpful customer service assistant"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-slate-200">
                    Tone
                  </Label>
                  <Input
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g., Professional and friendly"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-slate-200">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Specific instructions for the agent..."
                  className="bg-slate-950 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleCreateProject}
                disabled={isLoading || !projectName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Edit Metadata */}
        {step === 2 && (
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Review & Edit Metadata
              </CardTitle>
              <CardDescription className="text-slate-400">
                Fine-tune your project configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-200">Project Name</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Tone</Label>
                  <Input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Description</Label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Agent Identity</Label>
                <Input
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Instructions</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-700 bg-slate-950 text-white hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpdateMetadata}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: MCP Servers & Deploy */}
        {step === 3 && (
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Server className="h-6 w-6" />
                  Connect MCP Servers
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Select integrations to enhance your agent's capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Three equal-width boxes */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Box 1: Popular Integrations */}
                  <div className="border border-slate-700 rounded-xl p-4 bg-slate-950">
                    <h3 className="text-sm font-medium text-slate-200 mb-3">
                      Popular Integrations
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {POPULAR_MCP_SERVERS.filter(
                        (server) => server.id !== "custom"
                      ).map((server) => {
                        const Icon = server.icon;
                        const isSelected = selectedServers.includes(server.id);

                        return (
                          <div
                            key={server.id}
                            className="group relative"
                            title={server.name}
                          >
                            <button
                              onClick={() => toggleServer(server.id)}
                              disabled
                              className={`w-full p-4 rounded-xl border-2 transition-all cursor-not-allowed opacity-60 ${
                                isSelected
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              <div className="flex items-center justify-center h-full">
                                <div className="p-3 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
                                  <Icon className="h-6 w-6 text-slate-400" />
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xs text-slate-500">
                        Coming soon
                      </span>
                    </div>
                  </div>

                  {/* Box 2: Custom Server */}
                  <div className="border border-slate-700 rounded-xl p-4 bg-slate-950 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 rounded-xl bg-slate-800">
                        <Code className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium mb-1">
                          Custom Server
                        </p>
                        <p className="text-xs text-slate-400">
                          Add a custom configuration
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Box 3: Add Another */}
                  <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 bg-slate-950 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <button
                        onClick={addCustomServer}
                        className="w-full h-20 flex items-center justify-center hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-2">
                            <span className="text-6xl text-slate-400 group-hover:text-blue-400">
                              +
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 group-hover:text-blue-400 font-medium">
                            Add Another
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Server Configuration Forms */}
                {customServers.map((server) => (
                  <Card
                    key={server.id}
                    className="border-slate-700 bg-slate-950"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white flex items-center justify-between">
                        {server.name}
                        {customServers.length > 1 && (
                          <button
                            onClick={() => removeCustomServer(server.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-200">Server Name</Label>
                          <Input
                            value={server.name}
                            onChange={(e) =>
                              updateCustomServer(server.id, {
                                name: e.target.value,
                              })
                            }
                            className="bg-slate-900 border-slate-700 text-white"
                            placeholder="My Custom Server"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-200">Command</Label>
                          <Input
                            value={server.config.command}
                            onChange={(e) =>
                              updateCustomServer(server.id, {
                                config: {
                                  ...server.config,
                                  command: e.target.value,
                                },
                              })
                            }
                            className="bg-slate-900 border-slate-700 text-white"
                            placeholder="npx"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">
                          Arguments (comma-separated)
                        </Label>
                        <Input
                          value={server.config.args.join(", ")}
                          onChange={(e) =>
                            updateCustomServer(server.id, {
                              config: {
                                ...server.config,
                                args: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              },
                            })
                          }
                          className="bg-slate-900 border-slate-700 text-white"
                          placeholder="-y, @modelcontextprotocol/server-github"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">
                          Environment Variables (JSON)
                        </Label>
                        <Textarea
                          value={JSON.stringify(server.config.env, null, 2)}
                          onChange={(e) => {
                            try {
                              const env = JSON.parse(e.target.value);
                              updateCustomServer(server.id, {
                                config: { ...server.config, env },
                              });
                            } catch {
                              // Invalid JSON, don't update
                            }
                          }}
                          className="bg-slate-900 border-slate-700 text-white font-mono text-sm min-h-[80px]"
                          placeholder='{"API_KEY": "your-key"}'
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  MCP Server Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Paste your MCP servers config JSON (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={mcpConfigString}
                  onChange={(e) => setMcpConfigString(e.target.value)}
                  placeholder={`{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    }
  }
}`}
                  className="bg-slate-950 border-slate-700 text-white font-mono text-sm min-h-[200px]"
                />
                <p className="text-xs text-slate-500">
                  This configuration will be securely stored and used to connect
                  your MCP servers.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-950 text-white hover:bg-slate-800"
              >
                Back
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Deploy & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
