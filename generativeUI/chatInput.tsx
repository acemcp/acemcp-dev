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
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import MCPCard from "./mcpConfigUI";

interface GatherMcpInformationInput {
  fileName?: string;
  serverLink?: string;
}

const ChatInput = () => {
  const [text, setText] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
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
                          if (part.type === "text") {
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          }

                          if (isToolUIPart(part)) {
                            const toolName = getToolName(part);
                            const toolCallId = part.toolCallId;

                            if (
                              toolName === "gatherMcpInformation" &&
                              part.state === "input-available"
                            ) {
                              return (
                                <div key={toolCallId} className="space-y-3">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Gather MCP information:
                                    {" "}
                                    {(part.input as GatherMcpInformationInput)
                                      .fileName ||
                                      (part.input as GatherMcpInformationInput)
                                        .serverLink}
                                    ?
                                  </p>
                                  <MCPCard
                                    handelSubmit={async () => {
                                      await addToolResult({
                                        toolCallId,
                                        tool: toolName,
                                        output: "Yes, confirmed.",
                                      });
                                    }}
                                  />
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
            <PromptInputSubmit disabled={!text} />
          </PromptInputToolbar>
        </PromptInput>
      </CardFooter>
    </Card>
  );
};

export default ChatInput;
