// src/components/BasicThreeScene.tsx
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import WebGLContextHandler from './WebGLContextHandler';

// Simple rotating box component
const RotatingBox: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
};

// Scene setup component
const SceneSetup: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingBox />
      <OrbitControls />
    </>
  );
};

// Main component with Canvas and error handling
const BasicThreeScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <WebGLContextHandler>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: true,
          }}
          camera={{ position: [0, 0, 5], fov: 75 }}
        >
          <SceneSetup />
        </Canvas>
      </WebGLContextHandler>
    </div>
  );
};

export default BasicThreeScene;
