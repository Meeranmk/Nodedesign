export interface HandleConfig {
  id: string;
  label?: string;
  type: 'source' | 'target';
  position?: 'left' | 'right' | 'top' | 'bottom';
}

export interface NodeData {
  label?: string;
  [key: string]: any;
}

export interface PipelineAnalysisResult {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
}
