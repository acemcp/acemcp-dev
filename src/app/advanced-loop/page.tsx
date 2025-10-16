"use client";
import { useState, useCallback } from "react";
import AdvancedAgentLoopController from "@/components/AdvancedAgentLoopController";
import { UIMessage } from "ai";

export default function AdvancedLoopPage() {
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
      const response = await fetch("/api/advanced-loop", {
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
              // Handle streaming data and update assistant message
              if (data.type === "text-delta" && data.delta) {
                // Update existing text part or create new one
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
                // Add tool call part
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
                // Update tool result
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#007acc", marginBottom: "30px" }}>
        Advanced Agentic Loop with Code Generation
      </h1>

      <div style={{ marginBottom: "30px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#666" }}>
          This advanced agentic loop demonstrates code generation streaming. The AI will:
        </p>
        <ul style={{ fontSize: "16px", lineHeight: "1.6", color: "#666" }}>
          <li>Analyze your task requirements</li>
          <li>Generate appropriate code using tools</li>
          <li>Analyze the generated code for safety and correctness</li>
          <li>Present the code for your review</li>
          <li>Stop before execution - giving you control over what runs</li>
        </ul>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="task-input" style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Describe the task you want the AI to generate code for:
            </label>
            <textarea
              id="task-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Create a function to calculate fibonacci numbers in Python"
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                resize: "vertical",
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor: isLoading ? "#6c757d" : "#007acc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              minHeight: "44px",
            }}
          >
            {isLoading ? "Generating..." : "Generate Code"}
          </button>
        </div>
      </form>

      {/* Advanced Agent Loop Controller */}
      <AdvancedAgentLoopController
        messages={messages}
        onExecuteCode={handleExecuteCode}
        onApproveCode={handleApproveCode}
      />

      {/* Message History */}
      {messages.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#007acc", marginBottom: "15px" }}>Message History</h3>
          <div style={{
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "15px"
          }}>
            {messages.map((message, index) => (
              <div key={message.id} style={{
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: message.role === "user" ? "#e3f2fd" : "#ffffff",
                borderRadius: "6px",
                border: "1px solid #ddd"
              }}>
                <strong style={{ color: message.role === "user" ? "#1976d2" : "#007acc" }}>
                  {message.role === "user" ? "You" : "AI"}:
                </strong>
                {message.parts.map((part, partIndex) => {
                  if (part.type === "text") {
                    return (
                      <div key={partIndex} style={{ marginTop: "5px", whiteSpace: "pre-wrap" }}>
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