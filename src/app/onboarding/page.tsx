"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  Zap,
  CheckCircle2,
  Server,
} from "lucide-react";
import { useMCP } from "@/context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProjectPageProps = {
  projectId: string | null;
};

function OnboardingContent() {

  const searchParams = useSearchParams()
  
    const search  :any= searchParams.get('projectId')

  console.log("projectId in ",search);

  


  const router = useRouter();
  
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
    console.log("projectDescription in useEffect ",projectDescription);
  console.log("identity" , identity);
  console.log("instructions" , instructions);
  console.log("tone" , tone);
    
  }, [projectDescription, identity, instructions, tone])
  
useEffect(() => {
const fetchMetaData = async() => {
  let { data: ProjectMetadata, error } = await supabase
  .from('ProjectMetadata')
  .select('*')
 .eq('id', search)


 console.log("ProjectMetadata in effect ", ProjectMetadata);
 return ProjectMetadata
}

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/onboarding");
    }
  }, [user, authLoading, router]);



let [metaData]  :any= fetchMetaData()
setIdentity(metaData[0]?.identity || "")
setInstructions(metaData[0]?.instructions || "")
setTone(metaData[0]?.tone || "")

}, [search]);
  



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

  // Placeholder function - not implementing functionality as instructed
  const removeMcpServer = (serverId: string) => {
    // Placeholder - functionality not implemented as per instructions
    console.log("Remove server functionality not implemented:", serverId);
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
            projectId: search,
            serverUrl: server.url,
            authHeader: server.showAuth ? server.authHeader : null,
            authToken: server.showAuth ? server.authValue : null,
            configJson,
          }),
        });
      }

      // Redirect to main dashboard
      router.replace(`project/${search}`);
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
        .upsert({ id: search, name: projectName, projectDesc: projectDescription, updatedAt: new Date().toISOString(), ownerId: ownerId })
        .eq("id", search)
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


  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0c] font-sans text-white">
      {/* Perplexity-style dark background with subtle gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base dark background similar to Perplexity */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, 
                #0c0c0c 0%, 
                #111111 20%, 
                #151515 40%, 
                #181818 60%, 
                #1a1a1a 80%, 
                #1c1c1c 100%
              )
            `,
          }}
        />

        {/* Subtle brand color accents */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse at 10% 10%, rgba(95, 150, 241, 0.08) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 20%, rgba(95, 150, 241, 0.06) 0%, transparent 35%),
              radial-gradient(ellipse at 30% 80%, rgba(95, 150, 241, 0.05) 0%, transparent 30%),
              radial-gradient(ellipse at 80% 90%, rgba(95, 150, 241, 0.04) 0%, transparent 25%)
            `,
          }}
        />



        {/* Subtle floating orbs with brand color */}
        <div
          className="absolute top-1/4 left-1/4 w-[60vh] h-[60vh] rounded-full opacity-[0.03] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(95, 150, 241, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '15s',
          }}
        />

        <div
          className="absolute bottom-1/3 right-1/3 w-[50vh] h-[50vh] rounded-full opacity-[0.02] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(95, 150, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animationDuration: '18s',
            animationDelay: '5s',
          }}
        />

        {/* Fine noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* AKRON Logo */}
        <div className="mb-8 flex items-center gap-3">
          <img 
            src="/akronai.svg" 
            alt="Akron AI" 
            className="h-12 w-auto"
          />
          <span className="text-3xl font-bold text-white">akron</span>
        </div>

        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3 text-white">
              Welcome to Akron
            </h1>
            <p className="text-lg text-white/60">
              Let's set up your AI agent in 3 simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all font-semibold ${step >= stepNum
                      ? "border-[#5F96F1] bg-[#5F96F1] text-white"
                      : "border-white/20 bg-transparent text-white/40"
                      }`}
                  >
                    {step > stepNum ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-0.5 transition-all ${step > stepNum ? "bg-[#5F96F1]" : "bg-white/20"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Project Metadata */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white/90 mb-4">
                  Project Details
                </h2>
                <p className="text-white/60">
                  Tell us about your AI agent project
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Customer Support Agent"
                    className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Description</Label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What does this agent do?"
                    className="min-h-[100px] rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/80 font-medium">Agent Identity</Label>
                    <Input
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder="e.g., Helpful customer service assistant"
                      className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white/80 font-medium">Tone</Label>
                    <Input
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      placeholder="e.g., Professional and friendly"
                      className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Specific instructions for the agent..."
                    className="min-h-[120px] rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base resize-none"
                  />
                </div>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleCreateProject}
                disabled={isLoading || !projectName.trim()}
                className="w-full h-14 justify-center bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Edit Metadata */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Question */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white/90 mb-4">
                  Tell us about your project
                </h2>
                <p className="text-white/60">
                  Help us understand what you're building
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Project Name</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter your project name"
                    className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Description</Label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="What does this project do?"
                    className="min-h-[100px] rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-white/80 font-medium">Agent Identity</Label>
                    <Input
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder="e.g., Helpful assistant"
                      className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white/80 font-medium">Tone</Label>
                    <Input
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      placeholder="e.g., Professional and friendly"
                      className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white/80 font-medium">Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Specific instructions for the agent..."
                    className="min-h-[120px] rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base resize-none"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white/90 hover:bg-[#333333] hover:border-white/25 transition-all duration-200 backdrop-blur-sm font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpdateMetadata}
                  disabled={isLoading}
                  className="flex-1 h-12 justify-center bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: MCP Servers & Deploy */}
          {step === 3 && (
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white/90 mb-4 flex items-center justify-center gap-3">
                  <Server className="h-7 w-7 text-[#5F96F1]" />
                  Connect MCP Servers
                </h2>
                <p className="text-white/60">
                  Add MCP server URLs to enhance your agent's capabilities
                </p>
              </div>

              {/* MCP Servers Container */}
              <div className="space-y-6">
                {/* Add MCP Server Button */}
                {mcpServers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-4">
                        <Server className="h-8 w-8 text-white/40" />
                      </div>
                      <p className="text-white/60 mb-6">
                        No MCP servers configured yet
                      </p>
                    </div>
                    <Button
                      onClick={addMcpServer}
                      className="h-12 px-8 bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium"
                    >
                      <Server className="mr-2 h-5 w-5" />
                      Add MCP Server
                    </Button>
                  </div>
                )}

            {/* // Replace the MCP Server Card JSX in your component */}

                {mcpServers.map((server, index) => (
                  <div
                    key={server.id}
                    className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-6"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5F96F1] to-[#2472eb] flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          MCP Server {index + 1}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeMcpServer(server.id)}
                        className="text-white/40 hover:text-red-400 text-2xl leading-none transition-colors"
                        title="Remove server"
                      >
                        ×
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-white/60">Status:</span>
                      {server.isValidating ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Validating...
                        </div>
                      ) : server.isValid === true ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                          <CheckCircle2 className="h-3 w-3" />
                          Validated
                        </div>
                      ) : server.isValid === false ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Invalid
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/60 text-sm">
                          Not Validated
                        </div>
                      )}
                    </div>

                    {/* Server URL Input */}
                    <div className="space-y-3 mb-4">
                      <Label className="text-white/80 font-medium">MCP Server URL</Label>
                      <div className="flex gap-3">
                        <Input
                          value={server.url}
                          onChange={(e) => {
                            updateMcpServer(server.id, {
                              url: e.target.value,
                              isValid: null,
                              validationError: undefined,
                            });
                          }}
                          className="flex-1 h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                          placeholder="https://your-mcp-server.com/mcp"
                        />
                        <Button
                          onClick={() => validateServer(server.id)}
                          className="h-12 px-6 bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium"
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
                      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
                        <div className="flex items-start gap-3">
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
                      <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-400">
                              Server Validated Successfully
                            </p>
                            <p className="text-xs text-green-300 mt-1">
                              Found {server.tools.length} tool(s)
                            </p>
                            {server.tools.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {server.tools.slice(0, 5).map((tool: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium"
                                  >
                                    {tool.name}
                                  </span>
                                ))}
                                {server.tools.length > 5 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
                                    +{server.tools.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Authentication Section (Collapsible) */}
                    <div className="border border-white/15 rounded-xl bg-white/5">
                      <button
                        onClick={() =>
                          updateMcpServer(server.id, {
                            showAuth: !server.showAuth,
                          })
                        }
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="h-5 w-5 text-white/60"
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
                          <span className="text-white/80 font-medium">
                            Authentication (Optional)
                          </span>
                        </div>
                        <svg
                          className={`h-5 w-5 text-white/60 transition-transform ${server.showAuth ? "rotate-180" : ""
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
                        <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-3">
                            <Label className="text-white/80 font-medium">Header Name</Label>
                            <Input
                              value={server.authHeader}
                              onChange={(e) => {
                                updateMcpServer(server.id, {
                                  authHeader: e.target.value,
                                  isValid: null,
                                });
                              }}
                              className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                              placeholder="Authorization"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-white/80 font-medium">Bearer Value</Label>
                            <Input
                              type="password"
                              value={server.authValue}
                              onChange={(e) => {
                                updateMcpServer(server.id, {
                                  authValue: e.target.value,
                                  isValid: null,
                                });
                              }}
                              className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                              placeholder="Enter bearer token"
                            />
                            <p className="text-xs text-white/50">
                              Token will be sent as: {server.authHeader}:{" "}
                              {server.authValue ? "Bearer ***" : "Bearer <token>"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Another Server Button */}
                {mcpServers.length > 0 && (
                  <Button
                    onClick={addMcpServer}
                    variant="outline"
                    className="w-full h-12 border-dashed border-white/30 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/40 transition-all duration-200 rounded-xl font-medium"
                  >
                    <Server className="mr-2 h-5 w-5" />
                    Add Another MCP Server
                  </Button>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white/90 hover:bg-[#333333] hover:border-white/25 transition-all duration-200 backdrop-blur-sm font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={isLoading}
                  className="flex-1 h-12 justify-center bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium"
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
    </div>
  );
}

  export default function OnboardingPage() {


  return (
    

     <Suspense>
  <OnboardingContent />
    </Suspense>
    
  
  );
}