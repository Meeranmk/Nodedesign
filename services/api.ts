import { Node, Edge } from 'reactflow';
import { PipelineAnalysisResult } from '../types';

// In a real scenario, this matches the Python backend endpoint: /pipelines/parse
const API_ENDPOINT = 'http://127.0.0.1:8000/pipelines/parse';

// Helper to check DAG locally for the mock fallback
// Defined BEFORE usage to prevent 'access before initialization' errors
const checkIsDag = (nodes: Node[], edges: Edge[]): boolean => {
  const adj = new Map<string, string[]>();
  
  // Initialize adjacency list
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  // Build graph
  for (const edge of edges) {
    if (adj.has(edge.source)) {
      adj.get(edge.source)?.push(edge.target);
    }
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const isCyclic = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (isCyclic(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check for cycles in all components
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (isCyclic(node.id)) return false; // Cycle detected
    }
  }

  return true; // No cycles found -> DAG
};

export const parsePipeline = async (nodes: Node[], edges: Edge[]): Promise<PipelineAnalysisResult> => {
  try {
    // We construct the FormData or JSON body as expected by the backend.
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to parse pipeline:", error);
    
    // FALLBACK FOR DEMO PURPOSES IF BACKEND IS NOT RUNNING
    console.warn("Using mock response because backend fetch failed.");
    
    // Ensure nodes and edges are valid arrays before processing
    const safeNodes = Array.isArray(nodes) ? nodes : [];
    const safeEdges = Array.isArray(edges) ? edges : [];

    // Run local DAG check
    let isDag = true;
    try {
      isDag = checkIsDag(safeNodes, safeEdges);
    } catch (dagError) {
      console.error("Local DAG check failed:", dagError);
      isDag = false; // Default to false if check fails
    }
    
    // Return a resolved promise with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          num_nodes: safeNodes.length,
          num_edges: safeEdges.length,
          is_dag: isDag,
        });
      }, 500);
    });
  }
};