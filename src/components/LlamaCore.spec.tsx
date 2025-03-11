// Create Points mock - must be defined before THREE imports/mocks
const createPointsMock = () => {
  return function(geometry: any, material: any) {
    const points = {
      geometry,
      material,
      rotation: { y: 0 },
      type: 'Points',
    };
    return points;
  };
};

// Mock definitions - must be at the top, before imports!
// Define mock class for Color
class ColorMock {
  r: number;
  g: number;
  b: number;
  isColor: boolean;

  constructor(r?: number, g?: number, b?: number) {
    this.r = r !== undefined ? r : 0;
    this.g = g !== undefined ? g : 0;
    this.b = b !== undefined ? b : 0;
    this.isColor = true;
  }

  copy(color: {r: number, g: number, b: number}) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    return this;
  }

  lerpColors(color1: {r: number, g: number, b: number}, 
             color2: {r: number, g: number, b: number}, 
             alpha: number) {
    this.r = color1.r + (color2.r - color1.r) * alpha;
    this.g = color1.g + (color2.g - color1.g) * alpha;
    this.b = color1.b + (color2.b - color1.b) * alpha;
    return this;
  }
}

// Now import modules
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import createRenderer, { act } from '@react-three/test-renderer';

// Mock @react-three/cannon before other imports
vi.mock('@react-three/cannon', () => ({
  Physics: ({ children }: { children: React.ReactNode }) => <div data-testid="physics">{children}</div>,
  useSphere: () => {
    return [
      { current: { position: { set: vi.fn() } } },
      { velocity: { set: vi.fn() }, position: { set: vi.fn() } }
    ];
  }
}));

// Mock three.js and modules that depend on it before importing LlamaCore
// which imports THREE directly
vi.mock('three', async () => {
  const actualThree = await vi.importActual('three');
  return {
    ...actualThree,
    Color: vi.fn().mockImplementation((...args) => new ColorMock(...args)),
    Points: createPointsMock(),
    MeshStandardMaterial: vi.fn().mockImplementation(() => ({
      color: new ColorMock(0, 1, 0),
      opacity: 1,
      transparent: true,
      needsUpdate: false,
      castShadow: false,
      receiveShadow: false,
    })),
    PointsMaterial: vi.fn().mockImplementation(() => ({
      color: 0xff0000,
      size: 0.02,
      sizeAttenuation: true
    }))
  };
});

// Frame callbacks array for the mock
const frameCallbacks: ((state: any, delta: number) => void)[] = [];

// Mock @react-three/fiber
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    useFrame: (callback: (state: any, delta: number) => void) => {
      frameCallbacks.push(callback);
    }
  };
});

// Mock @react-three/drei
vi.mock('@react-three/drei', () => {
  return {
    useGLTF: () => {
      const nodes = createMockNodes();
      const materials = createMockMaterials();
      const group = new THREE.Group();
      group.add(nodes.Llama_body, nodes.Llama_teeth, nodes.Llama_eyes);
      const scene = new THREE.Scene();
      scene.add(group);
      return {
        nodes,
        materials,
        scene,
        animations: [],
      };
    }
  };
});

// Now we can safely import THREE and LlamaCore
import * as THREE from 'three';
import { LlamaCore } from './LlamaCore';

// Create mock geometries and nodes
const mockBodyGeometry = new THREE.BufferGeometry();
const mockTeethGeometry = new THREE.BufferGeometry();
const mockEyesGeometry = new THREE.BufferGeometry();

// Initialize mockNodes
const mockNodes = {
  Llama_body: new THREE.Mesh(mockBodyGeometry, new THREE.MeshBasicMaterial()),
  Llama_teeth: new THREE.Mesh(mockTeethGeometry, new THREE.MeshBasicMaterial()),
  Llama_eyes: new THREE.Mesh(mockEyesGeometry, new THREE.MeshBasicMaterial()),
};

// Factory functions
const createMockNodes = () => ({
  Llama_body: new THREE.Mesh(mockBodyGeometry, new THREE.MeshBasicMaterial()),
  Llama_teeth: new THREE.Mesh(mockTeethGeometry, new THREE.MeshBasicMaterial()),
  Llama_eyes: new THREE.Mesh(mockEyesGeometry, new THREE.MeshBasicMaterial()),
});

const createMockMaterials = () => ({ 
  lambert2SG: new THREE.MeshStandardMaterial() 
});

// Helper function to run multiple updates
async function updateMultipleTimes(renderer: any, times: number = 10) {
  for (let i = 0; i < times; i++) {
    await act(() => renderer.update());
  }
}

