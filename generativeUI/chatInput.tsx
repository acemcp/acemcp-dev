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

  const { messages, sendMessage, addToolResult, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const handleSubmit = (message: PromptInputMessage) => {
    console.log("clciked");

    if (!message.text && !message.files?.length) {
      return;
    }

    if (message.text) {
      sendMessage({ text: message.text });
    }
    // TODO: handle file attachments if necessary

    setText("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
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

                      // render confirmation tool (client-side tool with user interaction)
                      if (
                        toolName === "gatherMcpInformation" &&
                        part.state === "input-available"
                      ) {
                        return (
                          <div key={toolCallId}>
                            Gather MCP information:{" "}
                            {(part.input as GatherMcpInformationInput)
                              .fileName ||
                              (part.input as GatherMcpInformationInput)
                                .serverLink}
                            ?
                            <div>
                              <MCPCard
                                handelSubmit={async () => {
                                  await addToolResult({
                                    toolCallId,
                                    tool: toolName,
                                    output: "Yes, confirmed.",
                                  });
                                  // sendMessage({
                                  //   text: "I have sumiited the details for mcp config ",
                                  //   // Optional: additional data like files, metadata
                                  // });

                                  console.log(
                                    "called me again what to do next"
                                  );
                                }}
                              />
                              {/* <button
                          onClick={async () => {
                            await addToolResult({
                              toolCallId,
                              tool: toolName,
                              output: 'Yes, confirmed.',
                            });
                            sendMessage();
                          }}
                        >
                          Yes
                        </button> */}
                              {/* <button
                          onClick={async () => {
                            await addToolResult({
                              toolCallId,
                              tool: toolName,
                              output: 'No, denied.',
                            });
                            sendMessage();
                          }}
                        >
                          No
                        </button> */}
                            </div>
                          </div>
                        );
                      }
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
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
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatInput;
