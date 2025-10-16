"use client";
import React, { useState, useEffect, useRef } from 'react';
import { UIMessage } from 'ai';

type LoopState = 'idle' | 'generating' | 'analyzing' | 'reviewing' | 'executing' | 'completed';

interface CodeGeneration {
  id: string;
  task: string;
  language: string;
  code: string;
  analysis?: {
    safe: boolean;
    recommendations: string[];
  };
  status: 'generating' | 'generated' | 'analyzing' | 'analyzed' | 'approved' | 'executed';
}

interface AdvancedAgentLoopControllerProps {
  messages: UIMessage[];
  onExecuteCode?: (codeId: string) => void;
  onApproveCode?: (codeId: string) => void;
}

const AdvancedAgentLoopController: React.FC<AdvancedAgentLoopControllerProps> = ({
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
    // Process messages to extract code generations and streaming text
    const processMessages = () => {
      const newCodeGenerations: CodeGeneration[] = [];
      let currentStreamingText = '';

      messages.forEach((message) => {
        if (message.role === 'assistant') {
          message.parts.forEach((part) => {
            if (part.type === 'text') {
              currentStreamingText += part.text;
            } else if (part.type.startsWith('tool-')) {
              // Extract tool call information
              const toolName = part.type.replace('tool-', '');
              if (toolName === 'generateCodeTool' && part.state === 'output-available') {
                const output = part.output as any;
                if (output?.code) {
                  newCodeGenerations.push({
                    id: part.toolCallId,
                    task: part.input?.task || 'Unknown task',
                    language: part.input?.language || 'javascript',
                    code: output.code,
                    status: 'generated',
                  });
                }
              } else if (toolName === 'analyzeCodeTool' && part.state === 'output-available') {
                const output = part.output as any;
                if (output?.analysis) {
                  // Find the corresponding code generation
                  const codeGen = newCodeGenerations.find(cg => cg.status === 'generated');
                  if (codeGen) {
                    codeGen.analysis = {
                      safe: output.safe,
                      recommendations: output.recommendations,
                    };
                    codeGen.status = 'analyzed';
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
        setCurrentState('analyzing');
      } else if (newCodeGenerations.some(cg => cg.status === 'analyzed')) {
        setCurrentState('reviewing');
      } else if (currentStreamingText) {
        setCurrentState('generating');
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
    setCurrentState('executing');
    addLog(`Code ${codeId} approved for execution`);
    onApproveCode?.(codeId);
  };

  const executeCode = (codeId: string) => {
    setCodeGenerations(prev =>
      prev.map(cg =>
        cg.id === codeId ? { ...cg, status: 'executed' as const } : cg
      )
    );
    setCurrentState('completed');
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
        Advanced Agentic Loop Controller
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
          {currentState.toUpperCase()}
        </span>
      </div>

      {/* Streaming Text Display */}
      {streamingText && (
        <div style={{ marginBottom: '20px' }}>
          <strong>AI Reasoning:</strong>
          <div style={{
            padding: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginTop: '5px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {streamingText}
          </div>
        </div>
      )}

      {/* Code Generations */}
      {codeGenerations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <strong>Generated Code:</strong>
          {codeGenerations.map((codeGen) => (
            <div key={codeGen.id} style={{
              marginTop: '10px',
              padding: '15px',
              backgroundColor: '#ffffff',
              border: '1px solid #ddd',
              borderRadius: '6px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Task:</strong> {codeGen.task} |
                <strong> Language:</strong> {codeGen.language} |
                <strong> Status:</strong>
                <span style={{
                  color: getStatusColor(codeGen.status),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {codeGen.status.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Code:</strong>
                <pre style={{
                  backgroundColor: '#f6f8fa',
                  padding: '10px',
                  borderRadius: '4px',
                  overflowX: 'auto',
                  fontSize: '14px',
                  margin: '5px 0'
                }}>
                  {codeGen.code}
                </pre>
              </div>

              {codeGen.analysis && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Analysis:</strong>
                  <div style={{
                    padding: '8px',
                    backgroundColor: codeGen.analysis.safe ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${codeGen.analysis.safe ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    margin: '5px 0'
                  }}>
                    <div><strong>Safe:</strong> {codeGen.analysis.safe ? 'Yes' : 'No'}</div>
                    <div><strong>Recommendations:</strong></div>
                    <ul>
                      {codeGen.analysis.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {codeGen.status === 'analyzed' && (
                  <button
                    onClick={() => approveCode(codeGen.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Approve Code
                  </button>
                )}

                {codeGen.status === 'approved' && (
                  <button
                    onClick={() => executeCode(codeGen.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
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
        <strong>Activity Log:</strong>
        <div style={{
          maxHeight: '150px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginTop: '5px'
        }}>
          {log.length === 0 ? (
            <div style={{ padding: '10px', color: '#666' }}>No activity yet</div>
          ) : (
            log.map((entry, i) => (
              <div key={i} style={{
                padding: '5px 10px',
                borderBottom: i < log.length - 1 ? '1px solid #eee' : 'none',
                fontSize: '14px'
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
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Loop
        </button>
      </div>
    </div>
  );
};

// Helper functions for styling
const getStateColor = (state: LoopState): string => {
  switch (state) {
    case 'idle': return '#6c757d';
    case 'generating': return '#ffc107';
    case 'analyzing': return '#17a2b8';
    case 'reviewing': return '#fd7e14';
    case 'executing': return '#007bff';
    case 'completed': return '#28a745';
    default: return '#6c757d';
  }
};

const getStatusColor = (status: CodeGeneration['status']): string => {
  switch (status) {
    case 'generating': return '#ffc107';
    case 'generated': return '#007bff';
    case 'analyzing': return '#17a2b8';
    case 'analyzed': return '#fd7e14';
    case 'approved': return '#28a745';
    case 'executed': return '#20c997';
    default: return '#6c757d';
  }
};

export default AdvancedAgentLoopController;