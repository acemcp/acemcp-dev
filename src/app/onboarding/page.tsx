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
import { useMCP } from "@/context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const { promptMetadata, setPromptMetadata } = useMCP();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const supabase = getSupabaseBrowserClient();
  
  
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
  const [mcpServers, setMcpServers] = useState<
    Array<{
      id: string;
      url: string;
      authHeader: string;
      authValue: string;
      showAuth: boolean;
    }>
  >([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/onboarding");
    }
  }, [user, authLoading, router]);

    useEffect(() => {
    if(promptMetadata) {
      setIdentity(promptMetadata.identity || "");
      setInstructions(promptMetadata.instructions || "");
      setTone(promptMetadata.tone || "");
    }
  }, [promptMetadata]);

  console.log("promptMetadata", promptMetadata);
  useEffect(() => {
    // Get initial prompt from URL if available
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setProjectDescription(prompt);
    }
  }, [searchParams]);

    // const { data, error } = await supabase
    //   .from('ProjectMetadata')
    //   .upsert({ id: promptMetadata.projectId, name: promptMetadata.projectName, description: promptMetadata.projectDescription})
    //   .select()

    // if (error || !data) {
    //   console.error("Supabase insert error:", error);
    //   return c.json({ error: error?.message || "Failed to insert metadata" }, 500);
    // }


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
      // const response = await fetch("/api/project/create", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     name: projectName,
      //     description: projectDescription,
      //     prompt: searchParams.get("prompt"),
      //     identity,
      //     instructions,
      //     tone,
      //   }),
      // });

    // const data1 = await response.json();
    const userDetails = await supabase.auth.getUser();
    const ownerId = userDetails.data.user?.id;
    const { data, error } = await supabase
      .from('Project')
      .upsert({ id: promptMetadata?.id, name: projectName, projectDesc: projectDescription, updatedAt: new Date().toISOString(), ownerId: ownerId })
      .eq("id", promptMetadata?.id)
      .select()

    if (error || !data) {
      console.error("Supabase insert error:", error);
    }
    setStep(2);

    } catch (error) {
      console.error("Error Updating project:", error);
      alert("Failed to Update project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    setStep(3);
  };

  const addMcpServer = () => {
    const newId = `mcp-${Date.now()}`;
    setMcpServers((prev) => [
      ...prev,
      {
        id: newId,
        url: "",
        authHeader: "Authorization",
        authValue: "",
        showAuth: false,
      },
    ]);
  };

  const removeMcpServer = (serverId: string) => {
    setMcpServers((prev) => prev.filter((server) => server.id !== serverId));
  };

  const updateMcpServer = (
    serverId: string,
    updates: Partial<{
      url: string;
      authHeader: string;
      authValue: string;
      showAuth: boolean;
    }>
  ) => {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, ...updates } : server
      )
    );
  };

  const handleDeploy = async () => {
    // if (!projectId) return;

    // Validate that at least one MCP server is configured
    if (mcpServers.length === 0) {
      alert("Please add at least one MCP server");
      return;
    }

    // Validate all servers have URLs
    const invalidServers = mcpServers.filter((server) => !server.url.trim());
    if (invalidServers.length > 0) {
      alert("Please enter a URL for all MCP servers");
      return;
    }

    setIsLoading(true);
    try {
      // Save each MCP server configuration
      for (const server of mcpServers) {
        const configJson = {
          url: server.url,
          authentication: server.showAuth
            ? {
                headerName: server.authHeader,
                headerValue: server.authValue,
              }
            : null,
        };

        await fetch("/api/mcp-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: promptMetadata?.id,
            serverUrl: server.url, // Store the URL in serverUrl column
            authHeader: server.showAuth ? server.authHeader : null,
            authToken: server.showAuth ? server.authValue : null,
            configJson,
          }),
        });
      }

      // Redirect to main dashboard
      router.push(`/?projectId=${promptMetadata?.id}`);
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
          <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900/90 via-blue-950/30 to-slate-900/90 backdrop-blur-xl shadow-2xl">
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
          <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900/90 via-blue-950/30 to-slate-900/90 backdrop-blur-xl shadow-2xl">
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
            <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900/90 via-blue-950/30 to-slate-900/90 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Server className="h-6 w-6 text-blue-400" />
                  Connect MCP Servers
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Add MCP server URLs to enhance your agent's capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add MCP Server Button */}
                {mcpServers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">
                      No MCP servers configured yet
                    </p>
                    <Button
                      onClick={addMcpServer}
                      variant="outline"
                      className="border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400"
                    >
                      <Server className="mr-2 h-4 w-4" />
                      Add MCP Server
                    </Button>
                  </div>
                )}

                {/* MCP Server Configuration Forms */}
                {mcpServers.map((server, index) => (
                  <Card
                    key={server.id}
                    className="border-blue-800/30 bg-gradient-to-br from-slate-950/50 to-blue-950/20 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          MCP Server {index + 1}
                        </span>
                        <button
                          onClick={() => removeMcpServer(server.id)}
                          className="text-slate-400 hover:text-red-400 text-2xl leading-none"
                          title="Remove server"
                        >
                          ×
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Status:</span>
                        <Badge
                          variant="outline"
                          className="border-slate-600 text-slate-400"
                        >
                          Not Connected
                        </Badge>
                      </div>

                      {/* Server URL Input */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">MCP Server URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={server.url}
                            onChange={(e) =>
                              updateMcpServer(server.id, {
                                url: e.target.value,
                              })
                            }
                            className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                            placeholder="Enter MCP server URL"
                          />
                          <Button
                            className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 hover:from-pink-500 hover:via-purple-500 hover:to-orange-400 text-white font-semibold px-8"
                            disabled={!server.url.trim()}
                          >
                            Connect
                          </Button>
                        </div>
                      </div>

                      {/* Authentication Section (Collapsible) */}
                      <div className="border border-slate-700/50 rounded-lg bg-slate-900/30">
                        <button
                          onClick={() =>
                            updateMcpServer(server.id, {
                              showAuth: !server.showAuth,
                            })
                          }
                          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-5 w-5 text-slate-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            <span className="text-slate-200 font-medium">
                              Authentication (Optional)
                            </span>
                          </div>
                          <svg
                            className={`h-5 w-5 text-slate-400 transition-transform ${
                              server.showAuth ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {server.showAuth && (
                          <div className="px-4 pb-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-slate-200">Header Name</Label>
                              <Input
                                value={server.authHeader}
                                onChange={(e) =>
                                  updateMcpServer(server.id, {
                                    authHeader: e.target.value,
                                  })
                                }
                                className="bg-slate-900/50 border-slate-700 text-white"
                                placeholder="Authorization"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-200">Bearer Value</Label>
                              <div className="relative">
                                <Input
                                  type="password"
                                  value={server.authValue}
                                  onChange={(e) =>
                                    updateMcpServer(server.id, {
                                      authValue: e.target.value,
                                    })
                                  }
                                  className="bg-slate-900/50 border-slate-700 text-white pr-10"
                                  placeholder="Enter header value (API key, token, etc.)"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Another Server Button */}
                {mcpServers.length > 0 && (
                  <Button
                    onClick={addMcpServer}
                    variant="outline"
                    className="w-full border-dashed border-blue-500/50 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Add Another MCP Server
                  </Button>
                )}
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
