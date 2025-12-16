import React from 'react';
import { Handle, Position } from 'reactflow';
import { HandleConfig } from '../../types';

interface BaseNodeProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  handles?: HandleConfig[];
  selected?: boolean;
  className?: string;
}

/**
 * BaseNode
 * 
 * Abstraction for all nodes. Handles:
 * - Common styling (border, shadow, selection state)
 * - Automatic handle layout (distributes multiple handles evenly)
 * - Dynamic width/sizing support
 */
export const BaseNode: React.FC<BaseNodeProps> = ({ 
  id, 
  title, 
  icon, 
  children, 
  handles = [], 
  selected,
  className
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg border-2 shadow-lg transition-all duration-200 flex flex-col
        ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}
        ${className ?? 'w-64'}
      `}
    >
      {/* Dynamic Handles with Auto-Distribution */}
      {handles.map((handle) => {
        // Determine position (default to left for target, right for source if not specified)
        const side = handle.position || (handle.type === 'target' ? 'left' : 'right');
        
        // Find all handles on this side to calculate spacing
        const handlesOnSide = handles.filter(h => 
          (h.position || (h.type === 'target' ? 'left' : 'right')) === side
        );
        
        const index = handlesOnSide.findIndex(h => h.id === handle.id);
        const count = handlesOnSide.length;
        
        // Calculate offset to distribute handles evenly
        // If there is only 1, React Flow centers it automatically. 
        // If > 1, we space them out.
        const offsetStyle: React.CSSProperties = {};
        if (count > 1) {
           const step = 100 / (count + 1);
           const val = step * (index + 1);
           if (side === 'left' || side === 'right') {
             offsetStyle.top = `${val}%`;
           } else {
             offsetStyle.left = `${val}%`;
           }
        }

        const reactFlowPosition = 
          side === 'left' ? Position.Left : 
          side === 'right' ? Position.Right :
          side === 'top' ? Position.Top : 
          Position.Bottom;

        return (
          <Handle
            key={handle.id}
            type={handle.type}
            position={reactFlowPosition}
            id={handle.id}
            className={`!w-3 !h-3 !bg-primary border-2 border-white transition-colors hover:!bg-secondary
              ${side === 'left' ? '-ml-1.5' : 
                side === 'right' ? '-mr-1.5' : 
                side === 'top' ? '-mt-1.5' : '-mb-1.5'}
            `}
            style={offsetStyle}
          />
        );
      })}

      {/* Node Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-lg shrink-0">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="font-semibold text-slate-700 text-sm">{title}</span>
      </div>

      {/* Node Content */}
      <div className="p-4 grow">
        {children}
      </div>
    </div>
  );
};