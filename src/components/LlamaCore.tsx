// src/components/LlamaCore.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a simple mesh-based component without complex model loading
export const LlamaCoreMesh: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(1);
  
  // Health decreasing over time
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHealth((prevHealth) => Math.max(0, prevHealth - 0.01)); // Decrease health
    }, 100); // Every 100ms
    
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
  
  // Animation and color updates
  useFrame(() => {
    if (groupRef.current) {
      // Rotate the whole model group
      groupRef.current.rotation.y += 0.01;
    }
  });
  
  // Create particles for visual effect
  const particlesRef = useRef<THREE.Points>(null);
  
  useEffect(() => {
    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const numParticles = 1000;
    
    for (let i = 0; i < numParticles; i++) {
      const x = THREE.MathUtils.randFloatSpread(5);
      const y = THREE.MathUtils.randFloatSpread(5);
      const z = THREE.MathUtils.randFloatSpread(5);
      vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.02,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    if (groupRef.current) {
      groupRef.current.add(points);
    }
    particlesRef.current = points;
  }, []);
  
  // Rotate particles
  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Simple placeholder geometry instead of complex model */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={new THREE.Color().lerpColors(
            new THREE.Color(1, 0, 0),
            new THREE.Color(0, 1, 0),
            health
          )}
          metalness={0.5}
          roughness={0.5}
          transparent={true}
          opacity={Math.max(0.3, health)}
        />
      </mesh>
      
      {/* Simple eyes */}
      <mesh position={[0.4, 0.4, 0.7]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[-0.4, 0.4, 0.7]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Add some ambient visualization */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="white" />
    </group>
  );
};

// Simplified version that doesn't rely on external model loading
export const LlamaCore: React.FC = () => {
  return <LlamaCoreMesh />;
};