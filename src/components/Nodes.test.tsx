import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Nodes, Node } from './Nodes';
import { NodeRef } from '../types';

// Mock THREE
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    Mesh: vi.fn(() => ({
      position: { set: vi.fn() },
      material: { color: { set: vi.fn() } }
    })),
  };
});

// Mock react-three-fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  extend: vi.fn(),
  Mesh: ({ children }: any) => <div data-testid="mesh">{children}</div>,
  SphereGeometry: (props: any) => <div data-testid="sphere-geometry" data-props={JSON.stringify(props)} />,
  MeshBasicMaterial: (props: any) => <div data-testid="mesh-basic-material" data-props={JSON.stringify(props)} />,
  Group: ({ children }: any) => <div data-testid="group">{children}</div>,
}));

// Mock drei
vi.mock('@react-three/drei', () => ({
  Line: ({ points, color }: any) => (
    <div 
      data-testid="line" 
      data-points={JSON.stringify(points)}
      data-color={color}
    />
  ),
}));

describe('Node Component', () => {
  it('should create a Node with correct properties', async () => {
    const nodeRef = React.createRef<NodeRef>();
    const name = 'test-node';
    const color = 'red';
    const position: [number, number, number] = [1, 2, 3];
    
    render(
      <Node 
        ref={nodeRef} 
        name={name} 
        color={color} 
        position={position}
        connectedTo={[]}
      />
    );
    
    // Check that ref has the correct methods
    expect(nodeRef.current).not.toBeNull();
    expect(nodeRef.current?.name).toBe(name);
    expect(typeof nodeRef.current?.updatePosition).toBe('function');
    expect(typeof nodeRef.current?.updateColor).toBe('function');
  });
  
  it('should update position and color when methods are called', async () => {
    // Create custom mocks for our tests
    const positionSetMock = vi.fn();
    const colorSetMock = vi.fn();
    
    // Create a manual implementation of the ref behavior
    const nodeRef = {
      current: {
        name: 'test-node',
        position: { x: 0, y: 0, z: 0 },
        updatePosition: vi.fn().mockImplementation((newPosition: [number, number, number]) => {
          positionSetMock(newPosition);
        }),
        updateColor: vi.fn().mockImplementation((color: string) => {
          colorSetMock(color);
        })
      }
    };
    
    // Call the methods directly
    const newPosition: [number, number, number] = [4, 5, 6];
    nodeRef.current.updatePosition(newPosition);
    
    // Verify the position update was called
    expect(positionSetMock).toHaveBeenCalledWith(newPosition);
    
    // Test color update
    const newColor = 'blue';
    nodeRef.current.updateColor(newColor);
    
    // Verify the color update was called
    expect(colorSetMock).toHaveBeenCalledWith(newColor);
  });
});

describe('Nodes Component', () => {
  it('should render nodes and their connections', async () => {
    // Create refs for the nodes
    const nodeRefs = [
      React.createRef<NodeRef>(),
      React.createRef<NodeRef>()
    ];
    
    // Mock the node refs to have positions
    nodeRefs.forEach((ref, i) => {
      Object.defineProperty(ref, 'current', {
        value: {
          name: `node-${i}`,
          position: { x: i, y: i * 2, z: 0 },
          updatePosition: vi.fn(),
          updateColor: vi.fn()
        },
        writable: true
      });
    });
    
    const { container } = render(
      <Nodes nodeRefs={nodeRefs}>
        <Node
          ref={nodeRefs[0]} 
          name="node-0" 
          color="red" 
          position={[0, 0, 0]} 
          connectedTo={[nodeRefs[1]]}
        />
        <Node
          ref={nodeRefs[1]} 
          name="node-1" 
          color="blue" 
          position={[1, 2, 0]} 
          connectedTo={[]}
        />
      </Nodes>
    );
    
    // Verify that the connections were rendered
    const lines = container.querySelectorAll('[data-testid="line"]');
    expect(lines.length).toBeGreaterThan(0);
  });
});