import * as THREE from 'three';
import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { NodeRef } from '../types';
import '../components/three-extend';

interface NodeProps {
  color?: string;
  name: string;
  position: [number, number, number];
  connectedTo?: string[];
}

interface NodesProps {
  children?: React.ReactNode;
  nodeRefs?: React.RefObject<any>[];
}

interface NodesContentProps {
  children?: React.ReactNode;
}

// Node Component
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
      return meshRef.current ? meshRef.current.position : new THREE.Vector3();
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

// Inner component without Canvas
export const NodesContent: React.FC<NodesContentProps> = ({ children }) => {
  return (
    <group data-testid="network-vis-canvas">
      <color attach="background" args={['#1a1a2e']} />
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      {children}
    </group>
  );
};

// Wrapper component for actual use
export const Nodes: React.FC<NodesProps> = ({ children, nodeRefs }) => {
  return (
    <NodesContent>
      {children}
    </NodesContent>
  );
};