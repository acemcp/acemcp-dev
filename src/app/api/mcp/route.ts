import {
  StreamTextResult,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from "ai";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createMistral } from "@ai-sdk/mistral";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

// Cache combined tools per projectId
const mcpToolsCache: Record<string, any> = {};

async function getMCPTools(projectId: string) {
  if (!mcpToolsCache[projectId]) {
    const supabase = await getSupabaseServerClient();
    const { data: configs, error } = await supabase
      .from("MCPConfig")
      .select("*")
      .eq("projectId", projectId);

    if (error) {
      throw new Error("Failed to fetch MCP configs");
    }

    if (!configs || configs.length === 0) {
      throw new Error("No MCP configs found for project");
    }

    const allTools: any = {};

    for (const config of configs) {
      const transportOptions =
        config.authHeader && config.authToken
          ? {
            requestInit: {
              headers: {
                [config.authHeader]: config.authToken.startsWith("Bearer ")
                  ? config.authToken
                  : `Bearer ${config.authToken}`,
              },
            },
          }
          : undefined;

      const transport = new StreamableHTTPClientTransport(
        new URL(config.serverUrl),
        transportOptions,
      );

      const mcpClient = await createMCPClient({
        transport: transport as any,
      });
      const tools = await mcpClient.tools();

      // Merge tools, assuming no conflicts in tool names
      Object.assign(allTools, tools);
    }

    mcpToolsCache[projectId] = allTools;
  }
  return mcpToolsCache[projectId];
}

export const maxDuration = 30;

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) {
    return new Response("Project ID required", { status: 400 });
  }
  try {
    const tools = await getMCPTools(projectId);
    return Response.json(tools);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "MCP config not found",
      { status: 404 },
    );
  }
}

export async function POST(req: Request) {
  const { messages, id: projectId }: { messages: UIMessage[]; id: string } =
    await req.json();



  console.log("projectId", projectId);


  if (!projectId) {
    return new Response("Project ID required", { status: 400 });
  }

  try {
    const tools = await getMCPTools(projectId);

    const result: StreamTextResult<any, any> = streamText({
      system: "You are a helpful assistant with access to mcp tools",
      model: mistral("mistral-large-latest"),
      tools,
      toolChoice: "auto",
      stopWhen: [stepCountIs(2)],
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error occurred while processing request:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      {
        status: 500,
      },
    );
  }
}
