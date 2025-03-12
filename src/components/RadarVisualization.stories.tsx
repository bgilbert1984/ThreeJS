import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from '@react-three/fiber';
import { OptimizedOrbitControls } from './OptimizedOrbitControls';

import { RadarVisualization } from './RadarVisualization';

const meta: Meta<typeof RadarVisualization> = {
  title: 'Components/Industry/Radar',
  component: RadarVisualization,
  parameters: {
    // Optional parameter to center the component in the Canvas
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '500px' }}>
        <Canvas camera={{ position: [0, 5, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <Story />
          <OptimizedOrbitControls 
            enableDamping={true}
            dampingFactor={0.1}
            rotateSpeed={0.7}
          />
        </Canvas>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadarVisualization>;

// Standard radar visualization
export const StandardRadar: Story = {
  args: {
    range: 5,
    scanSpeed: 0.5,
  },
};

// High range radar with faster scan
export const LongRangeRadar: Story = {
  args: {
    range: 10,
    scanSpeed: 1.0,
    resolution: 128,
  },
};

// Detailed scan with custom points
export const DetailedScan: Story = {
  args: {
    range: 4,
    resolution: 256,
    scanSpeed: 0.3,
    points: Array(100).fill(0).map(() => ({
      x: (Math.random() * 2 - 1) * 3,
      y: (Math.random() * 0.5 - 0.25),
      z: (Math.random() * 2 - 1) * 3,
      intensity: Math.random() * 0.7 + 0.3
    })),
  },
};

// Simulating an aerial radar scan
export const AerialScan: Story = {
  args: {
    range: 7,
    scanSpeed: 0.8,
    points: (() => {
      const points = [];
      
      // Add a "ground" plane of low-intensity points
      for (let i = 0; i < 100; i++) {
        const x = (Math.random() * 2 - 1) * 6;
        const z = (Math.random() * 2 - 1) * 6;
        points.push({
          x,
          y: -0.5,
          z,
          intensity: 0.3 + Math.random() * 0.2
        });
      }
      
      // Add a few high-intensity "aircraft" targets
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 2 + Math.random() * 3;
        points.push({
          x: Math.cos(angle) * distance,
          y: 0.5 + Math.random() * 1.5, 
          z: Math.sin(angle) * distance,
          intensity: 0.8 + Math.random() * 0.2
        });
      }
      
      return points;
    })(),
  },
};