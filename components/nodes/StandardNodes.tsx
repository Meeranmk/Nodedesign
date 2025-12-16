import React, { useState } from 'react';
import { BaseNode } from './BaseNode';
import { 
  ArrowRightToLine, 
  ArrowLeftFromLine, 
  Bot, 
  Database, 
  Code, 
  Filter, 
  Globe, 
  StickyNote,
  Play,
  Loader2
} from 'lucide-react';

/**
 * We use the BaseNode abstraction to quickly define these nodes.
 */

// 1. Input Node
export const InputNode = ({ id, data, selected }: any) => {
  const [currName, setCurrName] = React.useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = React.useState(data.inputType || 'Text');

  return (
    <BaseNode
      id={id}
      title="Input"
      icon={<ArrowRightToLine size={16} />}
      selected={selected}
      handles={[{ id: 'value', type: 'source', position: 'right' }]}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Field Name</label>
          <input 
            type="text" 
            value={currName} 
            onChange={(e) => setCurrName(e.target.value)}
            className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col">
           <label className="text-xs text-slate-500 mb-1">Type</label>
           <select 
            value={inputType} 
            onChange={(e) => setInputType(e.target.value)}
            className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none"
           >
             <option value="Text">Text</option>
             <option value="File">File</option>
           </select>
        </div>
      </div>
    </BaseNode>
  );
};

// 2. Output Node
export const OutputNode = ({ id, data, selected }: any) => {
  const [currName, setCurrName] = React.useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = React.useState(data.outputType || 'Text');

  return (
    <BaseNode
      id={id}
      title="Output"
      icon={<ArrowLeftFromLine size={16} />}
      selected={selected}
      handles={[{ id: 'value', type: 'target', position: 'left' }]}
    >
       <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Field Name</label>
          <input 
            type="text" 
            value={currName} 
            onChange={(e) => setCurrName(e.target.value)}
            className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none focus:border-primary"
          />
        </div>
         <div className="flex flex-col">
           <label className="text-xs text-slate-500 mb-1">Type</label>
           <select 
            value={outputType} 
            onChange={(e) => setOutputType(e.target.value)}
            className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none"
           >
             <option value="Text">Text</option>
             <option value="Image">Image</option>
           </select>
        </div>
      </div>
    </BaseNode>
  );
};

// 3. LLM Node (Interactive with Gemini REST API)
export const LLMNode = ({ id, selected }: any) => {
  const [prompt, setPrompt] = useState('Tell me a joke');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse('');
    
    try {
      const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found in process.env");
      }

      // Use REST API directly to avoid package dependency issues in the preview
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!fetchResponse.ok) {
        const errData = await fetchResponse.json();
        throw new Error(errData.error?.message || fetchResponse.statusText);
      }

      const data = await fetchResponse.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setResponse(text || 'No text returned.');
      
    } catch (error: any) {
      console.error(error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Gemini LLM"
      icon={<Bot size={16} />}
      selected={selected}
      handles={[
        { id: 'system', type: 'target', position: 'left', label: 'System' },
        { id: 'prompt', type: 'target', position: 'left', label: 'Prompt' },
        { id: 'response', type: 'source', position: 'right', label: 'Response' }
      ]}
      className="!w-80"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 font-medium">Prompt</label>
          <textarea
            className="w-full h-16 text-xs p-2 rounded border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={handleRun}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-1.5 bg-secondary text-white rounded text-xs font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin"/> : <Play size={12} fill="currentColor"/>}
          {loading ? 'Generating...' : 'Run Model'}
        </button>

        {response && (
          <div className="flex flex-col gap-1 animate-in fade-in zoom-in duration-200">
            <label className="text-xs text-slate-500 font-medium">Response</label>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};

// 4. Database Node
export const DatabaseNode = ({ id, selected }: any) => {
  return (
    <BaseNode
      id={id}
      title="Database"
      icon={<Database size={16} />}
      selected={selected}
      handles={[
        { id: 'query', type: 'target', position: 'left' },
        { id: 'result', type: 'source', position: 'right' }
      ]}
    >
       <div className="text-xs text-slate-600">
         Executes query against connected DB.
       </div>
    </BaseNode>
  );
};

// 5. Transform Node
export const TransformNode = ({ id, selected }: any) => {
  return (
    <BaseNode
      id={id}
      title="Transform"
      icon={<Code size={16} />}
      selected={selected}
      handles={[
        { id: 'input', type: 'target', position: 'left' },
        { id: 'output', type: 'source', position: 'right' }
      ]}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Javascript Snippet</label>
        <div className="h-16 w-full bg-slate-100 rounded border border-slate-200 p-2 text-[10px] font-mono text-slate-400">
          // code here
        </div>
      </div>
    </BaseNode>
  );
};

// 6. Filter Node
export const FilterNode = ({ id, selected }: any) => {
  return (
    <BaseNode
      id={id}
      title="Filter"
      icon={<Filter size={16} />}
      selected={selected}
      handles={[
        { id: 'input', type: 'target', position: 'left' },
        { id: 'true', type: 'source', position: 'right' },
        { id: 'false', type: 'source', position: 'right' }
      ]}
    >
      <div className="text-xs text-slate-600">
        Routes data based on condition.
      </div>
    </BaseNode>
  );
};

// 7. API Node
export const APINode = ({ id, selected }: any) => {
  return (
    <BaseNode
      id={id}
      title="API Call"
      icon={<Globe size={16} />}
      selected={selected}
      handles={[
        { id: 'params', type: 'target', position: 'left' },
        { id: 'response', type: 'source', position: 'right' }
      ]}
    >
      <div className="flex flex-col gap-2">
        <input 
          type="text" 
          placeholder="https://api.example.com"
          className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none" 
        />
        <select className="w-full text-xs p-1.5 rounded border border-slate-200 outline-none">
          <option>GET</option>
          <option>POST</option>
        </select>
      </div>
    </BaseNode>
  );
};

// 8. Note Node
export const NoteNode = ({ id, selected, data }: any) => {
  return (
    <BaseNode
      id={id}
      title="Note"
      icon={<StickyNote size={16} />}
      selected={selected}
      handles={[]}
    >
       <textarea 
          className="w-full h-20 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded text-slate-700 resize-none outline-none"
          placeholder="Add a note..."
          defaultValue={data?.text}
       />
    </BaseNode>
  );
};