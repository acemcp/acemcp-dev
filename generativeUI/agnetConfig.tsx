"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Save,
  RefreshCw,
  Sparkles,
  Bot,
  MessageSquare,
  Thermometer,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";

interface ProjectMetadata {
  identity: string | null;
  instructions: string | null;
  tone: string | null;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  metadata: ProjectMetadata | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CONFIG = {
  identity: "",
  instructions: "",
  tone: "",
  temperature: 0.7,
};

export default function AgentConfig() {
  const params = useParams();
  const { user } = useSupabaseAuth();
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [identity, setIdentity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get projectId from route params
        const projectId = params?.id as string;
        
        if (!projectId) {
          setError("No project ID found in URL");
          return;
        }

        // Fetch specific project
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch project");
        }
        
        if (data.success && data.project) {
          setProjectData(data.project);
          
          // Set form values from metadata
          if (data.project.metadata) {
            setIdentity(data.project.metadata.identity || "");
            setInstructions(data.project.metadata.instructions || "");
            setTone(data.project.metadata.tone || "");
          }
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user, params]);

  const handleSave = async () => {
    if (!projectData) {
      setError("No project loaded");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/project/${projectData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
          instructions,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save configuration");
      }

      setSuccessMessage("Configuration saved successfully!");
      
      // Update local project data
      if (data.project) {
        setProjectData(data.project);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving configuration:", err);
      setError(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (projectData?.metadata) {
      setIdentity(projectData.metadata.identity || "");
      setInstructions(projectData.metadata.instructions || "");
      setTone(projectData.metadata.tone || "");
    } else {
      setIdentity("");
      setInstructions("");
      setTone("");
    }
    setTemperature(0.7);
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#5F96F1]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Please sign in to configure your agent</p>
      </div>
    );
  }

  if (error && !projectData) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 font-sans">
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5F96F1]">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Agent Configuration</h3>
              <p className="text-xs text-muted-foreground">
                {projectData?.name || "No project selected"}
              </p>
            </div>
          </div>
          <Badge className="border-[#5F96F1]/20 bg-[#5F96F1]/10 text-[#5F96F1] text-xs px-2 py-0.5">
            <Bot className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
        <Separator className="bg-border mt-4" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Status Messages */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-400">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

      {/* Configuration Form */}
      <div className="space-y-4">
        {/* Identity */}
        <div className="space-y-2">
          <Label htmlFor="identity" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#5F96F1]" />
            Agent Identity
          </Label>
          <Textarea
            id="identity"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="e.g., Helpful customer service assistant"
            className="bg-input border-border text-foreground text-sm min-h-[60px] resize-none focus:border-[#5F96F1] focus:ring-[#5F96F1]"
            rows={2}
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-[#5F96F1]" />
            Tone
          </Label>
          <Input
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="e.g., Professional and friendly"
            className="bg-input border-border text-foreground text-sm h-9 focus:border-[#5F96F1] focus:ring-[#5F96F1]"
          />
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Bot className="h-3 w-3 text-[#5F96F1]" />
            Instructions
          </Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Specific instructions for the agent..."
            className="bg-input border-border text-foreground text-sm min-h-[100px] resize-none focus:border-[#5F96F1] focus:ring-[#5F96F1]"
            rows={4}
          />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Thermometer className="h-3 w-3 text-[#5F96F1]" />
            Temperature
          </Label>
          <div className="flex items-center gap-3">
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.01}
              value={[temperature]}
              onValueChange={(val) => setTemperature(val[0])}
              className="flex-1"
            />
            <span className="w-12 text-center text-xs font-semibold text-foreground bg-input border border-border rounded px-2 py-1">
              {temperature.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Higher values make output more random</p>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !projectData}
          size="sm"
          className="flex-1 h-8 text-xs bg-[#5F96F1] hover:bg-[#5F96F1]/80 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1.5" />
              Save Config
            </>
          )}
        </Button>
      </div>

        {/* Project Info */}
        {projectData && (
          <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Project Details</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-foreground">{projectData.name}</span>
              </div>
              {projectData.description && (
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span className="text-foreground truncate max-w-[150px]" title={projectData.description}>
                    {projectData.description}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-foreground">
                  {new Date(projectData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
