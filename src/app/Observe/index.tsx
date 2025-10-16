"use client";

import { useState } from "react";
import Image from "next/image";

// Mock data representing the spans and attributes from the AI SDK telemetry.
// In a real application, this data would come from an OpenTelemetry collector.

type Attribute = {
  key: string;
  value: string | number | boolean;
};

type Log = {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  attributes: Attribute[];
};

type Resource = {
  name: string;
  provider: string;
  host: string;
};

const mockTraceAttributes: Attribute[] = [
  { key: "operation.name", value: "ai.generateText" },
  { key: "ai.model.id", value: "gpt-4.1" },
  { key: "ai.model.provider", value: "openai" },
  { key: "ai.prompt", value: "Write a short story about a cat." },
  { key: "ai.response.text", value: "The cat sat on the mat..." },
  { key: "ai.response.finishReason", value: "stop" },
  { key: "ai.usage.promptTokens", value: 50 },
  { key: "ai.usage.completionTokens", value: 150 },
];

const mockMetrics = [
  { name: "ai.response.msToFirstChunk", value: "120ms" },
  { name: "ai.response.msToFinish", value: "1500ms" },
  { name: "gen_ai.usage.input_tokens", value: 50 },
  { name: "gen_ai.usage.output_tokens", value: 150 },
];

const mockLogs: Log[] = [
  {
    timestamp: "2025-10-14T10:00:01.123Z",
    level: "info",
    message: "First chunk of stream received.",
    attributes: [{ key: "ai.response.msToFirstChunk", value: 120 }],
  },
  {
    timestamp: "2025-10-14T10:00:02.500Z",
    level: "info",
    message: "Stream finished.",
    attributes: [{ key: "ai.response.finishReason", value: "stop" }],
  },
];

const mockResource: Resource = {
  name: "my-awesome-function",
  provider: "openai",
  host: "api.openai.com",
};

const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-gray-800 text-white"
        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
    }`}
  >
    {label}
  </button>
);

const AttributeTable = ({ attributes }: { attributes: Attribute[] }) => (
  <div className="divide-y divide-gray-800 rounded-lg border border-gray-800">
    {attributes.map((attr, index) => (
      <div key={index} className="grid grid-cols-3 gap-4 px-4 py-3">
        <div className="text-sm text-gray-400 col-span-1">{attr.key}</div>
        <div className="text-sm text-white col-span-2 font-mono bg-gray-800/50 rounded px-2 py-1">
          {String(attr.value)}
        </div>
      </div>
    ))}
  </div>
);

export default function ObservePage() {
  const [activeTab, setActiveTab] = useState("Trace");
  const tabs = ["Trace", "Metrics", "Log", "Resources", "Collector"];

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Telemetry Observer
          </h1>
          <p className="text-gray-400 mt-1">
            Live tracing for your AI SDK function calls.
          </p>
        </header>

        <main>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Waterfall Trace</h2>
            <div className="w-full overflow-x-auto">
              <Image
                src="/asset/waterfall-trace.svg"
                alt="Waterfall Trace"
                width={1200}
                height={300}
                className="rounded-md"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 mb-6">
              {tabs.map((tab) => (
                <TabButton
                  key={tab}
                  label={tab}
                  isActive={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                />
              ))}
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 min-h-[300px]">
              {activeTab === "Trace" && (
                <div>
                  <h3 className="font-semibold mb-4">Trace Attributes</h3>
                  <AttributeTable attributes={mockTraceAttributes} />
                </div>
              )}
              {activeTab === "Metrics" && (
                <div>
                  <h3 className="font-semibold mb-4">Metrics</h3>
                  <AttributeTable
                    attributes={mockMetrics.map((m) => ({
                      key: m.name,
                      value: m.value,
                    }))}
                  />
                </div>
              )}
              {activeTab === "Log" && (
                <div>
                  <h3 className="font-semibold mb-4">Logs</h3>
                  <div className="space-y-4">
                    {mockLogs.map((log, i) => (
                      <div
                        key={i}
                        className="font-mono text-xs p-3 bg-gray-800/50 rounded-md"
                      >
                        <span className="text-purple-400">{log.timestamp}</span>
                        <span
                          className={`ml-4 ${log.level === "error" ? "text-red-400" : "text-green-400"}`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                        <span className="ml-4 text-white">{log.message}</span>
                        <div className="mt-2 pl-4 border-l border-gray-700">
                          {log.attributes.map((a) => (
                            <div key={a.key}>
                              <span className="text-gray-400">{a.key}:</span>{" "}
                              <span className="text-cyan-400">{a.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "Resources" && (
                <div>
                  <h3 className="font-semibold mb-4">Resource Information</h3>
                  <AttributeTable
                    attributes={[
                      { key: "service.name", value: mockResource.name },
                      { key: "service.provider", value: mockResource.provider },
                      { key: "host.name", value: mockResource.host },
                    ]}
                  />
                </div>
              )}
              {activeTab === "Collector" && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h3 className="font-semibold text-lg">Collector Status</h3>
                  <p className="text-gray-400 mt-2">
                    No collector configured for this view.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This is a placeholder for collector integration details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
