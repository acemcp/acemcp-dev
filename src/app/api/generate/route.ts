import { createMistral } from "@ai-sdk/mistral";
import { generateText } from "ai";
import z from "zod";

const mistral = createMistral({
  apiKey: "cAdRTLCViAHCn0ddFFEe50ULu04MbUvZ",
});

export async function POST(req: Request) {
  try {
    const {
      role,
      industry,
      tone,
      goals,
      constraints,
      tools,
      function: specificFunction
    } = await req.json();

    // Validate required fields
    if (!role || !industry || !tone) {
      return new Response(
        JSON.stringify({ error: "Role, industry, and tone are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are an AI agent builder. Your task is to generate a business agent based on the following inputs:

<instruction>
You are an AI agent builder. Your task is to generate a business agent based on the following inputs:
</instruction>

<inputs>
<role>${role}</role>
<industry>${industry}</industry>
<tone>${tone}</tone>
${goals ? `<goals>${goals}</goals>` : ''}
${constraints ? `<constraints>${constraints}</constraints>` : ''}
${tools ? `<tools>${tools}</tools>` : ''}
${specificFunction ? `<function>${specificFunction}</function>` : ''}
</inputs>

<requirements>
<requirement>Act like a senior-level expert in the field</requirement>
<requirement>Use clear, professional language</requirement>
<requirement>Make decisions aligned with business outcomes</requirement>
<requirement>Avoid hallucination or overpromising</requirement>
<requirement>Use tools when appropriate</requirement>
</requirements>

<output_format>
Output only the final agent prompt — no explanation.
</output_format>`;

    const { text: agentPrompt } = await generateText({
      model: mistral("mistral-large-latest"),
      prompt: prompt,
    });

    return new Response(
      JSON.stringify({
        prompt: agentPrompt,
        metadata: {
          role,
          industry,
          tone,
          goals,
          constraints,
          tools,
          function: specificFunction,
          generatedAt: new Date().toISOString(),
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating system prompt:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
