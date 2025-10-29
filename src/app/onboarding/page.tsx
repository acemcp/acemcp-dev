"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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



function OnboardingContent() {
  const { promptMetadata, setPromptMetadata } = useMCP();



   let {projectId} =  useParams()
   console.log("projectId",projectId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const supabase = getSupabaseBrowserClient();


  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Project metadata
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [identity, setIdentity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("");
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/onboarding");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (promptMetadata) {
      setIdentity(promptMetadata.identity || "");
      setInstructions(promptMetadata.instructions || "");
      setTone(promptMetadata.tone || "");
    }
  }, [promptMetadata]);


  useEffect(() => {
    // Get initial prompt from URL if available
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setProjectDescription(prompt);
    }
  }, [searchParams]);


  // Add this helper function to validate MCP servers
  async function validateMCPServer(
    url: string,
    authHeader?: string,
    authValue?: string
  ): Promise<{
    isValid: boolean;
    error?: string;
    tools?: any[];
    serverInfo?: any;
  }> {
    try {
      // Create headers object
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth header if provided
      if (authHeader && authValue) {
        headers[authHeader] = authValue.startsWith("Bearer ")
          ? authValue
          : `Bearer ${authValue}`;
      }

      // First, try to connect to the MCP server
      const response = await fetch("/api/validate-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverUrl: url,
          authHeader: authHeader || null,
          authToken: authValue || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isValid: false,
          error: data.error || "Failed to connect to MCP server",
        };
      }

      return {
        isValid: true,
        tools: data.tools,
        serverInfo: data.serverInfo,
      };
    } catch (error) {
      console.error("MCP validation error:", error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  // Update the MCP server state to include validation status
  type MCPServerConfig = {
    id: string;
    url: string;
    authHeader: string;
    authValue: string;
    showAuth: boolean;
    isValidating: boolean;
    isValid: boolean | null;
    validationError?: string;
    tools?: any[];
    serverInfo?: any;
  };

  // In your component, update the state type:

  // Update the addMcpServer function:
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
        isValidating: false,
        isValid: null,
        validationError: undefined,
        tools: undefined,
        serverInfo: undefined,
      },
    ]);
  };

  // Add validation handler:
  const validateServer = async (serverId: string) => {
    const server = mcpServers.find((s) => s.id === serverId);
    if (!server || !server.url.trim()) {
      alert("Please enter a server URL first");
      return;
    }

    // Set validating state
    updateMcpServer(serverId, { isValidating: true, isValid: null });

    // Perform validation
    const result = await validateMCPServer(
      server.url,
      server.showAuth ? server.authHeader : undefined,
      server.showAuth ? server.authValue : undefined
    );

    // Update server with validation results
    updateMcpServer(serverId, {
      isValidating: false,
      isValid: result.isValid,
      validationError: result.error,
      tools: result.tools,
      serverInfo: result.serverInfo,
    });
  };

  // Update the updateMcpServer function to handle new fields:
  const updateMcpServer = (
    serverId: string,
    updates: Partial<MCPServerConfig>
  ) => {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === serverId ? { ...server, ...updates } : server
      )
    );
  };

  // Update the handleDeploy validation:
  const handleDeploy = async () => {
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

    // Check if all servers are validated
    const unvalidatedServers = mcpServers.filter(
      (server) => server.isValid !== true
    );
    if (unvalidatedServers.length > 0) {
      const proceed = confirm(
        `${unvalidatedServers.length} server(s) haven't been validated. Do you want to continue anyway?`
      );
      if (!proceed) return;
    }

    // Check for failed validations
    const failedServers = mcpServers.filter((server) => server.isValid === false);
    if (failedServers.length > 0) {
      const proceed = confirm(
        `${failedServers.length} server(s) failed validation. Do you want to continue anyway?`
      );
      if (!proceed) return;
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
          validationResult: {
            isValid: server.isValid,
            tools: server.tools,
            serverInfo: server.serverInfo,
          },
        };

        await fetch("/api/mcp-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: promptMetadata?.id,
            serverUrl: server.url,
            authHeader: server.showAuth ? server.authHeader : null,
            authToken: server.showAuth ? server.authValue : null,
            configJson,
          }),
        });
      }

      // Redirect to main dashboard
      router.replace(`project/${promptMetadata?.id}`);
    } catch (error) {
      console.error("Error deploying:", error);
      alert("Failed to deploy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    setIsLoading(true);
    try {
      // Sync user first
      await fetch("/api/user/sync", { method: "POST" });

      // const data1 = await response.json();
      const userDetails = await supabase.auth.getUser();
      const ownerId = userDetails.data.user?.id;
      const { data, error } = await supabase
        .from('Project')
        .upsert({ id: promptMetadata?.id, name: projectName, projectDesc: projectDescription, updatedAt: new Date().toISOString(), ownerId: ownerId })
        .eq("id", promptMetadata?.id)
        .select()



        console.log("data",data);
        
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
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step >= stepNum
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
                    className={`w-16 h-0.5 ${step > stepNum ? "bg-blue-500" : "bg-slate-700"
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
                    Creating...
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

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
                      Saving...
                      <Loader2 className="mr-2 h-4 w-4 animate-spin " />
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

            // Replace the MCP Server Card JSX in your component

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
                      {/* Status Badge with Validation State */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Status:</span>
                        {server.isValidating ? (
                          <Badge
                            variant="outline"
                            className="border-yellow-600 text-yellow-400 bg-yellow-500/10"
                          >
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Validating...
                          </Badge>
                        ) : server.isValid === true ? (
                          <Badge
                            variant="outline"
                            className="border-green-600 text-green-400 bg-green-500/10"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Validated
                          </Badge>
                        ) : server.isValid === false ? (
                          <Badge
                            variant="outline"
                            className="border-red-600 text-red-400 bg-red-500/10"
                          >
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Invalid
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-slate-600 text-slate-400"
                          >
                            Not Validated
                          </Badge>
                        )}
                      </div>

                      {/* Server URL Input */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">MCP Server URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={server.url}
                            onChange={(e) => {
                              updateMcpServer(server.id, {
                                url: e.target.value,
                                isValid: null, // Reset validation when URL changes
                                validationError: undefined,
                              });
                            }}
                            className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                            placeholder="https://your-mcp-server.com/mcp"
                          />
                          <Button
                            onClick={() => validateServer(server.id)}
                            className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 hover:from-pink-500 hover:via-purple-500 hover:to-orange-400 text-white font-semibold px-8"
                            disabled={!server.url.trim() || server.isValidating}
                          >
                            {server.isValidating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validating
                              </>
                            ) : (
                              "Validate"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Validation Error Message */}
                      {server.validationError && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                          <div className="flex items-start gap-2">
                            <svg
                              className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-400">
                                Validation Failed
                              </p>
                              <p className="text-xs text-red-300 mt-1">
                                {server.validationError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success Message with Tools */}
                      {server.isValid && server.tools && (
                        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-400">
                                Server Validated Successfully
                              </p>
                              <p className="text-xs text-green-300 mt-1">
                                Found {server.tools.length} tool(s)
                              </p>
                              {server.tools.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {server.tools.slice(0, 5).map((tool: any, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="border-green-600/50 text-green-400 bg-green-500/5 text-xs"
                                    >
                                      {tool.name}
                                    </Badge>
                                  ))}
                                  {server.tools.length > 5 && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-600/50 text-green-400 bg-green-500/5 text-xs"
                                    >
                                      +{server.tools.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

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
                            className={`h-5 w-5 text-slate-400 transition-transform ${server.showAuth ? "rotate-180" : ""
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
                                onChange={(e) => {
                                  updateMcpServer(server.id, {
                                    authHeader: e.target.value,
                                    isValid: null, // Reset validation when auth changes
                                  });
                                }}
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
                                  onChange={(e) => {
                                    updateMcpServer(server.id, {
                                      authValue: e.target.value,
                                      isValid: null, // Reset validation when auth changes
                                    });
                                  }}
                                  className="bg-slate-900/50 border-slate-700 text-white pr-10"
                                  placeholder="Enter bearer token"
                                />
                              </div>
                              <p className="text-xs text-slate-400">
                                Token will be sent as: {server.authHeader}:{" "}
                                {server.authValue ? "Bearer ***" : "Bearer <token>"}
                              </p>
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
                    Deploying...
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
