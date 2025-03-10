// src/components/MonitorComponents.tsx
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface MonitorProps {
    value: number; // The current value of the metric
    label: string;  // Label for the monitor ("Processing Load", etc.)
    color?: string; // Optional: Color of the display
    width?: number;
    height?: number;
}

// --- Processing Load Bar ---
export function ProcessingLoadBar({ value, label, color = "white", width=2, height=0.2 }: MonitorProps & {width?:number, height?:number}) {
    const barWidth = value * width; // Scale the bar based on the value
    const barColor = new THREE.Color(color); //create color


    return (
        <group>
            {/* Background (full width) */}
            <mesh>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color="black" />
            </mesh>
            {/* Bar (dynamic width) */}
            <mesh position={[-width/2 + barWidth / 2, 0, 0.01]}>
                <planeGeometry args={[barWidth, height]} />
                <meshBasicMaterial color={barColor} />
            </mesh>
            {/* Label */}
            <Text position={[0, height/2 + 0.1, 0.01]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom">
                {label}: {value.toFixed(2)}
            </Text>
        </group>
    );
}

// --- Synaptic Connections ---
export function SynapticConnections({ value, label, color = "cyan" }: MonitorProps) {
  const numConnections = Math.max(0, Math.floor(value * 20)); // 0 to 20 connections
  const points = React.useRef<THREE.BufferGeometry>(new THREE.BufferGeometry()).current;
  const line = React.useRef<THREE.LineSegments>(null);
  const basePositions = React.useMemo(() => {
    const pos = [];
    for (let i = 0; i < 20; i++) {
      pos.push((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0);
    }
    return new Float32Array(pos);
  }, []);

  useFrame(() => {
    const positions = [];
    for (let i = 0; i < numConnections; i++) {
        const idx1 = Math.floor(Math.random() * 20);
        const idx2 = Math.floor(Math.random() * 20);
        positions.push(basePositions[idx1 * 3], basePositions[idx1 * 3 + 1], basePositions[idx1 * 3 + 2]);
        positions.push(basePositions[idx2 * 3], basePositions[idx2 * 3 + 1], basePositions[idx2 * 3 + 2]);
    }
    points.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    points.attributes.position.needsUpdate = true;
    if(line.current) line.current.computeLineDistances();
  });

  return (
    <group>
        <lineSegments ref={line} geometry={points} >
          <lineDashedMaterial color={color} dashSize={0.05} gapSize={0.025} />
        </lineSegments>
        <Text position={[0, 1.1, 0.01]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom">
          {label}
        </Text>
    </group>
  );
}

// --- Data Flow ---
export function DataFlow({ value, label, color = "green" }: MonitorProps) {
    const numParticles = Math.max(0,Math.floor(value * 500));  // 0 to 500 particles
    const geometry = React.useRef<THREE.BufferGeometry>(new THREE.BufferGeometry()).current;
    const particles = React.useRef<THREE.Points>(null);

    const positions = React.useMemo(() => {
      const pos = new Float32Array(numParticles * 3);
      for (let i = 0; i < numParticles * 3; i+=3) {
          pos[i] = (Math.random() - 0.5) * 2;
          pos[i+1] = (Math.random() - 0.5) * 2;
          pos[i+2] = 0;
      }
      return pos;
    }, [numParticles]);

    useFrame(() => {
      if (particles.current) {
        for (let i = 0; i < numParticles * 3; i += 3) {
          positions[i+1] -= 0.01 * value; // Move particles downward
          if (positions[i+1] < -1) {
            positions[i+1] = 1; // Reset to top if they go off-screen
            positions[i] = (Math.random() - 0.5) * 2; // Randomize x position
          }
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;

      }
    });

    return (
        <group>
            <points ref={particles} geometry={geometry}>
                <pointsMaterial color={color} size={0.02} />
            </points>
            <Text position={[0, 1.1, 0.01]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom">
                {label}
            </Text>
        </group>
    );
}

// --- Anticipation Index (Circular) ---
export function AnticipationIndex({ value, label, color = "yellow" }: MonitorProps) {
    const radius = 0.5;
    const angle = value * Math.PI * 2; // 0 to 2π

    // Calculate the endpoint of the arc
    const x = radius * Math.cos(angle - Math.PI / 2); // Start at the top
    const y = radius * Math.sin(angle - Math.PI / 2);

    const arcShape = React.useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, radius);
      shape.absarc(0, 0, radius, -Math.PI / 2, angle - Math.PI / 2, false); // Corrected arc
      shape.lineTo(0, 0);
      return shape;
    }, [angle, radius]);

    return (
      <group>
        <mesh>
          <shapeGeometry args={[arcShape]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {/* Center Circle (optional) */}
        <mesh>
          <circleGeometry args={[radius*0.7, 32]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <Text position={[0, radius + 0.1, 0.01]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom">
          {label}: {value.toFixed(2)}
        </Text>
      </group>
    );
}
// --- Prompt Completion Probability (Circular) ---
export function PromptCompletionProbability({ value, label, color = 'magenta' }: MonitorProps) {
     const radius = 0.5;
    const angle = value * Math.PI * 2; // 0 to 2π

    // Calculate the endpoint of the arc
    const x = radius * Math.cos(angle - Math.PI / 2); // Start at the top
    const y = radius * Math.sin(angle - Math.PI / 2);

    const arcShape = React.useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(0, radius);
      shape.absarc(0, 0, radius, -Math.PI / 2, angle - Math.PI / 2, false); // Corrected arc
      shape.lineTo(0, 0);
      return shape;
    }, [angle, radius]);

    return (
      <group>
        <mesh>
           <shapeGeometry args={[arcShape]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {/* Center Circle (optional) */}
        <mesh>
          <circleGeometry args={[radius*0.7, 32]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <Text position={[0, radius + 0.1, 0.01]} fontSize={0.15} color="white" anchorX="center" anchorY="bottom">
          {label}: {(value*100).toFixed(0)}%
        </Text>
      </group>
    );
}