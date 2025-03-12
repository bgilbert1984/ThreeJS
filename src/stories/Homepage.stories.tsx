import React, { Suspense } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Homepage from '../Homepage';
import { LlamaCore } from '../components/LlamaCore';
import NeuralNetworkVisualization from '../components/ClaudeVisualization';
import GrokVisualization from '../components/GrokVisualization';
import { ProcessingLoadBar, SynapticConnections, DataFlow, AnticipationIndex } from '../components/MonitorComponents';
import CopilotVisualization from '../components/CopilotVisualization';
import { OptimizedOrbitControls } from '../components/OptimizedOrbitControls';

// Lazy load JavaScript components
const ParticleEffectsApp = React.lazy(() => import('../components/particle_effects').then(m => ({ default: m.App })));
const ObjectClumpApp = React.lazy(() => import('../components/object-clump').then(m => ({ default: m.App })));

// Since we're using lazy loading, wrap the rendered components in Suspense
const LazyApp = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
);

const meta = {
  title: 'Pages/Homepage',
  component: Homepage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default view of the homepage
export const Default: Story = {};

// Focus on LlamaCore visualization section
export const LlamaCoreFocus: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="visualization-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #4a00b4', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas camera={{position: [0,0,10]}}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <LlamaCore />
          <OptimizedOrbitControls enablePan={false} />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};

// View with particle effects demo
export const ParticleEffectsDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="particles-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #6d00cc', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas>
          <LazyApp Component={ParticleEffectsApp} />
          <OptimizedOrbitControls 
            enableDamping={true}
            dampingFactor={0.1}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};

// View with Object Clump physics demo
export const ObjectClumpDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="physics-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #9900cc', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas>
          <LazyApp Component={ObjectClumpApp} />
          <OptimizedOrbitControls 
            enablePan={false} 
            minDistance={5} 
            maxDistance={15}
          />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};

// Neural network visualization demo
export const NeuralNetworkDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="neural-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #cc0099', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas>
          <NeuralNetworkVisualization />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};

// Grok visualization demo
export const GrokVisualizationDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="grok-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #cc0066', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas>
          <GrokVisualization />
          <OptimizedOrbitControls 
            enableDamping={true}
            dampingFactor={0.1}
            rotateSpeed={0.8}
          />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};

// Monitor components demo
export const MonitorComponentsDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="monitors-grid" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', zIndex: 1000, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="monitor-panel" style={{ height: '200px', border: '2px solid #cc0033', borderRadius: '10px', overflow: 'hidden' }}>
          <Canvas camera={{position: [0,0,3]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <ProcessingLoadBar value={0.7} label="Processing" color="red" />
            <OptimizedOrbitControls enablePan={false} maxDistance={5} />
          </Canvas>
        </div>
        <div className="monitor-panel" style={{ height: '200px', border: '2px solid #cc3300', borderRadius: '10px', overflow: 'hidden' }}>
          <Canvas camera={{position: [0,0,5]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <SynapticConnections value={0.5} label="Connections" />
            <OptimizedOrbitControls enablePan={false} maxDistance={8} />
          </Canvas>
        </div>
        <div className="monitor-panel" style={{ height: '200px', border: '2px solid #cc6600', borderRadius: '10px', overflow: 'hidden' }}>
          <Canvas camera={{position: [0,0,5]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <DataFlow value={0.8} label="Data Flow" />
            <OptimizedOrbitControls enablePan={false} maxDistance={8} />
          </Canvas>
        </div>
        <div className="monitor-panel" style={{ height: '200px', border: '2px solid #cc9900', borderRadius: '10px', overflow: 'hidden' }}>
          <Canvas camera={{position: [0,0,3]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <AnticipationIndex value={0.3} label="Anticipation" />
            <OptimizedOrbitControls enablePan={false} maxDistance={5} />
          </Canvas>
        </div>
      </div>
      <Homepage />
    </div>
  ),
};

// Copilot visualization demo
export const CopilotVisualizationDemo: Story = {
  render: () => (
    <div className="storybook-custom-wrapper">
      <div className="copilot-panel" style={{ position: 'fixed', top: '80px', right: '20px', width: '450px', height: '350px', zIndex: 1000, border: '2px solid #cccc00', borderRadius: '10px', overflow: 'hidden' }}>
        <Canvas>
          <CopilotVisualization />
          <OptimizedOrbitControls 
            enableDamping={true}
            dampingFactor={0.1}
            rotateSpeed={0.7}
            minDistance={3}
            maxDistance={12}
          />
        </Canvas>
      </div>
      <Homepage />
    </div>
  ),
};