import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Nodes, Node } from './components/Nodes';
import { NodeData, NodeRef } from './types';

// Helper function to generate a visually pleasant color
const generateColor = (index: number): string => {
  // Generate colors with good contrast
  const hue = (index * 137.5) % 360; // Golden angle approximation for good distribution
  return `hsl(${hue}, 70%, 60%)`;
};

function App() {
  const [nodesData, setNodesData] = useState<NodeData[]>([]);
  const nodeRefsRef = useRef<React.RefObject<NodeRef>[]>([]);
  
  // Initialize node data once
  useEffect(() => {
    const initialData: NodeData[] = [];
    const numNodes = 5;
    
    for (let i = 0; i < numNodes; i++) {
      initialData.push({
        name: String.fromCharCode(97 + i), // a, b, c, d, e
        color: generateColor(i),
        position: [Math.random() * 6 - 3, Math.random() * 6 - 3, 0],
        connectedTo: [], // Will be populated below
      });
    }
    
    // Set connections based on specific logic
    initialData.forEach((node, index) => {
      if (index > 0) {
        node.connectedTo.push(index - 1); // Connect to previous node
      }
      if (index < initialData.length - 1) {
        node.connectedTo.push(index + 1); // Connect to next node
      }
    });
    
    setNodesData(initialData);
    
    // Initialize refs
    nodeRefsRef.current = Array(numNodes)
      .fill(null)
      .map(() => React.createRef<NodeRef>());
  }, []);
  
  // Simulate data updates
  useEffect(() => {
    if (nodesData.length === 0) return;
    
    const updateInterval = setInterval(() => {
      setNodesData(prevData => {
        // Create a copy of the data to modify
        const newData = [...prevData];
        
        // Update each node with new properties
        newData.forEach((node, index) => {
          // Only update position - in a real app you might have more specific updates
          const newPosition: [number, number, number] = [
            Math.random() * 6 - 3, 
            Math.random() * 6 - 3, 
            0
          ];
          
          // Update the data
          node.position = newPosition;
          node.color = generateColor((index + Date.now()) % 20);
          
          // Also directly update the Three.js object via the ref
          // This is the key performance optimization
          if (nodeRefsRef.current[index]?.current) {
            nodeRefsRef.current[index].current!.updatePosition(newPosition);
            nodeRefsRef.current[index].current!.updateColor(node.color);
          }
        });
        
        return newData;
      });
    }, 2000);
    
    return () => clearInterval(updateInterval);
  }, [nodesData.length]);
  
  if (nodesData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas orthographic camera={{ zoom: 80, position: [0, 0, 100] }}>
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.8} />
        <OrbitControls />
        <Nodes nodeRefs={nodeRefsRef.current}>
          {nodesData.map((node, index) => (
            <Node
              key={node.name}
              ref={nodeRefsRef.current[index]}
              name={node.name}
              color={node.color}
              position={node.position}
              connectedTo={node.connectedTo.map(targetIndex => nodeRefsRef.current[targetIndex])}
            />
          ))}
        </Nodes>
      </Canvas>
    </div>
  );
}

export default App;