// Helper function to find all meshes recursively
function findMeshes(object: THREE.Object3D): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    if (object instanceof THREE.Mesh) { // Use instanceof for type safety
        meshes.push(object);
    }
    object.children.forEach((child: THREE.Object3D) => {
        meshes.push(...findMeshes(child));
    });
    return meshes;
}

// Helper function to find Points objects
function findPoints(object: THREE.Object3D): THREE.Points[] {
    const points: THREE.Points[] = [];
    if (object instanceof THREE.Points) {
        points.push(object);
    }
     object.children.forEach((child: THREE.Object3D) => {
        points.push(...findPoints(child));  // Recursively search in children
    });
    return points;
}

// Test suite
describe('<LlamaCore />', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        frameCallbacks.length = 0; // Clear frame callbacks
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it('renders without crashing', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
    await act(() => renderer.update()); // Ensure frame updates are processed
    await act(() => renderer.update()); // Ensure frame updates are processed
    await act(() => renderer.update()); // Ensure frame updates are processed
    await act(() => renderer.update()); // Ensure frame updates are processed
    await act(() => renderer.update()); // Ensure frame updates are processed
    await act(() => renderer.update()); // Ensure frame updates are processed
    for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
    await act(() => renderer.update());
    await act(() => renderer.update());
    await act(() => renderer.update()); // Ensure frame updates are processed
    for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
        expect(renderer).toBeDefined();
    });

    it('initializes with correct initial state', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        for (let i = 0; i < 20; i++) {  // Increase iterations to 20 frames.
            await act(() => renderer.update());
        }
        // Optionally, add a short delay.
        await new Promise(resolve => setTimeout(resolve, 100));
        const threeScene = renderer.scene;
        const group = threeScene.children.find((child: THREE.Object3D) => child.type === 'Group');
        expect(group).toBeDefined();
        const meshes = findMeshes(threeScene);
        expect(meshes.length).toBeGreaterThan(0);
    });

    // Rest of the tests remain the same...
    // ...
    
    it('updates health state over time', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await act(() => renderer.update()); // Ensure frame updates are processed
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
        await act(() => renderer.update());
        await act(() => renderer.update());
        await act(() => renderer.update()); 
        for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        expect(meshes.length).toBeGreaterThan(0);
        if (meshes.length === 0) console.log("Meshes not found in scene:", threeScene);
        const mesh = meshes[0];
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeCloseTo(1);
        await act(async () => {
            vi.advanceTimersByTime(1000);
            frameCallbacks.forEach(cb => cb({}, 0.016)); // Simulate 1 second of frame updates
        });
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeLessThan(1);
    });

    it('changes color and opacity based on health', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await act(() => renderer.update()); // Ensure frame updates are processed
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        await act(() => renderer.update()); 
        for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
        await act(() => renderer.update());
        await act(() => renderer.update());
        await act(() => renderer.update()); 
        for (let i = 0; i < 10; i++) { await act(() => renderer.update()); } // Simulate 10 frames
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        expect(meshes.length).toBeGreaterThan(0);
        if (meshes.length === 0) console.log("Meshes not found in scene:", threeScene);
        const mesh = meshes[0];
        expect((mesh.material as THREE.MeshStandardMaterial).color.r).toBeCloseTo(0, 1);
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeCloseTo(1, 1);
        expect((mesh.material as THREE.MeshStandardMaterial).color.b).toBeCloseTo(0, 1);
        expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBe(1);

        await act(async () => {
            vi.advanceTimersByTime(3000);
            frameCallbacks.forEach(cb => cb({}, 0.016));
        });
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeLessThan(1);
        expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBeLessThan(1);

        await act(async () => {
            vi.advanceTimersByTime(7000);
            frameCallbacks.forEach(cb => cb({}, 0.016));
        });
        expect((mesh.material as THREE.MeshStandardMaterial).color.r).toBeGreaterThan(0.8);
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeLessThan(0.2);
        expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBeLessThan(0.4);
    });

    it('cleans up the interval on unmount', async () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        await act(async () => {
            renderer.unmount();
        });
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('creates particles with positions', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const points = findPoints(threeScene);
        expect(points.length).toBeGreaterThan(0); // Ensure particles exist
        const positions = points[0].geometry.attributes.position.array;
        expect(positions.length).toBe(5000 * 3); // Adjust based on expected particle count
    }, 20000); // Increase timeout

    it('rotates the llama model over time', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const group = renderer.scene.children.find((child: { type: string; }) => child.type === 'Group') as THREE.Group;
        if (!group) {
            throw new Error("Group not found in scene");
        }
        const initialRotation = group.rotation.y;
        await act(async () => {
            vi.advanceTimersByTime(1000);
            frameCallbacks.forEach(cb => cb({}, 0.016)); // Simulate 1 second of frame updates
        });
        expect(group.rotation.y).toBeGreaterThan(initialRotation);
    });

    it('updates particle rotation over time', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const points = findPoints(threeScene);
        expect(points.length).toBe(1);
        const initialRotation = points[0].rotation.y;
        await act(async () => {
            vi.advanceTimersByTime(1000);
            frameCallbacks.forEach(cb => cb({}, 0.016)); // Simulate 1 second of frame updates
        });
        expect(points[0].rotation.y).toBeGreaterThan(initialRotation);
    });

    it('renders the llama body mesh', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        const llamaBody = meshes.find(mesh => mesh.geometry === mockNodes.Llama_body.geometry);
        expect(llamaBody).toBeDefined();
    });

    it('renders the llama teeth mesh', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        const llamaTeeth = meshes.find(mesh => mesh.geometry === mockNodes.Llama_teeth.geometry);
        expect(llamaTeeth).toBeDefined();
    });

    it('renders the llama eyes mesh', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        const llamaEyes = meshes.find(mesh => mesh.geometry === mockNodes.Llama_eyes.geometry);
        expect(llamaEyes).toBeDefined();
    });

    it('updates llama material transparency based on health', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        const mesh = meshes[0];
        expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBe(1);
        await act(async () => {
            vi.advanceTimersByTime(5000);
            frameCallbacks.forEach(cb => cb({}, 0.016)); // Simulate 5 seconds of frame updates
        });
        expect((mesh.material as THREE.MeshStandardMaterial).opacity).toBeLessThan(1);
    });

    it('removes particles on unmount', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const pointsBeforeUnmount = findPoints(threeScene);
        expect(pointsBeforeUnmount.length).toBeGreaterThan(0); // Ensure particles exist
        await act(async () => {
            renderer.unmount();
        });
        const pointsAfterUnmount = findPoints(threeScene);
        expect(pointsAfterUnmount.length).toBe(0); // Ensure particles are removed
    });

    it('updates llama material color based on health', async () => {
        const renderer = await act(() => createRenderer.create(<LlamaCore />));
        await updateMultipleTimes(renderer, 20);
        const threeScene = renderer.scene;
        const meshes = findMeshes(threeScene);
        const mesh = meshes[0];
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeCloseTo(1);
        await act(async () => {
            vi.advanceTimersByTime(5000);
            frameCallbacks.forEach(cb => cb({}, 0.016)); // Simulate 5 seconds of frame updates
        });
        expect((mesh.material as THREE.MeshStandardMaterial).color.g).toBeLessThan(1);
    });
});

