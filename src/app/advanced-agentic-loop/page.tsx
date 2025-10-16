"use client";
import { useState, useCallback } from "react";
import AdvancedAgenticLoopControllerV2 from "@/components/AdvancedAgenticLoopControllerV2";
import { UIMessage } from "ai";

export default function AdvancedAgenticLoopPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text: input }],
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/advanced-agentic-loop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const assistantMessage: UIMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        parts: [],
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text-delta" && data.delta) {
                let textPart = assistantMessage.parts.find(p => p.type === "text") as any;
                if (!textPart) {
                  textPart = { type: "text", text: "" };
                  assistantMessage.parts.push(textPart);
                }
                textPart.text += data.delta;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.id === assistantMessage.id) {
                    Object.assign(lastMsg, assistantMessage);
                  } else {
                    newMessages.push({ ...assistantMessage });
                  }
                  return newMessages;
                });
              } else if (data.type === "tool-input-available") {
                assistantMessage.parts.push({
                  type: `tool-${data.toolName}`,
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  input: data.input,
                  state: "input-available",
                  providerExecuted: data.providerExecuted,
                });
                setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
              } else if (data.type === "tool-output-available") {
                const toolPart = assistantMessage.parts.find(
                  p => (p as any).toolCallId === data.toolCallId
                ) as any;
                if (toolPart) {
                  toolPart.output = data.output;
                  toolPart.state = "output-available";
                  toolPart.providerExecuted = data.providerExecuted;
                }
                setMessages(prev => [...prev.slice(0, -1), { ...assistantMessage }]);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: UIMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: "An error occurred while processing your request." }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  const handleExecuteCode = useCallback((codeId: string) => {
    console.log("Executing code:", codeId);
    // Here you could implement actual code execution
    // For now, just log it
  }, []);

  const handleApproveCode = useCallback((codeId: string) => {
    console.log("Approving code:", codeId);
    // Here you could implement code approval logic
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ color: "#007acc", marginBottom: "30px", textAlign: "center" }}>
        Advanced Agentic Loop - Code Generation with Streaming Control
      </h1>

      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#333", maxWidth: "800px", margin: "0 auto" }}>
          Experience the next level of AI-powered code generation. This advanced agentic loop streams the AI's reasoning process,
          generates sophisticated code with comprehensive analysis, and stops before execution - giving you complete control.
        </p>
        <div style={{ marginTop: "20px", fontSize: "16px", color: "#666" }}>
          <strong>Workflow:</strong> Task Analysis → Code Generation → Advanced Analysis → Execution Preview → Your Approval
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", gap: "15px", alignItems: "flex-end", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="task-input" style={{ display: "block", marginBottom: "10px", fontWeight: "bold", fontSize: "16px" }}>
              Describe the coding task you want the AI agent to handle:
            </label>
            <textarea
              id="task-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Create a Python function to process CSV data with error handling and logging"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "15px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: "15px 30px",
              backgroundColor: isLoading ? "#6c757d" : "#007acc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              minHeight: "50px",
              whiteSpace: "nowrap",
            }}
          >
            {isLoading ? "Agent Working..." : "Start Agent Loop"}
          </button>
        </div>
      </form>

      {/* Advanced Agentic Loop Controller V2 */}
      <AdvancedAgenticLoopControllerV2
        messages={messages}
        onExecuteCode={handleExecuteCode}
        onApproveCode={handleApproveCode}
      />

      {/* Message History */}
      {messages.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#007acc", marginBottom: "20px", textAlign: "center" }}>Complete Conversation History</h3>
          <div style={{
            maxHeight: "500px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px"
          }}>
            {messages.map((message, index) => (
              <div key={message.id} style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: message.role === "user" ? "#e3f2fd" : "#ffffff",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}>
                <strong style={{
                  color: message.role === "user" ? "#1976d2" : "#007acc",
                  fontSize: "16px",
                  marginBottom: "10px",
                  display: "block"
                }}>
                  {message.role === "user" ? "👤 You" : "🤖 AI Agent"}:
                </strong>
                {message.parts.map((part, partIndex) => {
                  if (part.type === "text") {
                    return (
                      <div key={partIndex} style={{
                        marginTop: "5px",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6",
                        fontSize: "15px"
                      }}>
                        {part.text}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}