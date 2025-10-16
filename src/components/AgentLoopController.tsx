import React, { useState, useEffect } from 'react';

type LoopState = 'idle' | 'observing' | 'thinking' | 'acting' | 'updating' | 'continuing' | 'done';

const AgentLoopController: React.FC<{ messages: any[] }> = ({ messages: externalMessages }) => {
  const [currentState, setCurrentState] = useState<LoopState>('idle');
  const [messages, setMessages] = useState<any[]>(externalMessages);
  const [hasResults, setHasResults] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setMessages(externalMessages);
  }, [externalMessages]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const nextStep = () => {
    switch (currentState) {
      case 'idle':
        setCurrentState('observing');
        addLog('Started observing messages');
        break;
      case 'observing':
        // Check for tool-call parts in messages
        const hasToolCalls = messages.some(msg => msg.parts?.some((part: any) => part.type === 'tool-call'));
        if (hasToolCalls) {
          setCurrentState('thinking');
          addLog('Observed messages, found tool calls to execute');
        } else {
          setCurrentState('done');
          addLog('No tool calls found, loop done');
        }
        break;
      case 'thinking':
        setCurrentState('acting');
        addLog('Found tool, executing');
        break;
      case 'acting':
        setHasResults(true);
        setCurrentState('updating');
        addLog('Tool executed, updating message');
        break;
      case 'updating':
        setCurrentState('continuing');
        addLog('Message updated');
        break;
      case 'continuing':
        setCurrentState('done');
        addLog('Loop complete');
        break;
      default:
        break;
    }
  };

  const reset = () => {
    setCurrentState('idle');
    setMessages([]);
    setHasResults(false);
    setLog([]);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Agentic Loop Controller</h2>
      <div>
        <strong>Current State:</strong> {currentState}
      </div>
      <div>
        <strong>Messages:</strong> {JSON.stringify(messages, null, 2)}
      </div>
      <div>
        <strong>Has Results:</strong> {hasResults ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Log:</strong>
        <ul>
          {log.map((entry, i) => <li key={i}>{entry}</li>)}
        </ul>
      </div>
      <button onClick={nextStep} disabled={currentState === 'done'}>Next Step</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default AgentLoopController;