import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './GrokVisualization';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock THREE.js to prevent actual WebGL operations
vi.mock('three', () => {
  return {
    Group: vi.fn(() => ({
      add: vi.fn(),
      rotation: { y: 0 }
    })),
    AmbientLight: vi.fn(),
    PointLight: vi.fn(() => ({
      position: { x: 0, y: 0, z: 0 }
    })),
    BufferGeometry: vi.fn(() => ({
      setFromPoints: vi.fn().mockReturnThis()
    })),
    LineBasicMaterial: vi.fn(),
    SphereGeometry: vi.fn(),
    MeshPhongMaterial: vi.fn(),
    Line: vi.fn(),
    Mesh: vi.fn(() => ({
      position: { x: 0, y: 0, z: 0, distanceTo: vi.fn(() => 1) },
      scale: { set: vi.fn() }
    })),
    Vector2: vi.fn(),
    Raycaster: vi.fn(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => [])
    })),
    Color: vi.fn(() => ({
      setHSL: vi.fn()
    }))
  };
});

// Mock @react-three/fiber to avoid WebGL context
vi.mock('@react-three/fiber', () => {
  return {
    Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({
      camera: { position: { x: 0, y: 0, z: 10 } }
    })),
    extend: vi.fn()
  };
});

// Mock React hooks to prevent actual DOM operations
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: vi.fn((cb) => {}),
    useRef: vi.fn(() => ({
      current: {
        rotation: { y: 0 },
        position: { x: 0, y: 0, z: 0 },
        add: vi.fn()
      }
    }))
  };
});

describe('<GrokVisualization />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(screen.getByTestId('canvas')).toBeDefined();
  });
});