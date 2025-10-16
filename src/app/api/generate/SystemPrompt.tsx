interface SystemPromptProps {
  role: string;
  industry: string;
  tone: string;
  goals?: string;
  constraints?: string;
  tools?: string;
  function?: string;
  generatedPrompt: string;
  metadata: {
    createdAt: string;
    version: string;
  };
}

export function SystemPrompt(props: SystemPromptProps) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Generated System Prompt</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Configuration</h2>
        <p><strong>Role:</strong> {props.role}</p>
        <p><strong>Industry:</strong> {props.industry}</p>
        <p><strong>Tone:</strong> {props.tone}</p>
        {props.goals && <p><strong>Goals:</strong> {props.goals}</p>}
        {props.constraints && <p><strong>Constraints:</strong> {props.constraints}</p>}
        {props.tools && <p><strong>Tools:</strong> {props.tools}</p>}
        {props.function && <p><strong>Function:</strong> {props.function}</p>}
      </div>
      <div>
        <h2>Generated Prompt</h2>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace"
        }}>
          {props.generatedPrompt}
        </pre>
      </div>
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>Created: {props.metadata.createdAt}</p>
        <p>Version: {props.metadata.version}</p>
      </div>
    </div>
  );
}