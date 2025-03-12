// src/components/LightweightScene.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import EnhancedWebGLHandler from './EnhancedWebGLHandler';
import { OptimizedOrbitControls } from './OptimizedOrbitControls';

// Simple cube component with minimal resource usage
const SimpleCube: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Use a less intensive animation approach
  useFrame((state) => {
    if (meshRef.current) {
      // Simple rotation based on elapsed time
      const t = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.x = Math.sin(t) * 0.5;
      meshRef.current.rotation.y = Math.cos(t) * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#5A7D9A" />
    </mesh>
  );
};

// Scene with minimal lighting and objects
const SceneContent: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[1, 2, 3]} intensity={0.5} />
      <SimpleCube />
      <OptimizedOrbitControls 
        enableDamping={false} 
        enableZoom={true} 
        enablePan={false}
      />
    </>
  );
};

// Main component with enhanced WebGL handler
const LightweightScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <EnhancedWebGLHandler>
        <SceneContent />
      </EnhancedWebGLHandler>
    </div>
  );
};

export default LightweightScene;
