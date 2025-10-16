// app/page.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";

import { useState } from "react";

export default function Chat() {
  const { messages, addToolResult, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/loop" }),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [input, setInput] = useState("");

  return (
    <div style={{ backgroundColor: "grey" }}>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}: </strong>
          {m.parts?.map((part, i) => {
            if (part.type === "text") return <div key={i}>{part.text}</div>;

            if (isToolUIPart(part)) {
              const toolName = getToolName(part);
              const toolCallId = part.toolCallId;

              if (
                toolName === "addNumbers" &&
                part.state === "input-available"
              ) {
                return (
                  <div
                    style={{
                      color: "red ",
                      backgroundColor: "white",
                      border: "1px solid black",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "10px",
                    }}
                    key={toolCallId}
                  >
                    Add {part.input.a} + {part.input.b}?
                    <button
                      onClick={async () => {
                        // 1️⃣ Do some logging
                        console.log("User confirmed the addition");
                        await addToolResult({
                          toolCallId,
                          tool: toolName,
                          output: "Yes, confirmed",
                        });
                        sendMessage();
                      }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={async () => {
                        await addToolResult({
                          toolCallId,
                          tool: toolName,
                          output: "No, denied",
                        });
                        sendMessage();
                      }}
                    >
                      No
                    </button>
                  </div>
                );
              }

              if (
                toolName === "uploadFile" &&
                part.state === "input-available"
              ) {
                return (
                  <div
                    key={toolCallId}
                    style={{
                      border: "1px solid black",
                      padding: "10px",
                      margin: "10px 0",
                    }}
                  >
                    Upload file: <strong>{part.input.fileName}</strong>
                    <input
                      type="file"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                    <div style={{ marginTop: "5px" }}>
                      <button
                        onClick={async () => {
                          if (!selectedFile)
                            return alert("Select a file first");
                          // Send approval + file metadata (can send actual file via FormData in real case)
                          await addToolResult({
                            toolCallId,
                            tool: toolName,
                            output: `Yes, confirmed: ${selectedFile.name}`,
                          });
                          sendMessage();
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={async () => {
                          await addToolResult({
                            toolCallId,
                            tool: toolName,
                            output: "No, denied",
                          });
                          sendMessage();
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              }
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </div>
  );
}
