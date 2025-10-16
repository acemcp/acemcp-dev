import { SystemPrompt } from "../api/generate/SystemPrompt";

export default function GeneratePage() {
  // Example usage of the generative UI component
  // In a real app, this data would come from the AI SDK
  const exampleProps = {
    role: "Customer Service Representative",
    industry: "Technology",
    tone: "Professional",
    goals: "Provide excellent customer support and resolve issues quickly",
    constraints: "Stay within company policies and escalate complex issues",
    tools: "Knowledge base, ticketing system, chat tools",
    function: "Customer support and issue resolution",
    generatedPrompt: "You are a professional customer service representative for a technology company. Your primary role is to assist customers with their technical issues, provide accurate information about our products and services, and ensure customer satisfaction. You should communicate clearly and professionally, avoid technical jargon unless the customer demonstrates understanding, and always prioritize customer needs while adhering to company policies. When faced with complex issues beyond your expertise, escalate to the appropriate team while keeping the customer informed.",
    metadata: {
      createdAt: new Date().toISOString(),
      version: "1.0"
    }
  };

  return <SystemPrompt {...exampleProps} />;
}
