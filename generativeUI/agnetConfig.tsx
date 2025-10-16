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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

// This component loads a config file from public (several fallback paths),
// validates it's JSON (avoids parsing HTML 404 pages), shows editable fields,
// and saves back via API or localStorage as a fallback.

const DEFAULT_CONFIG: any = {
  Identity:
    "KeyCron, an AI-powered eCommerce Agent designed to optimize the KeyCron app—a next-gen shopping platform blending personalization, real-time analytics, and conversational commerce.",
  Instructions:
    "Follow a hierarchical decision framework to fulfill the role: 1. Intent Detection: Parse user inputs to classify intent. 2. Response Strategy: Tailor responses based on intent type. 3. Personalization Engine: Merge collaborative and content-based filtering for real-time adjustments. 4. Conversion Optimization: Use micro-interactions, dynamic pricing, and post-purchase triggers. 5. Data Feedback Loop: Log interactions to update user profiles, inventory predictions, and A/B test results.",
  Tone: "Friendly, tech-savvy, empathetic, and value-driven, with a focus on speed and personalization.",
  Temperature: 0.7,
};

export default function AgentConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(null);

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

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...(prev || {}), [key]: value }));
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
    return <p className="text-center mt-4">Loading configuration...</p>;

  return (
    <div className="overflow-auto  w-full mx-auto mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>🧠 Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-2 bg-yellow-50 text-yellow-800 rounded">
              ⚠️ {error}
            </div>
          )}

          <div className="w-full">
            <Label htmlFor="identity">Identity</Label>
            <Textarea
              id="identity"
              value={config?.Identity || ""}
              onChange={(e) => handleChange("Identity", e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <div className="w-full">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={config?.Instructions || ""}
              onChange={(e) => handleChange("Instructions", e.target.value)}
              rows={6}
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="tone">Tone</Label>
            <Input
              id="tone"
              value={config?.Tone || ""}
              onChange={(e) => handleChange("Tone", e.target.value)}
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="temperature">Temperature</Label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.01}
                value={[Number((config?.Temperature ?? 0.7).toFixed(2))]}
                onValueChange={(val) =>
                  handleChange("Temperature", Number(val[0]))
                }
                className="flex-1"
              />
              <span className="w-12 text-center">
                {(config?.Temperature ?? 0.7).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex items-center gap-3">
            {savedMessage && (
              <span className="text-sm text-green-600">{savedMessage}</span>
            )}
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardFooter>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>👁️ Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold">Identity</p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {config?.Identity}
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Instructions</p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {config?.Instructions}
            </p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Tone</p>
            <p className="text-muted-foreground">{config?.Tone}</p>
          </div>

          <Separator />

          <div>
            <p className="font-semibold">Temperature</p>
            <p className="text-muted-foreground">
              {(config?.Temperature ?? 0.7).toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
