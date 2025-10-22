"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" }
    }
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
      env: { SLACK_BOT_TOKEN: "", SLACK_TEAM_ID: "" }
    }
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
      env: { POSTGRES_CONNECTION_STRING: "" }
    }
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
      env: { GMAIL_CREDENTIALS: "" }
    }
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
      env: { GOOGLE_CALENDAR_CREDENTIALS: "" }
    }
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
      env: { NOTION_API_KEY: "" }
    }
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
      env: { GOOGLE_DRIVE_CREDENTIALS: "" }
    }
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
      env: {}
    }
  }
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
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleDeploy = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // Parse and save MCP config if provided
      if (mcpConfigString.trim()) {
        try {
          const configJson = JSON.parse(mcpConfigString);
          
          await fetch("/api/mcp-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId,
              mcpString: mcpConfigString,
              authToken: "",
              configJson,
            }),
          });
        } catch (parseError) {
          alert("Invalid MCP configuration JSON");
          setIsLoading(false);
          return;
        }
      }

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
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step >= stepNum 
                    ? "border-blue-500 bg-blue-500 text-white" 
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}>
                  {step > stepNum ? <CheckCircle2 className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 ${step > stepNum ? "bg-blue-500" : "bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Metadata */}
        {step === 1 && (
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Project Details</CardTitle>
              <CardDescription className="text-slate-400">
                Tell us about your AI agent project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-slate-200">Project Name *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Customer Support Agent"
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription" className="text-slate-200">Description</Label>
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
                  <Label htmlFor="identity" className="text-slate-200">Agent Identity</Label>
                  <Input
                    id="identity"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="e.g., Helpful customer service assistant"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-slate-200">Tone</Label>
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
                <Label htmlFor="instructions" className="text-slate-200">Instructions</Label>
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
              <CardTitle className="text-2xl text-white">Review & Edit Metadata</CardTitle>
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
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {POPULAR_MCP_SERVERS.map((server) => {
                    const Icon = server.icon;
                    const isSelected = selectedServers.includes(server.id);
                    
                    return (
                      <button
                        key={server.id}
                        onClick={() => toggleServer(server.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 bg-slate-950 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? "bg-blue-500" : "bg-slate-800"
                          }`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1">{server.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">{server.description}</p>
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                          {server.category}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white">MCP Server Configuration</CardTitle>
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
                  This configuration will be securely stored and used to connect your MCP servers.
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
