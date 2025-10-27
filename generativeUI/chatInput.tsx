"use client";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { DefaultChatTransport, getToolName, isToolUIPart, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import MCPCard from "./mcpConfigUI";

interface GatherMcpInformationInput {
  fileName?: string;
  serverLink?: string;
}

const ChatInput = () => {
  const [text, setText] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, addToolResult, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
    }),
    // Automatically send when all tool results are available
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    // Handle client-side tools that should be automatically executed
    async onToolCall({ toolCall }) {
      // Check if it's a dynamic tool first for proper type narrowing
      if (toolCall.dynamic) {
        // For dynamic MCP tools, we typically don't auto-execute on client
        // They are executed on the server side
        return;
      }

      // Handle any client-side tools here if needed
      // Example: if (toolCall.toolName === 'clientSideTool') { ... }
    },
  });
  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text && !message.files?.length) {
      return;
    }

    if (message.text) {
      sendMessage({ text: message.text });
    }

    setText("");
  };

  return (
    <Card className="mx-auto flex h-[620px] w-full max-w-5xl flex-col">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">Realtime Agent Console</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor responses and provide additional instructions or artefacts.
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-muted/10">
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Conversation>
              <ConversationContent>
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-900">Error:</p>
                    <p className="text-xs text-red-700">{error.message}</p>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    <span className="font-medium">No messages yet</span>
                    <span>Start the conversation to see agent activity.</span>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          // Handle text parts
                          if (part.type === "text") {
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          }

                          // Handle dynamic MCP tools (AI SDK 5.0 compliant)
                          if (part.type === "dynamic-tool") {
                            return (
                              <div key={`${message.id}-${i}`} className="my-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                  <span className="text-sm font-medium text-blue-900">
                                    Tool: {part.toolName}
                                  </span>
                                </div>

                                {/* Input streaming state - shows partial inputs as they arrive */}
                                {part.state === "input-streaming" && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-blue-700">Streaming input...</p>
                                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-blue-100 p-2 text-xs text-blue-900">
                                      {JSON.stringify(part.input, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Input available state - full input ready for execution */}
                                {part.state === "input-available" && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-blue-700">Executing with input:</p>
                                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-blue-100 p-2 text-xs text-blue-900">
                                      {JSON.stringify(part.input, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Output available state - tool execution completed */}
                                {part.state === "output-available" && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-green-900">✓ Result:</p>
                                    <pre className="mt-1 max-h-40 overflow-auto rounded bg-green-50 p-2 text-xs text-green-900">
                                      {JSON.stringify(part.output, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Output error state - tool execution failed */}
                                {part.state === "output-error" && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-red-900">✗ Error:</p>
                                    <div className="mt-1 rounded bg-red-50 p-2 text-xs text-red-900">
                                      {part.errorText}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Handle file parts (images, etc.)
                          if (part.type === "file" && part.mimeType.startsWith("image/")) {
                            return (
                              <img
                                key={`${message.id}-${i}`}
                                src={`data:${part.mimeType};base64,${part.data}`}
                                alt="Generated image"
                                className="my-2 max-w-md rounded-lg border"
                              />
                            );
                          }

                          // Handle source parts (citations, references)
                          if (part.type === "source") {
                            return (
                              <div key={`${message.id}-${i}`} className="my-2 rounded-lg border border-purple-200 bg-purple-50 p-2">
                                <p className="text-xs font-medium text-purple-900">Source:</p>
                                <a
                                  href={part.source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-700 underline hover:text-purple-900"
                                >
                                  {part.source.url}
                                </a>
                              </div>
                            );
                          }

                          // Handle reasoning parts
                          if (part.type === "reasoning") {
                            return (
                              <div key={`${message.id}-${i}`} className="my-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-medium text-amber-900">Reasoning:</p>
                                <p className="mt-1 text-sm text-amber-800">{part.reasoning}</p>
                              </div>
                            );
                          }

                          // Handle static tool: gatherMcpInformation (AI SDK 5.0 pattern)
                          if (part.type === "tool-gatherMcpInformation") {
                            const callId = part.toolCallId;

                            switch (part.state) {
                              case "input-streaming":
                                return (
                                  <div key={callId} className="my-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                    <p className="text-xs font-medium text-indigo-700">Loading MCP configuration...</p>
                                  </div>
                                );

                              case "input-available":
                                return (
                                  <div key={callId} className="my-2 space-y-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                    <p className="text-sm font-medium text-indigo-900">
                                      Configure MCP Server:
                                      {" "}
                                      {part.input.fileName || part.input.serverLink}
                                    </p>
                                    <MCPCard
                                      handelSubmit={async () => {
                                        await addToolResult({
                                          tool: "gatherMcpInformation",
                                          toolCallId: callId,
                                          output: "Configuration confirmed.",
                                        });
                                      }}
                                    />
                                  </div>
                                );

                              case "output-available":
                                return (
                                  <div key={callId} className="my-2 rounded-lg border border-green-200 bg-green-50 p-2">
                                    <p className="text-xs font-medium text-green-900">✓ MCP Configuration: {part.output}</p>
                                  </div>
                                );

                              case "output-error":
                                return (
                                  <div key={callId} className="my-2 rounded-lg border border-red-200 bg-red-50 p-2">
                                    <p className="text-xs font-medium text-red-900">✗ Error: {part.errorText}</p>
                                  </div>
                                );
                            }
                          }

                          return null;
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t bg-muted/5">
        <PromptInput onSubmit={handleSubmit} globalDrop multiple className="w-full">
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask the agent or provide guidance..."
              ref={textareaRef}
              value={text}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton
                onTranscriptionChange={setText}
                textareaRef={textareaRef}
              />
              <PromptInputButton>
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit disabled={!text || isLoading} />
          </PromptInputToolbar>
        </PromptInput>
      </CardFooter>
    </Card>
  );
};

export default ChatInput;
