import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { TerrainRadarMapping } from './TerrainRadarMapping';

const meta: Meta<typeof TerrainRadarMapping> = {
  title: 'Components/Industry/TerrainMapping',
  component: TerrainRadarMapping,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '500px' }}>
        <Canvas camera={{ position: [5, 7, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <Story />
          <OrbitControls />
        </Canvas>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TerrainRadarMapping>;

// Mountain terrain radar mapping
export const MountainTerrain: Story = {
  args: {
    terrainType: 'mountains',
    resolution: 64,
    scanSpeed: 0.5,
    heightScale: 2.0,
    showWireframe: true,
  },
};

// Canyon terrain radar mapping
export const CanyonTerrain: Story = {
  args: {
    terrainType: 'canyon',
    resolution: 64,
    scanSpeed: 0.3,
    heightScale: 2.5,
    showWireframe: false,
  },
};

// Coastal terrain radar mapping
export const CoastalTerrain: Story = {
  args: {
    terrainType: 'coastal',
    resolution: 64,
    scanSpeed: 0.6,
    heightScale: 1.2,
    showWireframe: true,
  },
};

// Urban terrain radar mapping
export const UrbanTerrain: Story = {
  args: {
    terrainType: 'urban',
    resolution: 80,
    scanSpeed: 0.8,
    heightScale: 1.0,
    showWireframe: false,
  },
};

// High resolution detailed scan
export const HighResolutionScan: Story = {
  args: {
    terrainType: 'mountains',
    resolution: 128,
    scanSpeed: 0.4,
    heightScale: 1.8,
    showWireframe: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A high resolution terrain scan with detailed mountain features',
      },
    },
  },
};