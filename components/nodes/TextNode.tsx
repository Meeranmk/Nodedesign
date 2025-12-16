import React, { useState, useEffect } from 'react';
import { HandleConfig } from '../../types';
import { BaseNode } from './BaseNode';
import { FileText } from 'lucide-react';

interface TextNodeProps {
  id: string;
  data: {
    text?: string;
    label?: string;
  };
  selected?: boolean;
}

export const TextNode: React.FC<TextNodeProps> = ({ id, data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [variableHandles, setVariableHandles] = useState<HandleConfig[]>([]);

  // Parse variables: {{ variable }}
  useEffect(() => {
    const regex = /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g;
    const matches = [...currText.matchAll(regex)];
    const variables = Array.from(new Set(matches.map(m => m[1])));
    
    const newHandles: HandleConfig[] = variables.map(v => ({
      id: `${id}-${v}`,
      label: v,
      type: 'target',
      position: 'left'
    }));

    setVariableHandles(newHandles);
  }, [currText, id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrText(e.target.value);
  };

  const outputHandle: HandleConfig = { id: 'output', type: 'source', position: 'right' };
  const allHandles = [...variableHandles, outputHandle];

  return (
    <BaseNode
      id={id}
      title="Text"
      icon={<FileText size={16} />}
      handles={allHandles}
      selected={selected}
      // Enable dynamic width by overriding fixed width. 
      // Set constraints: min 16rem, max 40rem.
      className="!w-auto min-w-[16rem] max-w-2xl" 
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500 font-medium">
          Template Text
          <span className="block text-[10px] text-slate-400 font-normal">
            Supports variables like {'{{ var }}'}
          </span>
        </label>
        
        {/* Auto-growing Container */}
        <div className="relative min-h-[80px] text-xs font-mono leading-relaxed">
           
           {/* 
             Invisible Mirror Div:
             Replicates the textarea's content and styling exactly to force the container 
             to grow in both width and height.
           */}
           <div 
             className="invisible p-2 border border-transparent whitespace-pre-wrap break-words"
             aria-hidden="true"
           >
             {currText + '\u200b'} {/* Zero-width space ensures empty lines have height */}
           </div>

           {/* 
             Interactive Textarea:
             Positioned absolutely to fill the container defined by the mirror.
           */}
           <textarea
             value={currText}
             onChange={handleTextChange}
             className="absolute inset-0 w-full h-full p-2 rounded border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none bg-slate-50 text-slate-700 overflow-hidden"
             placeholder="Enter text..."
           />
        </div>
      </div>
    </BaseNode>
  );
};