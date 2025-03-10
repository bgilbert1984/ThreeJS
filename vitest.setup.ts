import { vi } from 'vitest';
import * as THREE from 'three';
import '@testing-library/jest-dom';

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  // Basic WebGL context methods
  bindBuffer: vi.fn(),
  createBuffer: vi.fn(),
  bufferData: vi.fn(),
  // Add other methods as needed
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  callback(0);
  return 0;
});

// Mock Three.js components that might be difficult to test
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({
      camera: new THREE.PerspectiveCamera(),
      gl: {
        domElement: document.createElement('canvas'),
        setSize: vi.fn(),
      },
      scene: new THREE.Scene(),
    })),
  };
});

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    OrbitControls: () => <div data-testid="orbit-controls" />,
    Line: ({ points, color, lineWidth }: any) => (
      <div data-testid="line" data-points={JSON.stringify(points)} data-color={color} data-line-width={lineWidth} />
    ),
  };
});