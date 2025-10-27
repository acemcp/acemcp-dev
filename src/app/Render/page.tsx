"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),

    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getLocation") {
        const cities = [
          "New York",
          "Los Angeles",
          "Chicago",
          "San Francisco",
        ];

        // No await - avoids potential deadlocks
        addToolResult({
          tool: "getLocation",
          toolCallId: toolCall.toolCallId,
          output: cities[Math.floor(Math.random() * cities.length)],
        });
      }
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">
      {messages?.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-1">
          <strong>{`${m.role}: `}</strong>
          {m.parts?.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={m.id + i}>{part.text}</div>;
              // render confirmation tool (client-side tool with user interaction)
              case "tool-askForConfirmation":
                return (
                  <div
                    key={part.toolCallId}
                    className="text-gray-500 flex flex-col gap-2"
                  >
                    <div className="flex gap-2">
                      {part.state === "output-available" ? (
                        <b>{part.output}</b>
                      ) : (
                        <>
                          <button
                            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                            onClick={() =>
                              addToolResult({
                                tool: "askForConfirmation",
                                toolCallId: part.toolCallId,
                                output: "Yes, confirmed.",
                              })
                            }
                          >
                            Yes
                          </button>
                          <button
                            className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                            onClick={() =>
                              addToolResult({
                                tool: "askForConfirmation",
                                toolCallId: part.toolCallId,
                                output: "No, denied",
                              })
                            }
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );

              // other tools:
              case "tool-getWeatherInformation":
                if (part.state === "output-available") {
                  return (
                    <div
                      key={part.toolCallId}
                      className="flex flex-col gap-2 p-4 bg-blue-400 rounded-lg"
                    >
                      <div className="flex flex-row justify-between items-center">
                        <div className="text-4xl text-blue-50 font-medium">
                          {part.output.value}°
                          {part.output.unit === "celsius" ? "C" : "F"}
                        </div>

                        <div className="h-9 w-9 bg-amber-400 rounded-full flex-shrink-0" />
                      </div>
                      <div className="flex flex-row gap-2 text-blue-50 justify-between">
                        {part.output.weeklyForecast.map((forecast) => (
                          <div
                            key={forecast.day}
                            className="flex flex-col items-center"
                          >
                            <div className="text-xs">{forecast.day}</div>
                            <div>{forecast.value}°</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                break;
              case "tool-getLocation":
                if (part.state === "output-available") {
                  return (
                    <div
                      key={part.toolCallId}
                      className="text-gray-500 bg-gray-100 rounded-lg p-4"
                    >
                      User is in {part.output}.
                    </div>
                  );
                } else {
                  return (
                    <div key={part.toolCallId} className="text-gray-500">
                      Calling getLocation...
                    </div>
                  );
                }

              default:
                break;
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
