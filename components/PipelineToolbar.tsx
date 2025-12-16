import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Play, Loader2 } from 'lucide-react';
import { parsePipeline } from '../services/api';

interface PipelineToolbarProps {
  onResult: (result: { num_nodes: number; num_edges: number; is_dag: boolean }) => void;
}

export const PipelineToolbar: React.FC<PipelineToolbarProps> = ({ onResult }) => {
  const { getNodes, getEdges } = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const nodes = getNodes();
    const edges = getEdges();

    try {
      const result = await parsePipeline(nodes, edges);
      // Wait a moment for visual feedback
      setTimeout(() => {
        onResult(result);
        setIsLoading(false);
      }, 300);
    } catch (e) {
      console.error("Pipeline submission error:", e);
      alert(`Error submitting pipeline: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
       <div className="bg-white p-1 rounded-lg shadow-md border border-slate-200 flex items-center gap-2">
         {/* Node Selector (Mock) */}
         <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-r border-slate-100">
           Pipeline Editor
         </div>

         <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          Submit
        </button>
       </div>
    </div>
  );
};