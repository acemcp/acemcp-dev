import {
  StreamTextResult,
  UIMessage,
  convertToModelMessages,
  experimental_createMCPClient as createMCPClient,
  hasToolCall,
  stepCountIs,
  streamText,
} from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createMistral } from "@ai-sdk/mistral";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

export const maxDuration = 30;

// export async function GET() {
//   return Response.json(tools);
// }

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  try {
    // Connect to the existing MCP server running on port 2025
    const mcpClient = await createMCPClient({
      transport: new StreamableHTTPClientTransport(
        new URL("http://localhost:2025/mcp"),
      ),
    });

    const tools = await mcpClient.tools();
    console.log("Connected to MCP server with tools:", tools);

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
