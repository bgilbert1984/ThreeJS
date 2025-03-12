// src/components/MonitorComponents.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from '@react-three/fiber';
import { OptimizedOrbitControls } from './OptimizedOrbitControls';
import {
    ProcessingLoadBar,
    SynapticConnections,
    DataFlow,
    AnticipationIndex,
    PromptCompletionProbability
} from './MonitorComponents';


const meta: Meta<typeof ProcessingLoadBar> = {
    title: 'Components/Monitors',
    component: ProcessingLoadBar, // We use one of the components, just to set up, but we'll display each
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProcessingLoadBar>;

// Processing Load
export const ProcessingLoad: Story = {
    render: () => (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <ProcessingLoadBar value={0.7} label="Processing Load" color="red" />
            <OptimizedOrbitControls 
                enablePan={false}
                maxDistance={5}
                dampingFactor={0.1}
            />
        </Canvas>
    ),
};

// Synaptic Connections
export const SynapticConnectionsStory: Story = {
    render: () => (
        <Canvas camera={{position: [0,0,5]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <SynapticConnections value={0.5} label="Synaptic Connections" />
            <OptimizedOrbitControls 
                enablePan={false}
                maxDistance={8}
                dampingFactor={0.1}
            />
        </Canvas>
    ),
};

// Data Flow
export const DataFlowStory: Story = {
    render: () => (
      <Canvas camera={{position: [0,0,5]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <DataFlow value={0.8} label="Data Flow" />
            <OptimizedOrbitControls 
                enablePan={false}
                maxDistance={8}
                dampingFactor={0.1}
            />
        </Canvas>
    ),
};

// Anticipation Index
export const AnticipationIndexStory: Story = {
    render: () => (
        <Canvas camera={{position: [0,0,3]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <AnticipationIndex value={0.3} label="Anticipation Index" />
            <OptimizedOrbitControls 
                enablePan={false}
                maxDistance={5}
                dampingFactor={0.1}
            />
        </Canvas>
    ),
};

// Prompt Completion
export const PromptCompletionStory: Story = {
    render: () => (
        <Canvas camera={{position: [0,0,3]}}>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
           <PromptCompletionProbability value={.9} label='Prompt Completion' color="magenta"/>
            <OptimizedOrbitControls 
                enablePan={false}
                maxDistance={5}
                dampingFactor={0.1}
            />
        </Canvas>
    ),
};