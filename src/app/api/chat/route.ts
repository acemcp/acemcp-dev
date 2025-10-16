import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  ModelMessage,
  PrepareStepFunction,
  stepCountIs,
  streamObject,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { createMistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import z from "zod";
import fs from "fs";
import path from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGateway } from "@ai-sdk/gateway";
const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyD7qTXxvPibDvKhU_hduloMMap9B6YuHzM",
});

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY, // the default environment variable for the API key
  baseURL: "https://ai-gateway.vercel.sh/v1/ai", // the default base URL
});
const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

export const maxDuration = 30;

const MCPInputSchema = z
  .union([
    z.object({ fileName: z.string().min(1) }), // represents uploaded file
    z.object({
      serverLink: z.string().url("Must be a valid URL"),
      apiKey: z.string().min(1, "API Key is required"),
    }),
  ])
  .refine(
    (data) => {
      const hasFile = "fileName" in data && data.fileName;
      const hasServer = "serverLink" in data && data.serverLink && data.apiKey;
      return hasFile !== hasServer;
    },
    { message: "Provide either a file or MCP server link + API key" }
  );

export async function POST(req: Request) {
  const { messages, customKey }: { messages: UIMessage[]; customKey: string } =
    await req.json();

  // First step: Generate marketing copy
  const { text: copy } = await generateText({
    model: mistral("mistral-medium-latest"),

    prompt: `Write a System prompt for ${customKey} the business requirements and also focus of the user intent 
   
<Identity>
You are a helpful <Persona>Who or what the model is acting as. Also called "role" or "vision</Persona> who is an expert in ${customKey}
</Identity>
<Instructions>
 Only output a single word in your response with no additional formatting
  or commentary.
 Your response should only be one of the words "Positive", "Negative", or
  "Neutral" depending on the sentiment of the product review you are given.
</Instructions>
    }


    <Tone>Respond in a casual and technical manner.</Tone>
    exmple : 

    <OBJECTIVE_AND_PERSONA>
You are a [insert a persona, such as a "math teacher" or "automotive expert"]. Your task is to...
</OBJECTIVE_AND_PERSONA>

<INSTRUCTIONS>
To complete the task, you need to follow these steps:
1.
2.
...
</INSTRUCTIONS>

------------- Optional Components ------------

<CONSTRAINTS>
Dos and don'ts for the following aspects
1. Dos
2. Don'ts
</CONSTRAINTS>

<CONTEXT>
The provided context
</CONTEXT>

<OUTPUT_FORMAT>
The output format must be
1.
2.
...
</OUTPUT_FORMAT>

<FEW_SHOT_EXAMPLES>
Here we provide some examples:
1. Example #1
Input:
Thoughts:
Output:
...
</FEW_SHOT_EXAMPLES>

<RECAP>
Re-emphasize the key aspects of the prompt, especially the constraints, output format, etc.
</RECAP>
    `,
  });

  // Perform quality check on copy
  const { object: PromptMetaData } = await generateObject({
    model: mistral("mistral-medium-latest"),
    schema: z.object({
      Identity: z.string(),
      Instructions: z.string(),
      Tone: z.string(),
    }),
    prompt: `Evaluate this System prompt for Business requirements and user intent:
   and extract the proper Identity, Instructions  and Tone for the ai agent for the business

    Prompt to evaluate: ${copy}`,
  });

  console.log("PromptMetaData", PromptMetaData);

  // store in supbase
  // Store PromptMetaData to a file (for demo; use DB in production)
  const filePath = path.join(process.cwd(), "prompts.json");
  let prompts = [];
  if (fs.existsSync(filePath)) {
    prompts = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  prompts.push(PromptMetaData);
  fs.writeFileSync(filePath, JSON.stringify(prompts, null, 2));

  // If quality check fails, regenerate with more specific instructions

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        system:
          "You are an AI agent builder. When users ask you to create or develop an AI agent for a business, you must first gather MCP server information by calling the gatherMcpInformation tool ",
        model: mistral("mistral-large-latest"),
        messages: convertToModelMessages(messages),
        tools: {
          gatherMcpInformation: tool({
            description:
              "when asked to develope agnet show the Option to upload the Open Api schema file or connect the mcp server Link and API key ",
            inputSchema: MCPInputSchema,
            outputSchema: z.string(),
          }),
        },
        stopWhen: stepCountIs(5),

        toolChoice: "required",
        prepareStep: ({ steps, stepNumber, messages }) => {
          if (stepNumber > 10) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "gatherMcpInformation",
              },
            };
          }

          return undefined;
        },
      });

      let res = result.toolCalls?.then((toolCalls) => {
        console.log("toolCalls", toolCalls);
      });

      console.log("toolscal", res);
      writer.merge(result.toUIMessageStream({ originalMessages: messages }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
