import { openai } from "@ai-sdk/openai";
import {
  createUIMessageStreamResponse,
  createUIMessageStream,
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  UIMessage,
  PrepareStepFunction,
} from "ai";
import { z } from "zod";
import { createMistral } from "@ai-sdk/mistral";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

// Tool that generates code for execution but doesn't execute it
export const generateCodeTool = tool({
  description: "Generate executable code for a given task",
  inputSchema: z.object({
    task: z.string(),
    language: z.enum(["javascript", "python", "typescript", "bash"]),
  }),
  outputSchema: z.object({
    code: z.string(),
    explanation: z.string(),
  }),
  execute: async ({ task, language }) => {
    // This will generate code but we'll stop before execution
    return {
      code: `// Generated ${language} code for: ${task}\nconsole.log("Code generated but not executed");`,
      explanation: `Generated ${language} code to ${task}`,
    };
  },
});

// Tool for analyzing code before execution
export const analyzeCodeTool = tool({
  description: "Analyze generated code for safety and correctness",
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    safe: z.boolean(),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ code, language }) => {
    // Mock analysis - in real implementation this would do actual code analysis
    return {
      analysis: `Analyzed ${language} code`,
      safe: true,
      recommendations: ["Code looks good", "Consider adding error handling"],
    };
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        system: `You are an advanced AI agent that generates code for tasks but stops before execution.
When a user asks you to perform a task, follow these steps:
1. Analyze the task requirements
2. Generate appropriate code using the generateCodeTool
3. Analyze the generated code using the analyzeCodeTool
4. Present the code to the user for review
5. Stop before actual execution - let the user decide whether to proceed

Always use tools to generate and analyze code. Show your reasoning process clearly.`,
        model: mistral("mistral-large-latest"),
        messages: convertToModelMessages(messages),
        tools: {
          generateCodeTool,
          analyzeCodeTool,
        },
        stopWhen: stepCountIs(10), // Allow multiple steps for complex tasks
        toolChoice: "required",
        prepareStep: ({ steps, stepNumber, messages }: Parameters<PrepareStepFunction>[0]) => {
          // Force tool usage for code generation tasks
          if (stepNumber === 1) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "generateCodeTool",
              },
            };
          }

          // After code generation, analyze it
          const lastStep = steps[steps.length - 1];
          if (lastStep && lastStep.toolResults.some(tr => tr.toolName === "generateCodeTool")) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "analyzeCodeTool",
              },
            };
          }

          return undefined;
        },

      });

      writer.merge(result.toUIMessageStream({ originalMessages: messages }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}