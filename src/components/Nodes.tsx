import * as THREE from 'three';
import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { NodeRef } from '../types';

interface NodeProps {
  color: string;
  name: string;
  position: [number, number, number];
  connectedTo: React.RefObject<NodeRef>[];
}

// Node Component (Functional, using forwardRef)
export const Node = forwardRef<NodeRef, NodeProps>(({ 
  color = 'white', 
  name, 
  position, 
  connectedTo = [] 
}, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useImperativeHandle(ref, () => ({
    name,
    get position() {
      return meshRef.current!.position;
    },
    updatePosition: (newPosition: [number, number, number]) => {
      if (meshRef.current) {
        meshRef.current.position.set(...newPosition);
      }
    },
    updateColor: (newColor: string) => {
      if (meshRef.current && meshRef.current.material instanceof THREE.MeshBasicMaterial) {
        meshRef.current.material.color.set(newColor);
      }
    }
  }));

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
});

Node.displayName = 'Node';

interface NodesProps {
  children: React.ReactNode;
  nodeRefs: React.RefObject<NodeRef>[];
}

// Nodes Component (Functional)
export const Nodes = ({ children, nodeRefs }: NodesProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate lines based on the node refs directly
  const lines = useMemo(() => {
    const connections: JSX.Element[] = [];
    
    // Go through each node ref and check for connections
    React.Children.forEach(children, (child, childIndex) => {
      if (React.isValidElement(child) && child.props.connectedTo) {
        child.props.connectedTo.forEach((targetRef: React.RefObject<NodeRef>, i: number) => {
          if (targetRef.current && nodeRefs[childIndex].current) {
            connections.push(
              <Line
                key={`${childIndex}-${i}`}
                points={[
                  nodeRefs[childIndex].current!.position, 
                  targetRef.current.position
                ]}
                color="grey"
                lineWidth={2}
              />
            );
          }
        });
      }
    });
    
    return connections;
  }, [children, nodeRefs]);

  return (
    <group ref={groupRef}>
      {children}
      {lines}
    </group>
  );
};