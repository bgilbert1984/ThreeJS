import { vi } from 'vitest';
import * as THREE from 'three';
import '@testing-library/jest-dom';

// Mock canvas
global.HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return {
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn(() => true),
      useProgram: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      getExtension: vi.fn(() => null),
      getParameter: vi.fn(() => 0),
      viewport: vi.fn(),
      clear: vi.fn()
    };
  }
  return null;
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(performance.now()), 0);
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
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