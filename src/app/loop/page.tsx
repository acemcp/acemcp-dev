"use client";
import { useState } from "react";
import AgentLoopController from "@/components/AgentLoopController";
import ToolController from "@/components/ToolController";

export default function LoopPage() {
  const [messages, setMessages] = useState<any[]>([]);

  const addMockMessage = () => {
    const mockMsg = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      parts: [
        { type: 'text', text: 'I need to check the weather.' },
        { type: 'tool-call', toolCallId: 'call-1', toolName: 'getWeatherDataByCityName', args: { cityName: 'New York' } }
      ]
    };
    setMessages(prev => [...prev, mockMsg]);
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>Agent Loop and Tool Testing</h1>
      <button onClick={addMockMessage}>Add Mock Message with Tool</button>
      <AgentLoopController messages={messages} />
      <ToolController />
    </div>
  );
}