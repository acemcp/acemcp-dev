import {
  StreamTextResult,
  UIMessage,
  convertToModelMessages,
  hasToolCall,
  stepCountIs,
  streamText,
} from "ai";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createMistral } from "@ai-sdk/mistral";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

// Lazy initialization to avoid connecting during build time
let mcpClient: any = null;
let tools: any = null;



async function getMCPClient() {
  if (!mcpClient) {
    mcpClient = await createMCPClient({
      transport: new StreamableHTTPClientTransport(
        new URL("https://mcp-hono.rushikeshpatil8208.workers.dev/mcp")
      ),
    });
    tools = await mcpClient.tools();
    console.log("Connected to MCP server with tools:", tools);
  }
  return { mcpClient, tools };
}

export const maxDuration = 30;

export async function GET() {
  const { tools } = await getMCPClient();
  return Response.json(tools);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    const { tools } = await getMCPClient();
    
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
    return new Response("Internal Server Error", { status: 500 });
  }
}
