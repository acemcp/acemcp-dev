// app/api/validate-mcp/route.ts

import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const { serverUrl, authHeader, authToken } = await req.json();

        if (!serverUrl) {
            return NextResponse.json(
                { error: "Server URL is required" },
                { status: 400 }
            );
        }

        // Validate URL format
        let url: URL;
        try {
            url = new URL(serverUrl);
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid URL format" },
                { status: 400 }
            );
        }

        // Build transport options
        const transportOptions =
            authHeader && authToken && authToken !== "null"
                ? {
                    requestInit: {
                        headers: {
                            [authHeader]: authToken.startsWith("Bearer ")
                                ? authToken
                                : `Bearer ${authToken}`,
                        },
                    },
                }
                : undefined;

        // Create transport
        const transport = new StreamableHTTPClientTransport(url, transportOptions);

        // Try to create MCP client with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 10000)
        );

        const clientPromise = createMCPClient({ transport });

        const client = await Promise.race([clientPromise, timeoutPromise]).catch(
            (error) => {
                throw new Error(`Failed to connect: ${error.message}`);
            }
        );

        // Try to get tools to verify it's a valid MCP server
        let tools: any = {};
        let serverInfo: any = null;

        try {
            tools = await (client as any).tools();

            // Optionally get server info if the MCP SDK supports it
            try {
                serverInfo = await (client as any).serverInfo?.();
            } catch (e) {
                // serverInfo might not be available on all servers
                console.log("Server info not available");
            }

            // Close the client connection
            await (client as any).close?.();
        } catch (error) {
            return NextResponse.json(
                {
                    error: "Connected but failed to retrieve tools. This may not be a valid MCP server.",
                    details: error instanceof Error ? error.message : "Unknown error",
                },
                { status: 400 }
            );
        }

        // Return success with server details
        return NextResponse.json({
            success: true,
            message: "MCP server validated successfully",
            tools: Object.keys(tools).map((key) => ({
                name: key,
                description: tools[key].description || "No description",
            })),
            serverInfo: serverInfo || { name: "Unknown", version: "Unknown" },
            toolCount: Object.keys(tools).length,
        });
    } catch (error) {
        console.error("MCP validation error:", error);

        return NextResponse.json(
            {
                error: "Failed to validate MCP server",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}