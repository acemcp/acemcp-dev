"use client";
import React, { useState, useEffect, useRef } from 'react';
import { UIMessage } from 'ai';

type LoopState = 'idle' | 'analyzing' | 'generating' | 'analyzing-code' | 'previewing' | 'reviewing' | 'ready-to-execute';

interface CodeGeneration {
  id: string;
  task: string;
  language: string;
  complexity: string;
  code: string;
  explanation: string;
  dependencies: string[];
  executionPlan: string;
  analysis?: {
    safe: boolean;
    performance: string;
    security: string;
    recommendations: string[];
    complexity: string;
    testSuggestions: string[];
  };
  preview?: {
    preview: string;
    estimatedTime: string;
    resourceUsage: string;
    potentialIssues: string[];
    readyToExecute: boolean;
  };
  status: 'generated' | 'analyzed' | 'previewed' | 'approved' | 'executed';
}

interface AdvancedAgenticLoopControllerV2Props {
  messages: UIMessage[];
  onExecuteCode?: (codeId: string) => void;
  onApproveCode?: (codeId: string) => void;
}

const AdvancedAgenticLoopControllerV2: React.FC<AdvancedAgenticLoopControllerV2Props> = ({
  messages,
  onExecuteCode,
  onApproveCode,
}) => {
  const [currentState, setCurrentState] = useState<LoopState>('idle');
  const [codeGenerations, setCodeGenerations] = useState<CodeGeneration[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const streamingRef = useRef<string>('');

  useEffect(() => {
    const processMessages = () => {
      const newCodeGenerations: CodeGeneration[] = [];
      let currentStreamingText = '';

      messages.forEach((message) => {
        if (message.role === 'assistant') {
          message.parts.forEach((part) => {
            if (part.type === 'text') {
              currentStreamingText += part.text;
            } else if (part.type.startsWith('tool-')) {
              const toolName = part.type.replace('tool-', '');
              if (toolName === 'advancedGenerateCodeTool' && part.state === 'output-available') {
                const output = part.output as any;
                if (output?.code) {
                  newCodeGenerations.push({
                    id: part.toolCallId,
                    task: part.input?.task || 'Unknown task',
                    language: part.input?.language || 'javascript',
                    complexity: part.input?.complexity || 'simple',
                    code: output.code,
                    explanation: output.explanation,
                    dependencies: output.dependencies,
                    executionPlan: output.executionPlan,
                    status: 'generated',
                  });
                }
              } else if (toolName === 'advancedAnalyzeCodeTool' && part.state === 'output-available') {
                const output = part.output as any;
                if (output?.analysis) {
                  const codeGen = newCodeGenerations.find(cg => cg.status === 'generated');
                  if (codeGen) {
                    codeGen.analysis = {
                      safe: output.safe,
                      performance: output.performance,
                      security: output.security,
                      recommendations: output.recommendations,
                      complexity: output.complexity,
                      testSuggestions: output.testSuggestions,
                    };
                    codeGen.status = 'analyzed';
                  }
                }
              } else if (toolName === 'executionPreviewTool' && part.state === 'output-available') {
                const output = part.output as any;
                if (output?.preview) {
                  const codeGen = newCodeGenerations.find(cg => cg.status === 'analyzed');
                  if (codeGen) {
                    codeGen.preview = {
                      preview: output.preview,
                      estimatedTime: output.estimatedTime,
                      resourceUsage: output.resourceUsage,
                      potentialIssues: output.potentialIssues,
                      readyToExecute: output.readyToExecute,
                    };
                    codeGen.status = 'previewed';
                  }
                }
              }
            }
          });
        }
      });

      setCodeGenerations(newCodeGenerations);
      setStreamingText(currentStreamingText);

      // Update state based on current processing
      if (newCodeGenerations.some(cg => cg.status === 'generated' && !cg.analysis)) {
        setCurrentState('analyzing-code');
      } else if (newCodeGenerations.some(cg => cg.status === 'analyzed' && !cg.preview)) {
        setCurrentState('previewing');
      } else if (newCodeGenerations.some(cg => cg.status === 'previewed')) {
        setCurrentState('reviewing');
      } else if (currentStreamingText && newCodeGenerations.length === 0) {
        setCurrentState('analyzing');
      } else if (newCodeGenerations.some(cg => cg.status === 'approved')) {
        setCurrentState('ready-to-execute');
      }
    };

    processMessages();
  }, [messages]);

  const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const approveCode = (codeId: string) => {
    setCodeGenerations(prev =>
      prev.map(cg =>
        cg.id === codeId ? { ...cg, status: 'approved' as const } : cg
      )
    );
    setCurrentState('ready-to-execute');
    addLog(`Code ${codeId} approved for execution`);
    onApproveCode?.(codeId);
  };

  const executeCode = (codeId: string) => {
    setCodeGenerations(prev =>
      prev.map(cg =>
        cg.id === codeId ? { ...cg, status: 'executed' as const } : cg
      )
    );
    setCurrentState('idle');
    addLog(`Code ${codeId} executed successfully`);
    onExecuteCode?.(codeId);
  };

  const reset = () => {
    setCurrentState('idle');
    setCodeGenerations([]);
    setStreamingText('');
    setLog([]);
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #007acc',
      borderRadius: '8px',
      margin: '10px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{ color: '#007acc', marginBottom: '20px' }}>
        Advanced Agentic Loop Controller V2 - Code Generation Streaming
      </h2>

      {/* Current State Display */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Current State:</strong>
        <span style={{
          display: 'inline-block',
          padding: '4px 8px',
          marginLeft: '10px',
          borderRadius: '4px',
          backgroundColor: getStateColor(currentState),
          color: 'white',
          fontWeight: 'bold'
        }}>
          {currentState.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* Streaming Text Display */}
      {streamingText && (
        <div style={{ marginBottom: '20px' }}>
          <strong>AI Agent Reasoning Stream:</strong>
          <div style={{
            padding: '15px',
            backgroundColor: '#ffffff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            marginTop: '5px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            maxHeight: '300px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {streamingText}
          </div>
        </div>
      )}

      {/* Code Generations */}
      {codeGenerations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <strong>Generated Code Analysis:</strong>
          {codeGenerations.map((codeGen) => (
            <div key={codeGen.id} style={{
              marginTop: '15px',
              padding: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span><strong>Task:</strong> {codeGen.task}</span>
                  <span><strong>Language:</strong> {codeGen.language}</span>
                  <span><strong>Complexity:</strong> {codeGen.complexity}</span>
                  <span><strong>Status:</strong>
                    <span style={{
                      color: getStatusColor(codeGen.status),
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {codeGen.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <div><strong>Explanation:</strong> {codeGen.explanation}</div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Generated Code:</strong>
                <pre style={{
                  backgroundColor: '#f6f8fa',
                  padding: '15px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  fontSize: '13px',
                  margin: '8px 0',
                  border: '1px solid #e1e4e8'
                }}>
                  {codeGen.code}
                </pre>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div><strong>Dependencies:</strong> {codeGen.dependencies.join(', ') || 'None'}</div>
                <div><strong>Execution Plan:</strong> {codeGen.executionPlan}</div>
              </div>

              {codeGen.analysis && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Advanced Analysis:</strong>
                  <div style={{
                    padding: '12px',
                    backgroundColor: codeGen.analysis.safe ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${codeGen.analysis.safe ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '6px',
                    margin: '8px 0'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div><strong>Safe:</strong> {codeGen.analysis.safe ? 'Yes' : 'No'}</div>
                      <div><strong>Complexity:</strong> {codeGen.analysis.complexity}</div>
                      <div><strong>Performance:</strong> {codeGen.analysis.performance}</div>
                      <div><strong>Security:</strong> {codeGen.analysis.security}</div>
                    </div>
                    <div><strong>Recommendations:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {codeGen.analysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                    <div><strong>Test Suggestions:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {codeGen.analysis.testSuggestions.map((test, idx) => (
                        <li key={idx}>{test}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {codeGen.preview && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Execution Preview:</strong>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '6px',
                    margin: '8px 0'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px', fontFamily: 'monospace' }}>
                      {codeGen.preview.preview}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div><strong>Estimated Time:</strong> {codeGen.preview.estimatedTime}</div>
                      <div><strong>Resource Usage:</strong> {codeGen.preview.resourceUsage}</div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <strong>Potential Issues:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {codeGen.preview.potentialIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                    <div><strong>Ready to Execute:</strong> {codeGen.preview.readyToExecute ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {codeGen.status === 'previewed' && (
                  <button
                    onClick={() => approveCode(codeGen.id)}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Approve for Execution
                  </button>
                )}

                {codeGen.status === 'approved' && (
                  <button
                    onClick={() => executeCode(codeGen.id)}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Execute Code
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Log */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Agent Loop Activity Log:</strong>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          marginTop: '5px'
        }}>
          {log.length === 0 ? (
            <div style={{ padding: '15px', color: '#666' }}>No activity yet - start by submitting a task</div>
          ) : (
            log.map((entry, i) => (
              <div key={i} style={{
                padding: '8px 15px',
                borderBottom: i < log.length - 1 ? '1px solid #eee' : 'none',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Reset Agent Loop
        </button>
      </div>
    </div>
  );
};

// Helper functions for styling
const getStateColor = (state: LoopState): string => {
  switch (state) {
    case 'idle': return '#6c757d';
    case 'analyzing': return '#ffc107';
    case 'generating': return '#17a2b8';
    case 'analyzing-code': return '#fd7e14';
    case 'previewing': return '#e83e8c';
    case 'reviewing': return '#20c997';
    case 'ready-to-execute': return '#007bff';
    default: return '#6c757d';
  }
};

const getStatusColor = (status: CodeGeneration['status']): string => {
  switch (status) {
    case 'generated': return '#007bff';
    case 'analyzed': return '#fd7e14';
    case 'previewed': return '#20c997';
    case 'approved': return '#28a745';
    case 'executed': return '#6c757d';
    default: return '#6c757d';
  }
};

export default AdvancedAgenticLoopControllerV2;