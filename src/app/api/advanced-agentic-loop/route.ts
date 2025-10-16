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

// Advanced tool that generates code with detailed analysis
export const advancedGenerateCodeTool = tool({
  description: "Generate executable code for a given task with detailed analysis",
  inputSchema: z.object({
    task: z.string(),
    language: z.enum(["javascript", "python", "typescript", "bash", "go", "rust"]),
    complexity: z.enum(["simple", "medium", "complex"]),
  }),
  outputSchema: z.object({
    code: z.string(),
    explanation: z.string(),
    dependencies: z.array(z.string()),
    executionPlan: z.string(),
  }),
  execute: async ({ task, language, complexity }) => {
    // Generate more sophisticated code based on complexity
    let code = "";
    let explanation = "";
    let dependencies: string[] = [];
    let executionPlan = "";

    switch (complexity) {
      case "simple":
        code = `// Simple ${language} implementation for: ${task}\nconsole.log("${task} completed");`;
        explanation = `Generated simple ${language} code for ${task}`;
        executionPlan = "Execute directly without external dependencies";
        break;
      case "medium":
        code = `// Medium complexity ${language} code for: ${task}\n// Includes error handling and basic structure\nfunction executeTask() {\n  try {\n    console.log("Executing: ${task}");\n    return "Success";\n  } catch (error) {\n    console.error("Error:", error);\n    return "Failed";\n  }\n}\n\nexecuteTask();`;
        explanation = `Generated medium complexity ${language} code with error handling for ${task}`;
        dependencies = ["basic runtime"];
        executionPlan = "Execute with error handling, check return value";
        break;
      case "complex":
        code = `// Complex ${language} implementation for: ${task}\n// Multi-step process with validation and logging\n\nclass TaskExecutor {\n  constructor() {\n    this.steps = [];\n    this.logs = [];\n  }\n\n  async execute() {\n    console.log("Starting complex task: ${task}");\n    // Implementation steps would go here\n    this.log("Task completed successfully");\n    return { success: true, result: "Complex task result" };\n  }\n\n  log(message) {\n    const timestamp = new Date().toISOString();\n    this.logs.push(\`[\${timestamp}] \${message}\`);\n    console.log(message);\n  }\n}\n\nconst executor = new TaskExecutor();\nexecutor.execute().then(result => console.log("Final result:", result));`;
        explanation = `Generated complex ${language} code with class structure, logging, and async execution for ${task}`;
        dependencies = ["async runtime", "logging framework"];
        executionPlan = "Initialize executor, run async execution, monitor logs, validate final result";
        break;
    }

    return {
      code,
      explanation,
      dependencies,
      executionPlan,
    };
  },
});

// Advanced analysis tool with security and performance checks
export const advancedAnalyzeCodeTool = tool({
  description: "Perform comprehensive analysis of generated code including security, performance, and best practices",
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    task: z.string(),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    safe: z.boolean(),
    performance: z.string(),
    security: z.string(),
    recommendations: z.array(z.string()),
    complexity: z.string(),
    testSuggestions: z.array(z.string()),
  }),
  execute: async ({ code, language, task }) => {
    // Comprehensive analysis
    const analysis = `Comprehensive analysis of ${language} code for task: ${task}`;
    const safe = !code.includes("eval(") && !code.includes("exec(") && !code.includes("dangerous");
    const performance = code.includes("async") ? "Good - uses async patterns" : "Basic - synchronous execution";
    const security = safe ? "Secure - no dangerous operations detected" : "Warning - potentially unsafe operations";
    const recommendations = [
      "Add comprehensive error handling",
      "Include input validation",
      "Add logging for debugging",
      "Consider adding unit tests",
      "Review performance for large datasets"
    ];
    const complexity = code.split("\n").length > 20 ? "High" : code.split("\n").length > 10 ? "Medium" : "Low";
    const testSuggestions = [
      "Test with valid inputs",
      "Test with invalid inputs",
      "Test error conditions",
      "Performance testing with large datasets"
    ];

    return {
      analysis,
      safe,
      performance,
      security,
      recommendations,
      complexity,
      testSuggestions,
    };
  },
});

// Tool for generating execution preview (stops before actual execution)
export const executionPreviewTool = tool({
  description: "Generate a detailed execution preview without actually executing the code",
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    executionPlan: z.string(),
  }),
  outputSchema: z.object({
    preview: z.string(),
    estimatedTime: z.string(),
    resourceUsage: z.string(),
    potentialIssues: z.array(z.string()),
    readyToExecute: z.boolean(),
  }),
  execute: async ({ code, language, executionPlan }) => {
    // Generate execution preview without running code
    const preview = `Execution Preview for ${language} code:\n${executionPlan}\n\nCode will be executed in a controlled environment.`;
    const estimatedTime = code.includes("async") ? "Variable (async operations)" : "< 1 second";
    const resourceUsage = "Low - standard execution environment";
    const potentialIssues = [
      "Ensure all dependencies are available",
      "Check for network connectivity if required",
      "Verify file system permissions"
    ];
    const readyToExecute = true; // Always ready in preview mode

    return {
      preview,
      estimatedTime,
      resourceUsage,
      potentialIssues,
      readyToExecute,
    };
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      const result = streamText({
        system: `You are an advanced AI agent that generates and analyzes code through a sophisticated agentic loop.
Follow this precise workflow for each user request:

1. **Task Analysis**: Understand the user's requirements and determine complexity level
2. **Code Generation**: Use advancedGenerateCodeTool to create appropriate code with detailed planning
3. **Comprehensive Analysis**: Use advancedAnalyzeCodeTool for security, performance, and best practices review
4. **Execution Preview**: Use executionPreviewTool to show what would happen without executing
5. **User Review**: Present all information clearly and STOP - do not proceed to execution

CRITICAL: You MUST stop before any actual code execution. Show the user the complete analysis and preview, then wait for their approval.

Always use tools in sequence: generate -> analyze -> preview. Do not skip steps.`,
        model: mistral("mistral-large-latest"),
        messages: convertToModelMessages(messages),
        tools: {
          advancedGenerateCodeTool,
          advancedAnalyzeCodeTool,
          executionPreviewTool,
        },
        stopWhen: stepCountIs(15), // Allow more steps for complex analysis
        toolChoice: "required",
        prepareStep: ({ steps, stepNumber, messages }: Parameters<PrepareStepFunction>[0]) => {
          // Force tool usage in specific sequence
          if (stepNumber === 1) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "advancedGenerateCodeTool",
              },
            };
          }

          // After code generation, analyze it
          const lastStep = steps[steps.length - 1];
          if (lastStep && lastStep.toolResults.some(tr => tr.toolName === "advancedGenerateCodeTool")) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "advancedAnalyzeCodeTool",
              },
            };
          }

          // After analysis, create execution preview
          if (lastStep && lastStep.toolResults.some(tr => tr.toolName === "advancedAnalyzeCodeTool")) {
            return {
              toolChoice: {
                type: "tool",
                toolName: "executionPreviewTool",
              },
            };
          }

          return undefined;
        },
        onStepFinish: async (stepResult) => {
          console.log(`Advanced Agent Loop Step ${stepResult.stepNumber} finished:`, {
            text: stepResult.text,
            toolCalls: stepResult.toolCalls.length,
            finishReason: stepResult.finishReason,
          });
        },
      });

      writer.merge(result.toUIMessageStream({ originalMessages: messages }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}