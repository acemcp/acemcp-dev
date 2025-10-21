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
import { useRef, useState, useMemo } from "react";
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
import { DefaultChatTransport } from "ai";

const models = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus" },
];

const InputDemo = () => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: useWebSearch,
        },
      }
    );
    setText("");
  };

  const messageCount = useMemo(() => messages.length, [messages]);

  return (
    <Card className="mx-auto flex h-[640px] w-full max-w-5xl flex-col">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">Multi-Provider MCP Console</CardTitle>
        <p className="text-sm text-muted-foreground">
          Route prompts to managed MCP servers, toggle web search, or switch models instantly.
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-muted/10">
          <div className="flex items-center justify-between border-b px-4 py-3 text-sm text-muted-foreground">
            <span>{messageCount} messages</span>
            <span className="inline-flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-emerald-400" />
              MCP connected
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Conversation>
              <ConversationContent>
                {messages.length === 0 ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    <span className="font-medium">No activity yet</span>
                    <span>Send a prompt to see model responses here.</span>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            default:
                              return null;
                          }
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
              placeholder="Compose instructions for the selected MCP model..."
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
              <PromptInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!text && !messageCount} />
          </PromptInputToolbar>
        </PromptInput>
      </CardFooter>
    </Card>
  );
};

export default InputDemo;
