"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMCP } from "@/context";

export default function MCPCard({ handelSubmit }: { handelSubmit: () => void }) {
    const { mcpConfig, setFile, setServerLink, setApiKey, isValidConfig } = useMCP();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isValidConfig()) {
            handelSubmit();
        } else {
            alert("Please upload a file or enter server link and API key.");
        }
    };

    return (
        <Card className="w-full max-w-xl bg-black/95 border-white/10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base font-semibold text-white">Connect MCP Server</CardTitle>
                <p className="text-sm text-white/60">Upload an OpenAPI spec or connect a hosted MCP endpoint.</p>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm text-white">Upload OpenAPI spec</Label>
                    <Input 
                        type="file" 
                        onChange={handleFileChange}
                        className="bg-black/50 border-white/10 text-white file:bg-black file:text-white file:border-white/10 hover:file:border-white file:transition-colors"
                    />
                    {mcpConfig.file && <p className="text-xs text-white/60">{mcpConfig.file.name}</p>}
                </div>

                <div className="flex items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
                    <Separator className="flex-1" />
                    <span>or</span>
                    <Separator className="flex-1" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-sm text-white" htmlFor="mcp-server-link">MCP Server Link</Label>
                        <Input
                            id="mcp-server-link"
                            placeholder="https://your-mcp-server.com"
                            value={mcpConfig.serverLink}
                            onChange={(e) => setServerLink(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm text-white" htmlFor="mcp-api-key">API Key (optional)</Label>
                        <Input
                            id="mcp-api-key"
                            placeholder="Enter your API key"
                            type="password"
                            value={mcpConfig.apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-white/40 focus:border-white"
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button 
                    className="w-full bg-black text-white border border-white/10 hover:border-white transition-colors" 
                    onClick={(e) => handleSubmit(e)}
                >
                    Submit Configuration
                </Button>
            </CardFooter>
        </Card>
    );
}
