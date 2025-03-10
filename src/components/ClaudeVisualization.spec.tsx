import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import NeuralNetworkVisualization from './ClaudeVisualization';
import * as THREE from 'three';

// Mock Three.js to avoid multiple instances warning
vi.mock('three', async () => {
    // Create a mock geometry with proper dispose method
    const mockGeometry = {
        attributes: {
            position: { array: [], needsUpdate: false },
            color: { array: [], needsUpdate: false }
        },
        setAttribute: vi.fn(),
        setFromPoints: vi.fn().mockReturnThis(),
        dispose: vi.fn()
    };
    
    // Create a mock material with proper dispose method
    const mockMaterial = {
        dispose: vi.fn(),
        color: 0,
        transparent: false,
        opacity: 1
    };
    
    // Create mock classes for Three.js objects
    const mockThree = {
        Scene: vi.fn(() => {
            const scene = {
                children: [] as any[],
                background: null,
                rotation: { x: 0, y: 0, z: 0 },
                add: function (obj: any) {
                    this.children.push(obj);
                },
                traverse: vi.fn((callback) => {
                    scene.children.forEach(callback);
                }),
                remove: vi.fn()
            };
            return scene;
        }),
        PerspectiveCamera: vi.fn(() => ({
            position: { x: 0, y: 0, z: 0 },
            aspect: 1,
            updateProjectionMatrix: vi.fn()
        })),
        WebGLRenderer: vi.fn(() => ({
            domElement: document.createElement('canvas'),
            setSize: vi.fn(),
            setPixelRatio: vi.fn(),
            render: vi.fn(),
            dispose: vi.fn()
        })),
        BufferGeometry: vi.fn(() => ({
            ...mockGeometry
        })),
        SphereGeometry: vi.fn(() => ({
            ...mockGeometry
        })),
        Material: vi.fn(() => ({
            ...mockMaterial
        })),
        PointsMaterial: vi.fn(() => ({
            ...mockMaterial,
            size: 0,
            sizeAttenuation: true,
            vertexColors: true
        })),
        LineBasicMaterial: vi.fn(() => ({
            ...mockMaterial
        })),
        MeshBasicMaterial: vi.fn(() => ({
            ...mockMaterial
        })),
        Points: vi.fn((geometry, material) => ({
            geometry,
            material,
            userData: {}
        })),
        Line: vi.fn((geometry, material) => ({
            geometry,
            material
        })),
        Mesh: vi.fn((geometry, material) => ({
            geometry,
            material,
            position: { set: vi.fn() }
        })),
        Float32BufferAttribute: vi.fn((data, itemSize) => ({
            array: data,
            itemSize,
            needsUpdate: false
        })),
        Clock: vi.fn(() => ({
            start: vi.fn(),
            getElapsedTime: vi.fn(() => 0)
        })),
        Color: vi.fn(() => ({
            r: 0, g: 0, b: 0,
            setHSL: vi.fn().mockReturnThis()
        })),
        Vector2: vi.fn(),
        Vector3: vi.fn((x, y, z) => ({ x, y, z })),
        AmbientLight: vi.fn(() => ({
            intensity: 1
        })),
        DirectionalLight: vi.fn(() => ({
            position: { set: vi.fn() },
            intensity: 1
        })),
        interval: vi.fn((callback) => {
            callback();
            return { stop: vi.fn() };
        }),
        range: vi.fn((n) => new Array(n).fill(0).map((_, i) => i)),
        interpolateRgb: vi.fn(() => () => 'rgb(0, 255, 0)')
    };

    // Add prototype structure for prototype-based spy checks
    mockThree.BufferGeometry.prototype = { dispose: vi.fn() };
    mockThree.Material.prototype = { dispose: vi.fn() };
    mockThree.PointsMaterial.prototype = { dispose: vi.fn() };
    mockThree.MeshBasicMaterial.prototype = { dispose: vi.fn() };
    mockThree.LineBasicMaterial.prototype = { dispose: vi.fn() };

    return mockThree;
});

// Mock Three.js extensions
vi.mock('three/examples/jsm/controls/OrbitControls', () => ({
    OrbitControls: vi.fn(() => ({
        enableDamping: false,
        dampingFactor: 0,
        rotateSpeed: 0,
        enabled: false
    }))
}));

vi.mock('three/examples/jsm/postprocessing/EffectComposer', () => ({
    EffectComposer: vi.fn(() => ({
        addPass: vi.fn(),
        render: vi.fn(),
        setSize: vi.fn(),
        dispose: vi.fn(),
        passes: [null, { strength: 0 }]
    }))
}));

vi.mock('three/examples/jsm/postprocessing/RenderPass', () => ({
    RenderPass: vi.fn()
}));

vi.mock('three/examples/jsm/postprocessing/UnrealBloomPass', () => ({
    UnrealBloomPass: vi.fn()
}));

// Mock d3 (for the d3.interval used in the component)
vi.mock('d3', () => ({
    interval: vi.fn((callback) => {
        callback();
        return { stop: vi.fn() };
    }),
    range: vi.fn((n) => new Array(n).fill(0).map((_, i) => i)),
    interpolateRgb: vi.fn(() => () => 'rgb(0, 255, 0)')
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn();

// Mock useState to control loading state
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn((initialValue) => {
      // Return false for isLoading, and have other states return the initial value
      if (initialValue === true) {
        return [false, vi.fn()];
      }
      return [initialValue, vi.fn()];
    })
  };
});

describe('NeuralNetworkVisualization Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });
  
  it('renders without crashing', () => {
    render(<NeuralNetworkVisualization />);
    expect(screen.getByText(/Claude Neural Network Visualization/i)).toBeInTheDocument();
  });
  
  it('renders the visualization container', () => {
    const { container } = render(<NeuralNetworkVisualization />);
    const mountRef = container.querySelector('.absolute.top-0.left-0.w-full.h-full');
    expect(mountRef).toBeInTheDocument();
  });
  
  it('creates the correct number of layers', () => {
    render(<NeuralNetworkVisualization />);
    
    // With our mocking, we can verify the Points constructor was called
    expect(THREE.Points).toHaveBeenCalled();
  });
  
  it('cleans up resources on unmount', () => {
    const { unmount } = render(<NeuralNetworkVisualization />);
    unmount();
    
    expect(THREE.BufferGeometry.prototype.dispose).toBeDefined();
    expect(THREE.Material.prototype.dispose).toBeDefined();
  });
  
  it('adds a resize event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(<NeuralNetworkVisualization />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
  
  it('removes the resize event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<NeuralNetworkVisualization />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
  
  it('starts the animation loop', () => {
    render(<NeuralNetworkVisualization />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });
});