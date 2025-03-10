// src/components/object-clump.spec.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { App } from './object-clump'; // Corrected import
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';  //Corrected import
import { Outlines, Environment, useTexture } from '@react-three/drei';
import { Physics, useSphere } from '@react-three/cannon';
import { EffectComposer, N8AO, SMAA, Bloom } from '@react-three/postprocessing';
import { useControls } from 'leva';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { act } from 'react-dom/test-utils';

// Mock the various dependencies
vi.mock('@react-three/fiber', () => ({
  ...vi.importActual('@react-three/fiber'),
  Canvas: vi.fn(({ children }) => <div data-testid="canvas">{children}</div>),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ viewport: { width: 800, height: 600 } })),
}));

vi.mock('@react-three/drei', () => ({
  Outlines: vi.fn(({ children }) => <div data-testid="outlines">{children}</div>),
  Environment: vi.fn(() => <div data-testid="environment" />),
  useTexture: vi.fn(() => new THREE.Texture()),
}));

vi.mock('@react-three/cannon', () => ({
  Physics: vi.fn(({ children }) => <div data-testid="physics">{children}</div>),
  useSphere: vi.fn(() => {
    const ref = { current: { getMatrixAt: vi.fn() } };
    const api = {
      position: { set: vi.fn() },
      at: vi.fn(() => ({ applyForce: vi.fn() })),
    };
    return [ref, api];
  }),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: vi.fn(({ children }) => <div data-testid="effect-composer">{children}</div>),
  N8AO: vi.fn(() => <div data-testid="n8ao" />),
  SMAA: vi.fn(() => <div data-testid="smaa" />),
  Bloom: vi.fn(() => <div data-testid="bloom" />),
}));

vi.mock('leva', () => ({
  useControls: vi.fn(() => ({ outlines: 0.02 })),
}));

// Mock the THREE.js objects
vi.mock('three', async () => {
    const actualThree = await vi.importActual('three') as typeof import('three');

    return {
    ...actualThree,
    MathUtils: {
        randFloatSpread: vi.fn(() => Math.random() * 2 - 1),
    },
    SphereGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn(),
    Matrix4: vi.fn(() => ({
        setFromMatrixPosition: vi.fn(),
    })),
    Vector3: vi.fn(() => ({
        setFromMatrixPosition: vi.fn(() => ({
        normalize: vi.fn(() => ({
            multiplyScalar: vi.fn(() => ({
            toArray: vi.fn(() => [0, 0, 0]),
            })),
        })),
        })),
    })),
    };
});

describe('App Component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => { // Added async
    let renderer;
    await act(async () => {
        renderer = await ReactThreeTestRenderer.create(<App />);
    })
    expect(renderer).toBeDefined();
  });

  it('renders the Physics component with expected props', async () => { // Added async
    let renderer;
    await act(async () => {
      renderer = await ReactThreeTestRenderer.create(<App />);
    })
    const physics = await renderer.findByType((node) => node.props['data-testid'] === 'physics');
    expect(physics).toBeDefined();
  });

  it('renders the Environment component with correct file path', async () => {// Added async
    let renderer;
    await act(async () => {
        renderer = await ReactThreeTestRenderer.create(<App />);
    });
    const environment = await renderer.findByType((node) => node.props['data-testid'] === "environment")
    expect(environment).toBeDefined();
    expect(Environment).toHaveBeenCalledWith(
      expect.objectContaining({ files: '/adamsbridge.hdr' }),
      expect.anything()
    );
  });

  it('renders EffectComposer with correct props', async() => {// Added async
      let renderer;
      await act(async () => {
        renderer = await ReactThreeTestRenderer.create(<App />);
      });
      const effectComposer = await renderer.findByType((node) => node.props['data-testid'] === "effect-composer")
    expect(effectComposer).toBeDefined();
    expect(EffectComposer).toHaveBeenCalledWith(
      expect.objectContaining({
        disableNormalPass: true,
        multisampling: 0,
      }),
      expect.anything()
    );
  });
});

describe('Clump Component', () => {
  it('initializes with correct useSphere parameters', async () => { // Added async
      let renderer;
      await act(async () => {
        renderer = await ReactThreeTestRenderer.create(<App />);
      })

    // Check if useSphere was called correctly for the Clump component
    expect(useSphere).toHaveBeenCalledWith(expect.any(Function));

    // Verify the function returns expected parameters
    const clumpSphereArgs = useSphere.mock.calls[1][0](); // Get the arguments of the second call
    expect(clumpSphereArgs).toEqual(
      expect.objectContaining({
        args: [1],
        mass: 1,
        angularDamping: 0.1,
        linearDamping: 0.65,
        position: expect.any(Array),
      })
    );
  });

  it('loads texture correctly', async () => { // Added async
    let renderer;
    await act(async() => {
        renderer = await ReactThreeTestRenderer.create(<App />)
    });
    expect(useTexture).toHaveBeenCalledWith('/cross.jpg');
  });
});

describe('Pointer Component', () => {
  it('initializes with correct useSphere parameters', async() => { // Added async
      let renderer;
      await act(async() => {
        renderer = await ReactThreeTestRenderer.create(<App />);
    })

    // Check if useSphere was called correctly for the Pointer component
    expect(useSphere).toHaveBeenCalled();

    // Get the first call which should be for the Pointer component
    const pointerSphereArgs = useSphere.mock.calls[0][0](); // Get arguments of the first call.
    expect(pointerSphereArgs).toEqual(
      expect.objectContaining({
        type: 'Kinematic',
        args: [3],
        position: [0, 0, 0],
      })
    );
  });

  it('updates pointer position based on mouse position', async() => {// Added async
    let renderer;

      await act(async() => {
        renderer = await ReactThreeTestRenderer.create(<App />);
      })

    // Verify useFrame callback is called
    expect(useFrame).toHaveBeenCalled();

    // First call is for the Pointer component
    const frameCallback = useFrame.mock.calls[0][0];
    const mockState = { mouse: { x: 0.5, y: -0.5 } };

    // Call the callback manually, passing the mock state.  No need for api here.
    act(() => {
        frameCallback(mockState);
    });

    // Verify position setting based on viewport. No need to get result, just check call.
    expect(useSphere.mock.results[0].value[1].position.set).toHaveBeenCalled();
  });
});