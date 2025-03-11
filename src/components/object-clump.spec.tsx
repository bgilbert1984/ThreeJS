import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { App } from './object-clump';

// Mock Three.js modules
vi.mock('three', () => ({
  Vector3: vi.fn(() => ({
    set: vi.fn(),
    copy: vi.fn(),
    normalize: vi.fn().mockReturnThis(),
    multiplyScalar: vi.fn().mockReturnThis(),
    toArray: vi.fn(() => [0, 0, 0])
  })),
  Group: vi.fn(),
  Color: vi.fn(),
  Clock: vi.fn(() => ({
    getElapsedTime: vi.fn(() => 0)
  }))
}));

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn((cb) => cb({ clock: { getElapsedTime: () => 0 } }, 0.016)),
  useThree: vi.fn(() => ({
    viewport: { width: 800, height: 600 },
    camera: { position: { set: vi.fn() } }
  }))
}));

// Mock @react-three/cannon
vi.mock('@react-three/cannon', () => ({
  Physics: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="physics">{children}</div>
  ),
  useSphere: vi.fn(() => {
    const ref = { current: {} };
    const api = {
      position: { set: vi.fn() },
      velocity: { set: vi.fn() },
      applyForce: vi.fn()
    };
    return [ref, api];
  })
}));

describe('ObjectClump', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('sets up physics environment', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('physics')).toBeInTheDocument();
  });

  it('initializes spheres with physics', () => {
    render(<App />);
    const { useSphere } = require('@react-three/cannon');
    expect(useSphere).toHaveBeenCalled();
    
    // Get the configuration passed to useSphere
    const sphereConfig = useSphere.mock.calls[0][0]();
    expect(sphereConfig).toEqual(
      expect.objectContaining({
        mass: expect.any(Number),
        args: expect.any(Array),
        position: expect.any(Array)
      })
    );
  });

  it('updates sphere positions in animation frame', () => {
    render(<App />);
    const { useFrame } = require('@react-three/fiber');
    expect(useFrame).toHaveBeenCalled();
  });
});