import React, { useState, useEffect } from 'react';

interface Tool {
  description: string;
  inputSchema: {
    jsonSchema: {
      properties: Record<string, any>;
      required: string[];
    };
  };
  type: string;
}

const ToolController: React.FC = () => {
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/mcp');
        const data = await response.json();
        setTools(data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };
    fetchTools();
  }, []);

  const handleInputChange = (key: string, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const executeTool = async () => {
    if (!selectedTool) return;
    try {
      // Simulate tool execution (replace with actual API call if needed)
      const mockResult = `Executed ${selectedTool} with inputs: ${JSON.stringify(inputs)}`;
      setResult(mockResult);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h2>Agent Tool Controller</h2>
      <div>
        <label>Select Tool:</label>
        <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}>
          <option value="">-- Select --</option>
          {Object.keys(tools).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      {selectedTool && tools[selectedTool] && (
        <div>
          <h3>{selectedTool}</h3>
          <p>{tools[selectedTool].description}</p>
          <div>
            {Object.entries(tools[selectedTool].inputSchema.jsonSchema.properties).map(([key, prop]: [string, any]) => (
              <div key={key}>
                <label>{key} ({prop.type}):</label>
                <input
                  type="text"
                  value={inputs[key] || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={prop.description}
                />
              </div>
            ))}
          </div>
          <button onClick={executeTool}>Execute Tool</button>
        </div>
      )}
      {result && (
        <div>
          <h4>Result:</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ToolController;