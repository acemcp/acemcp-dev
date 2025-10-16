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


    console.log("mcpConfig", mcpConfig);

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isValidConfig()) {
            console.log("MCP Configuration:", mcpConfig);
            handelSubmit(); // Call the parent submit handler
        } else {
            alert("Please upload a file or enter server link and API key.");
        }
    };

    return (
        <Card className="w-[400px] p-6 mx-auto mt-10">
            <CardHeader>
                <CardTitle>MCP Configuration</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                    <Label>Upload your OpenAPI spec (JSON/YAML)</Label>
                    <Input type="file" onChange={handleFileChange} />
                    {mcpConfig.file && <p className="text-sm text-muted-foreground">{mcpConfig.file.name}</p>}
                </div>

                <Separator className="my-4" />

                {/* OR Separator */}
                <div className="text-center text-sm font-medium text-muted-foreground">
                    OR
                </div>

                <Separator className="my-4" />

                {/* MCP Server + API Key */}
                <div className="space-y-2">
                    <Label>MCP Server Link</Label>
                    <Input
                        placeholder="https://your-mcp-server.com"
                        value={mcpConfig.serverLink}
                        onChange={(e) => setServerLink(e.target.value)}
                    />

                    <Label>API Key (Optional)</Label>
                    <Input
                        placeholder="Enter your API key"
                        type="password"
                        value={mcpConfig.apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>
            </CardContent>

            <CardFooter>
                <Button className="w-full" onClick={(e) => handleSubmit(e)}>
                    Submit
                </Button>
            </CardFooter>
        </Card>
    );
}
