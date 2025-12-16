import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  Node,
} from 'reactflow';

import { PipelineToolbar } from './components/PipelineToolbar';
import { TextNode } from './components/nodes/TextNode';
import { 
  InputNode, 
  OutputNode, 
  LLMNode, 
  DatabaseNode, 
  TransformNode, 
  FilterNode, 
  APINode, 
  NoteNode 
} from './components/nodes/StandardNodes';

// Initial Nodes for demonstration
const initialNodes: Node[] = [
  { id: '1', type: 'customInput', position: { x: 100, y: 100 }, data: { inputName: 'userInput', inputType: 'Text' } },
  { id: '2', type: 'llm', position: { x: 400, y: 100 }, data: {} },
  { id: '3', type: 'customOutput', position: { x: 700, y: 100 }, data: { outputName: 'finalResult', outputType: 'Text' } },
  { id: '4', type: 'text', position: { x: 400, y: 300 }, data: { text: 'Translate this: {{ input }}' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'value', targetHandle: 'system' },
];

function PipelineEditor() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Define nodeTypes outside of render or memoize them
  const nodeTypes = useMemo(() => ({
    customInput: InputNode,
    customOutput: OutputNode,
    llm: LLMNode,
    text: TextNode,
    database: DatabaseNode,
    transform: TransformNode,
    filter: FilterNode,
    api: APINode,
    note: NoteNode,
  }), []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  // Alert Handler
  const handleSubmissionResult = (result: { num_nodes: number; num_edges: number; is_dag: boolean }) => {
    alert(
      `Pipeline Analysis:\n` +
      `------------------\n` +
      `Number of Nodes: ${result.num_nodes}\n` +
      `Number of Edges: ${result.num_edges}\n` +
      `Is DAG: ${result.is_dag ? 'Yes' : 'No'}`
    );
  };

  return (
    <div className="w-screen h-screen bg-slate-50">
      <PipelineToolbar onResult={handleSubmissionResult} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#94a3b8" gap={16} />
        <Controls className="bg-white border-slate-200 shadow-sm" />
        
        {/* Simple Palette for Demo purposes (Optional, just to show we can add nodes) */}
        <div className="absolute top-20 left-4 bg-white p-2 rounded-lg shadow-lg border border-slate-200 w-48 z-40">
           <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider px-2">Add Node</div>
           <div className="grid grid-cols-2 gap-2">
             {Object.keys(nodeTypes).map((type) => (
                <button
                  key={type}
                  className="text-xs p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 capitalize text-left"
                  onClick={() => {
                     const id = `${type}-${nodes.length + 1}`;
                     const newNode: Node = {
                       id,
                       type,
                       position: { x: Math.random() * 400, y: Math.random() * 400 },
                       data: { label: `${type} node` }
                     };
                     setNodes((nds) => nds.concat(newNode));
                  }}
                >
                  {type}
                </button>
             ))}
           </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <PipelineEditor />
    </ReactFlowProvider>
  );
}