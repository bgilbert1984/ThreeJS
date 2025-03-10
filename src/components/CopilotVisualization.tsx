import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@react-three/drei';

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
  const voxelCount = 100; // Number of voxels
  const voxels = Array.from({ length: voxelCount }).map((_, index) => ({
    position: [
      Math.random() * 10 - 5, // Random X
      Math.random() * 10 - 5, // Random Y
      Math.random() * 10 - 5, // Random Z
    ],
    color: `hsl(${Math.random() * 360}, 80%, 60%)`, // Random colors
  }));

  return (
    <Canvas>
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
