// If this file doesn't exist, create it
export interface NodeData {
  name: string;
  color: string;
  position: [number, number, number];
  connectedTo: number[]; // Store indices for simplicity
}

export interface NodeRef {
  position: THREE.Vector3;
  updatePosition: (newPosition: [number, number, number]) => void;
  updateColor: (newColor: string) => void;
  name?: string;
}