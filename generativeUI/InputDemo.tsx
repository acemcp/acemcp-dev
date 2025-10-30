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
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar, // <-- 1. IMPORTED
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { Shimmer } from "@/components/ai-elements/shimmer"; // Import the Shimmer component
import { DefaultChatTransport } from "ai";

const models = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus" },
];

// --- 2. ADDED CONSTANTS FOR AVATARS ---
const USER_AVATAR = "https://github.com/haydenbleasel.png";
const USER_NAME = "User";
const ASSISTANT_AVATAR = "https://github.com/openai.png";
const ASSISTANT_NAME = "Assistant";
// ----------------------------------------

const InputDemo = ({ projectId }: any) => {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
      body: {
        projectId: projectId,
      },
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




  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Conversation Area - Takes up remaining space */}
      <div className="flex-1 overflow-y-auto">
        <Conversation className="h-full">
          <ConversationContent className="bg-background">
            {/* --- 3. UPDATED RENDER LOOP --- */}
            {messages?.map((message) => {
              // Only render user and assistant messages
              if (message.role !== "user" && message.role !== "assistant") {
                return null;
              }

              const isUser = message.role === "user";

              return (
                <Message from={message.role} key={message.id}>
                  {/* This <div> wrapper is needed for layout, just like in Example.tsx */}
                  <div>
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
                  </div>
                  {/* Add the Avatar component */}
                  <MessageAvatar
                    name={isUser ? USER_NAME : ASSISTANT_NAME}
                    src={isUser ? USER_AVATAR : ASSISTANT_AVATAR}
                  />
                </Message>
              );
            })}
            {/* ------------------------------- */}

            {/* --- 4. UPDATED LOADING STATE --- */}
            {status === "submitted" && (
              <Message from="assistant">
                {/* Added the <div> wrapper */}
                <div>
                  <MessageContent>
                    <Shimmer>{" Generating Response... "}</Shimmer>
                  </MessageContent>
                </div>
                {/* Added the Avatar */}
                <MessageAvatar name={ASSISTANT_NAME} src={ASSISTANT_AVATAR} />
              </Message>
            )}
            {/* --------------------------------- */}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <div className="p-4">
          <PromptInput onSubmit={handleSubmit} globalDrop multiple>
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </PromptInputBody>
            <PromptInputFooter>
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
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!text && !status}
                status={status}
                className="bg-[#5F96F1] hover:bg-[#5F96F1]/80 text-white"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default InputDemo;
