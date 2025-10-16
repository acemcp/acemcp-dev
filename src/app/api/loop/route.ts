import { openai } from "@ai-sdk/openai";
import {
  createUIMessageStreamResponse,
  createUIMessageStream,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  UIMessage,
} from "ai";
import { z } from "zod";
import { ToolSet } from "ai";
import fs from "fs";
import path from "path";

import { createMistral } from "@ai-sdk/mistral";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

export const addNumbers = tool({
  description: "Add two numbers after human confirmation",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.number(),
  // no execute function -> HITL required
});

export const uploadFile = tool({
  description: "Upload a file for processing",
  inputSchema: z.object({ fileName: z.string() }), // just the name to show in the frontend
  outputSchema: z.string(),
  // no execute -> requires human confirmation
});

export const setupProject = tool({
  description: "Set up project using uploaded file",
  inputSchema: z.object({ filePath: z.string() }),
  outputSchema: z.string(),
  execute: async ({ filePath }) => {
    const projectDir = path.join(process.cwd(), "myProject");

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir);
    }

    // Copy the uploaded file into the project
    const fileName = path.basename(filePath);
    const targetPath = path.join(projectDir, fileName);
    fs.copyFileSync(filePath, targetPath);

    return `Project set up successfully with file: ${fileName}`;
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        model: mistral("mistral-large-latest"),
        messages: convertToModelMessages(messages),
        tools: {
          uploadFile,
          addNumbers,
          getWeatherInformation: tool({
            description: "show the weather in a given city to the user",
            inputSchema: z.object({ city: z.string() }),
            outputSchema: z.string(),
            execute: async ({ city }) => {
              const weatherOptions = ["sunny", "cloudy", "rainy", "snowy"];
              return weatherOptions[
                Math.floor(Math.random() * weatherOptions.length)
              ];
            },
          }),
        },
        stopWhen: stepCountIs(5),
        toolChoice: "auto",
      });

      writer.merge(result.toUIMessageStream({ originalMessages: messages }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
