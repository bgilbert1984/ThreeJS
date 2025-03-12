import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import '../components/three-extend';

interface VoxelProps {
  position: number[];
  color: string;
}

const Voxel: React.FC<VoxelProps> = ({ position, color }) => (
  <Box args={[0.2, 0.2, 0.2]} position={position}>
    <meshStandardMaterial attach="material" color={color} />
  </Box>
);

const VoxelPointCloud = () => {
  const voxels = Array.from({ length: 100 }).map((_, index) => ({
    position: [
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
    ],
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
  }));

  return (
    <Canvas gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
      <ambientLight data-testid="ambientLight" />
      <pointLight data-testid="pointLight" position={[10, 10, 10]} />
      {voxels.map((voxel, index) => (
        <Voxel key={index} position={voxel.position} color={voxel.color} />
      ))}
    </Canvas>
  );
};

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VoxelPointCloud />
    </div>
  );
}
