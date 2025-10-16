"use client";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  ModelMessage,
  generateText,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { isToolUIPart, getToolName } from "ai";
import { AIDevtools } from "@ai-sdk-tools/devtools";
import Markdown from "react-markdown";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

import { createMistral } from "@ai-sdk/mistral";
import z from "zod";
// import { SystemPrompt } from '@/generativeui/systemPrompt';
import MCPCard from "../../generativeUI/mcpConfigUI";
import MCPClinet from "../../generativeUI/mcpClient.tsx";
import AgentPreview from "../../generativeUI/AgentPreview";
import AgentConfig from "../../generativeUI/agnetConfig";
// import ChatInput from "../../generativeUI/chatinput";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});
type Tool = {
  name: string;
  description: string;
  type: string;
  inputSchema: {
    jsonSchema: Record<string, any>;
  };
};
export default function Chat() {
  const [input, setInput] = useState("");

  const [tools, setTools] = useState<Tool[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "https://workerdemo.rushikeshpatil8208.workers.dev/",
    }),
  });

  const handleSubmit = () => {
    console.log("handleSubmit");
  };

  const getTools = async () => {
    console.log("Fetching tools...");
    const response = await fetch("/api/mcp");
    const tools = await response.json();

    console.log("Received tools:", tools);
    setTools([tools]);
  };

  return (
    <div
      style={{
        border: "1px solid black",
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        height: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          overflow: "scroll",
          width: "40%",
          alignSelf: "flex-end",
          border: "1px solid black",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div>
          {messages?.map((m) => (
            <div key={m.id}>
              <strong>{`${m.role}: `}</strong>
              {m.parts?.map((part, i) => {
                if (part.type === "text") {
                  return <div key={i}>{part.text}</div>;
                }
                if (isToolUIPart(part)) {
                  const toolName = getToolName(part);
                  const toolCallId = part.toolCallId;

                  // render confirmation tool (client-side tool with user interaction)
                  if (
                    toolName === "gatherMcpInformation" &&
                    part.state === "input-available"
                  ) {
                    return (
                      <div key={toolCallId}>
                        Gather MCP information:{" "}
                        {(part as any)?.input?.fileName ||
                          (part as any)?.input?.serverLink}
                        ?
                        <div>
                          <MCPCard
                            handelSubmit={async () => {
                              await addToolResult({
                                toolCallId,
                                tool: toolName,
                                output: "Yes, confirmed.",
                              });
                              // sendMessage({
                              //   text: "I have sumiited the details for mcp config ",
                              //   // Optional: additional data like files, metadata
                              // });

                              console.log("called me again what to do next");
                            }}
                          />
                          {/* <button
                          onClick={async () => {
                            await addToolResult({
                              toolCallId,
                              tool: toolName,
                              output: 'Yes, confirmed.',
                            });
                            sendMessage();
                          }}
                        >
                          Yes
                        </button> */}
                          {/* <button
                          onClick={async () => {
                            await addToolResult({
                              toolCallId,
                              tool: toolName,
                              output: 'No, denied.',
                            });
                            sendMessage();
                          }}
                        >
                          No
                        </button> */}
                        </div>
                      </div>
                    );
                  }
                }
              })}
              <br />
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage({ text: input });
          }}
        >
          <input
            style={{
              width: "100%",
              color: "black",
              backgroundColor: "white",
              border: "1px solid black",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>

        <button>clicke me</button>
      </div>

      <div
        style={{
          padding: "10px",
          width: "100%",
          height: "100vh",
          border: "1px solid black",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div
          style={{
            overflow: "scroll",
            display: "flex",
            flexDirection: "row",
            gap: "10px",
          }}
        >
          <AgentConfig />
          <MCPClinet />

          <button onClick={getTools}>Get Tools </button>

          {/* <ul className="space-y-4">
            {tools.map((tool, index) => (
              <li
                key={tool.name}
                className="border rounded p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{tool.name}</h2>
                    <p className="text-gray-600">{tool.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Type: {tool.type}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                    className="text-blue-500 hover:underline"
                  >
                    {expandedIndex === index ? "Hide Schema" : "Show Schema"}
                  </button>
                </div>

                {expandedIndex === index && (
                  <pre className="mt-3 bg-gray-100 p-3 rounded overflow-x-auto text-sm">
                    {JSON.stringify(tool.inputSchema.jsonSchema, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul> */}
          {/* <AgentPreview messages={messages} /> */}
        </div>
      </div>
    </div>
  );
}