import { render, cleanup } from '@testing-library/react';
import { App } from './LlamaCore';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Outlines, Environment, useTexture } from '@react-three/drei';
import { Physics, useSphere } from '@react-three/cannon';
import { EffectComposer, N8AO, SMAA, Bloom } from '@react-three/postprocessing';
import { useControls } from 'leva';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { act } from 'react-dom/test-utils';
import React from 'react';

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

declare module '@react-three/postprocessing';
declare module 'leva';

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

test('renders without crashing', () => {
  const { container } = render(
    <Canvas>
      <App />
    </Canvas>
  );
  expect(container).toBeTruthy();
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LlamaCore } from './LlamaCore';

// Mock three.js
vi.mock('three', () => ({
  WebGLRenderer: vi.fn(),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  Vector3: vi.fn(() => ({
    set: vi.fn()
  })),
  Color: vi.fn(),
  Mesh: vi.fn(),
  Group: vi.fn(),
  Box3: vi.fn(),
  Matrix4: vi.fn()
}));

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: { position: { set: vi.fn() } },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    scene: {}
  }))
}));

// Mock @react-three/cannon with proper physics mocking
vi.mock('@react-three/cannon', () => {
  return {
    Physics: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="physics">{children}</div>
    ),
    usePlane: () => [vi.fn(), {}],
    useBox: () => [vi.fn(), {}],
    __esModule: true
  };
});

describe('LlamaCore', () => {
  it('renders without crashing', () => {
    const { container } = render(<LlamaCore />);
    expect(container).toBeTruthy();
  });

  it('sets up physics environment', () => {
    const { getByTestId } = render(<LlamaCore />);
    expect(getByTestId('physics')).toBeInTheDocument();
  });

  it('renders in a Canvas', () => {
    const { getByTestId } = render(<LlamaCore />);
    expect(getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
