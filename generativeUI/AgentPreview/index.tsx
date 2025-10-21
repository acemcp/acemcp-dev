'use client';

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Connection,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UIMessage, isToolOrDynamicToolUIPart, getToolOrDynamicToolName } from 'ai';

const initialNodes: Node[] = [
    {
        id: 'start',
        data: { label: 'Start' },
        position: { x: 250, y: 5 },
        type: 'input',
    },
];

interface AgentPreviewProps {
    messages: UIMessage[];
}

const AgentPreview: React.FC<AgentPreviewProps> = ({ messages }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const newNodes: Node[] = [...initialNodes];
        const newEdges: Edge[] = [];
        const toolNodes: { [toolName: string]: Node } = {};

        messages.forEach(message => {
            if (message.role === 'assistant') {
                message.parts.forEach(part => {
                    if (isToolOrDynamicToolUIPart(part)) {
                        const toolName = getToolOrDynamicToolName(part);

                        let style = {};
                        if (part.state === 'input-available') {
                            style = { backgroundColor: '#34D399', color: 'white' }; // Green for input ready
                        } else if (part.state === 'output-available') {
                            style = { backgroundColor: '#3B82F6', color: 'white' }; // Blue for output ready
                        } else if (part.state === 'output-error') {
                            style = { backgroundColor: '#EF4444', color: 'white' }; // Red for error
                        }

                        if (!toolNodes[toolName]) {
                            const yPos = 100 + Object.keys(toolNodes).length * 100;
                            toolNodes[toolName] = {
                                id: toolName,
                                data: { label: `${toolName} (${part.state})` },
                                position: { x: 250, y: yPos },
                                style,
                            };
                            newNodes.push(toolNodes[toolName]);

                            newEdges.push({
                                id: `e-start-${toolName}`,
                                source: 'start',
                                target: toolName,
                            });
                        } else {
                            // Update existing node
                            toolNodes[toolName].data.label = `${toolName} (${part.state})`;
                            toolNodes[toolName].style = style;
                        }
                    }
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [messages, setNodes, setEdges]);

    const onConnect = useCallback(
        (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
        [setEdges],
    );

    return (
        <div className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                style={{ background: "transparent" }}
            />
        </div>
    );
};

export default AgentPreview;