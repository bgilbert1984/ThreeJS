import React, { Suspense, lazy } from 'react';
import { useFrame } from '@react-three/fiber';

// Dynamic component loading
interface ComponentSceneProps {
  name: string;
}

export const ComponentScene: React.FC<ComponentSceneProps> = ({ name }) => {
  // This is where we would dynamically load the component
  // For demo purposes, we'll render different demonstrations based on the name

  switch (name) {
    case 'Nodes':
      return <NodesDemo />;
    case 'QuestDBConnector':
      return <QuestDBDemo />;
    case 'ParticleSystem':
      return <ParticlesDemo />;
    case 'EnvironmentScene':
      return <EnvironmentDemo />;
    case 'TextGeometry':
      return <TextDemo />;
    default:
      return <DefaultDemo name={name} />;
  }
};

// Demo components for each type
const NodesDemo: React.FC = () => {
  return (
    <group>
      <RotatingNodes />
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

const QuestDBDemo: React.FC = () => {
  return (
    <group>
      <DataVizCube />
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

const ParticlesDemo: React.FC = () => {
  return (
    <group>
      <ParticleField />
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

const EnvironmentDemo: React.FC = () => {
  return (
    <group>
      <FloatingIsland />
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

const TextDemo: React.FC = () => {
  return (
    <group>
      <Floating3DText />
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

const DefaultDemo: React.FC<{ name: string }> = ({ name }) => {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#f3f3f3" />
      </mesh>
      <spotLight position={[0, 5, 0]} intensity={1.5} castShadow />
    </group>
  );
};

// Helper component implementations
const RotatingNodes: React.FC = () => {
  const groupRef = React.useRef<THREE.Group>(null);
  const nodesCount = 15;
  const nodes: JSX.Element[] = [];
  
  // Create example nodes
  for (let i = 0; i < nodesCount; i++) {
    const angle = (i / nodesCount) * Math.PI * 2;
    const radius = 1.5 + Math.random() * 0.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(i * 0.5) * 0.5;
    const z = Math.sin(angle) * radius;
    
    // Random color based on position
    const hue = (i / nodesCount) * 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    
    nodes.push(
      <mesh key={i} position={[x, y, z]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
    
    // Add connecting lines between nodes
    if (i > 0) {
      const prevAngle = ((i - 1) / nodesCount) * Math.PI * 2;
      const prevRadius = 1.5 + Math.random() * 0.5;
      const prevX = Math.cos(prevAngle) * prevRadius;
      const prevY = Math.sin((i - 1) * 0.5) * 0.5;
      const prevZ = Math.sin(prevAngle) * prevRadius;
      
      nodes.push(
        <line key={`line-${i}`}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([x, y, z, prevX, prevY, prevZ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#ffffff" opacity={0.5} transparent />
        </line>
      );
    }
  }
  
  // Rotate the entire node group
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });
  
  return <group ref={groupRef}>{nodes}</group>;
};

const DataVizCube: React.FC = () => {
  const cubeRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      cubeRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });
  
  return (
    <group ref={cubeRef}>
      {/* Data cube visualization */}
      <mesh castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#00aaff" opacity={0.7} transparent wireframe />
      </mesh>
      
      {/* Data points inside */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8
        ]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffaa00" />
        </mesh>
      ))}
    </group>
  );
};

const ParticleField: React.FC = () => {
  const particlesRef = React.useRef<THREE.Group>(null);
  const particlesCount = 200;
  const particles: JSX.Element[] = [];
  
  // Create particles
  for (let i = 0; i < particlesCount; i++) {
    const x = (Math.random() - 0.5) * 5;
    const y = (Math.random() - 0.5) * 5;
    const z = (Math.random() - 0.5) * 5;
    const size = 0.05 + Math.random() * 0.05;
    
    // Color based on position
    const distance = Math.sqrt(x*x + y*y + z*z);
    const hue = (distance / 7) * 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    
    particles.push(
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    );
  }
  
  // Animate particles
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      
      // Pulse effect
      const pulse = Math.sin(state.clock.getElapsedTime()) * 0.1 + 1;
      particlesRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  return <group ref={particlesRef}>{particles}</group>;
};

const FloatingIsland: React.FC = () => {
  const islandRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (islandRef.current) {
      // Gentle floating motion
      islandRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      islandRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });
  
  return (
    <group ref={islandRef}>
      {/* Island base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2.5, 1, 32]} />
        <meshStandardMaterial color="#5a3921" roughness={0.8} />
      </mesh>
      
      {/* Grass top */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#3a7e4f" roughness={0.7} />
      </mesh>
      
      {/* Trees */}
      <group position={[0.8, 0.6, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#5a3921" />
        </mesh>
        <mesh castShadow position={[0, 0.6, 0]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshStandardMaterial color="#2d573a" />
        </mesh>
      </group>
      
      <group position={[-0.7, 0.6, -0.6]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#5a3921" />
        </mesh>
        <mesh castShadow position={[0, 0.5, 0]}>
          <coneGeometry args={[0.25, 0.7, 8]} />
          <meshStandardMaterial color="#2d573a" />
        </mesh>
      </group>
    </group>
  );
};

const Floating3DText: React.FC = () => {
  const textRef = React.useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
      textRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.2 + 0.2;
    }
  });
  
  // Since Text geometry requires importing from drei or other libraries
  // we'll simulate 3D text with boxes for this example
  return (
    <group ref={textRef}>
      {/* T */}
      <mesh position={[-1.8, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#ff3366" />
      </mesh>
      <mesh position={[-1.6, -0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#ff3366" />
      </mesh>
      
      {/* H */}
      <mesh position={[-0.7, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#ffcc33" />
      </mesh>
      <mesh position={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#ffcc33" />
      </mesh>
      <mesh position={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffcc33" />
      </mesh>
      
      {/* R */}
      <mesh position={[0.7, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#33cc66" />
      </mesh>
      <mesh position={[1.1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#33cc66" />
      </mesh>
      <mesh position={[1.1, -0.1, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#33cc66" />
      </mesh>
      <mesh position={[1.3, 0.1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#33cc66" />
      </mesh>
      <mesh position={[1.2, -0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.2]} />
        <meshStandardMaterial color="#33cc66" />
      </mesh>
    </group>
  );
};