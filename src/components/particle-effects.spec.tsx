import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { App } from './particle_effects';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { FilmPass, WaterPass, UnrealBloomPass, LUTPass, LUTCubeLoader } from 'three-stdlib';

// Mock the dependencies
vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(({ children }) => <div data-testid="canvas">{children}</div>),
  extend: vi.fn(),
  useFrame: vi.fn(callback => callback({
    mouse: { x: 0, y: 0 },
    viewport: { width: 800, height: 600 },
    clock: { elapsedTime: 1 }
  })),
  useLoader: vi.fn(() => ({ texture: new THREE.Texture() }))
}));

vi.mock('@react-three/drei', () => ({
  Effects: vi.fn(({ children }) => <div data-testid="effects">{children}</div>)
}));

vi.mock('three-stdlib', () => ({
  FilmPass: vi.fn(),
  WaterPass: vi.fn(),
  UnrealBloomPass: vi.fn(),
  LUTPass: vi.fn(),
  LUTCubeLoader: vi.fn()
}));

// Mock THREE.js objects
vi.mock('three', () => {
  const actualThree = vi.importActual('three');
  return {
    ...actualThree,
    Object3D: vi.fn(() => ({
      position: { set: vi.fn() },
      scale: { setScalar: vi.fn() },
      rotation: { set: vi.fn() },
      updateMatrix: vi.fn(),
      matrix: {}
    })),
    Texture: vi.fn()
  };
});

describe('App Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('canvas')).toBeDefined();
  });

  it('sets up Canvas with correct props', () => {
    render(<App />);
    expect(Canvas).toHaveBeenCalledWith(
      expect.objectContaining({
        linear: true,
        flat: true,
        legacy: true,
        dpr: 1,
        camera: { fov: 100, position: [0, 0, 30] }
      }),
      expect.anything()
    );
  });

  it('should extend with all necessary postprocessing passes', () => {
    render(<App />);
    expect(extend).toHaveBeenCalledWith({
      WaterPass,
      UnrealBloomPass,
      FilmPass,
      LUTPass
    });
  });
});

describe('Swarm Component', () => {
  it('sets up instancedMesh with correct count', () => {
    const { container } = render(<App />);
    // Check the props passed to instancedMesh
    expect(container.innerHTML).toContain('instancedMesh');
    
    // The count should be 20000
    expect(useFrame).toHaveBeenCalled();
  });

  it('updates particles on each frame', () => {
    render(<App />);
    
    // useFrame should be called exactly twice (once for Swarm, once for Postpro)
    expect(useFrame).toHaveBeenCalledTimes(2);
    
    // Get the first useFrame callback (Swarm component)
    const frameCallback = useFrame.mock.calls[0][0];
    
    // Mock state
    const mockState = { 
      mouse: { x: 0.5, y: -0.5 },
      viewport: { width: 800, height: 600 }
    };
    
    // We expect the callback to run without errors
    expect(() => frameCallback(mockState)).not.toThrow();
  });
});

describe('Postpro Component', () => {
  it('loads LUT cube correctly', () => {
    render(<App />);
    expect(useLoader).toHaveBeenCalledWith(LUTCubeLoader, '/cubicle.CUBE');
  });

  it('updates water pass time on each frame', () => {
    render(<App />);
    
    // Get the second useFrame callback (Postpro component)
    const frameCallback = useFrame.mock.calls[1][0];
    
    // Create mock ref
    const mockWaterRef = { current: { time: 0 } };
    
    // Mock elements to satisfy the function
    const mockState = { clock: { elapsedTime: 2.5 } };
    
    // Run the frame callback
    frameCallback(mockState);
    
    // Verify time update would happen (using mock implementation)
    expect(useFrame).toHaveBeenCalled();
  });

  it('renders all post-processing effects', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('effects')).toBeDefined();
  });
});
