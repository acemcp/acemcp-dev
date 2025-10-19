"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AgentConfigType {
  Identity: string;
  Instructions: string;
  Tone: string;
  Temperature: number;
}

// This component loads a config file from public (several fallback paths),
// validates it's JSON (avoids parsing HTML 404 pages), shows editable fields,
// and saves back via API or localStorage as a fallback.

const DEFAULT_CONFIG: AgentConfigType = {
  Identity:
    "KeyCron, an AI-powered eCommerce Agent designed to optimize the KeyCron app—a next-gen shopping platform blending personalization, real-time analytics, and conversational commerce.",
  Instructions:
    "Follow a hierarchical decision framework to fulfill the role: 1. Intent Detection: Parse user inputs to classify intent. 2. Response Strategy: Tailor responses based on intent type. 3. Personalization Engine: Merge collaborative and content-based filtering for real-time adjustments. 4. Conversion Optimization: Use micro-interactions, dynamic pricing, and post-purchase triggers. 5. Data Feedback Loop: Log interactions to update user profiles, inventory predictions, and A/B test results.",
  Tone: "Friendly, tech-savvy, empathetic, and value-driven, with a focus on speed and personalization.",
  Temperature: 0.7,
};

export default function AgentConfig() {
  const [config, setConfig] = useState<AgentConfigType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Try multiple public paths where config might live. This avoids 404 HTML parsing errors.
  const possiblePaths = [
    "/config/agentConfig.json",
    "/agentConfig.json",
    "/data/agentConfig.json",
    "/config/agentProfile.json",
    "/agentProfile.json",
  ];

  useEffect(() => {
    let mounted = true;

    async function tryLoad() {
      setLoading(true);
      setError(null);

      // First check localStorage (user may have an edited config saved earlier)
      try {
        const stored = localStorage.getItem("agentConfig");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (mounted) setConfig(parsed);
          return;
        }
      } catch (e) {
        // ignore parse errors in localStorage
        console.warn("Failed to parse local agentConfig from localStorage", e);
      }

      // Try fetching from the list of candidate paths
      let lastError = null;
      for (const p of possiblePaths) {
        try {
          const res = await fetch(p, {
            headers: { Accept: "application/json" },
          });

          // If resource not found, continue to next
          if (!res.ok) {
            lastError = new Error(`HTTP ${res.status} for ${p}`);
            continue;
          }

          // Check Content-Type first to avoid parsing HTML pages
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json") && !ct.includes("text/json")) {
            // it might still be JSON even if header missing; read text and detect
            const text = await res.text();
            // naive check if it looks like JSON
            if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
              lastError = new Error(
                `Non-JSON response at ${p}. Content-type: ${ct}`
              );
              continue;
            }
            try {
              const json = JSON.parse(text);
              if (mounted) setConfig(json);
              return;
            } catch (parseErr) {
              lastError = parseErr;
              continue;
            }
          }

          // If content-type is JSON, parse normally
          const data = await res.json();
          if (mounted) setConfig(data);
          return;
        } catch (err) {
          lastError = err;
          continue; // try next path
        }
      }

      // If none succeeded, fallback to default config and show warning
      if (mounted) {
        setConfig(DEFAULT_CONFIG);
        setError(
          `Failed to load config from public paths. Using default config. Last error: ${lastError?.message || "unknown"}`
        );
      }

      setLoading(false);
    }

    tryLoad();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key: keyof AgentConfigType, value: string | number) => {
    setConfig((prev) => ({ ...(prev || DEFAULT_CONFIG), [key]: value }));
  };

  // Save: first try API endpoint, fallback to localStorage
  const handleSave = async () => {
    setSavedMessage(null);
    setError(null);
    try {
      // Attempt to POST to an API route (you should implement /api/agent/profile on the server)
      const res = await fetch("/api/agent/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API save failed: ${res.status} ${text}`);
      }

      setSavedMessage("Saved to server configuration (API).");
      // also persist locally
      localStorage.setItem("agentConfig", JSON.stringify(config));
    } catch (apiErr) {
      console.warn("API save failed, falling back to localStorage:", apiErr);
      try {
        localStorage.setItem("agentConfig", JSON.stringify(config));
        setSavedMessage("Saved to localStorage (fallback).");
      } catch (lsErr) {
        setError(`Failed to save config: ${lsErr.message}`);
      }
    }
  };

  if (loading && !config)
    return (
      <Card className="w-full max-w-xl border-none bg-black/40 backdrop-blur-md">
        <CardContent className="px-6 py-12 text-center text-gray-400">
          Loading configuration...
        </CardContent>
      </Card>
    );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="bg-black/40 backdrop-blur-md border border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold text-white">Agent Configuration</CardTitle>
          <p className="text-sm text-gray-400">
            Define the identity, instructions, and behaviour for this agent.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="identity" className="text-gray-200">Identity</Label>
            <Textarea
              id="identity"
              value={config?.Identity || ""}
              onChange={(e) => handleChange("Identity", e.target.value)}
              rows={3}
              className="bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-white/20 focus:ring-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-gray-200">Instructions</Label>
            <Textarea
              id="instructions"
              value={config?.Instructions || ""}
              onChange={(e) => handleChange("Instructions", e.target.value)}
              rows={6}
              className="bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-white/20 focus:ring-white/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone" className="text-gray-200">Tone</Label>
              <Input
                id="tone"
                value={config?.Tone || ""}
                onChange={(e) => handleChange("Tone", e.target.value)}
                className="bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-white/20 focus:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-gray-200">Temperature</Label>
              <div className="flex items-center gap-3">
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[Number((config?.Temperature ?? 0.7).toFixed(2))]}
                  onValueChange={(val) =>
                    handleChange("Temperature", Number(val[0]))
                  }
                  className="[&>span]:bg-white"
                />
                <span className="w-12 text-center text-sm font-semibold text-white">
                  {(config?.Temperature ?? 0.7).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            {savedMessage ? savedMessage : "Changes are auto-saved locally."}
          </div>
          <Button 
            onClick={handleSave}
            className="bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
