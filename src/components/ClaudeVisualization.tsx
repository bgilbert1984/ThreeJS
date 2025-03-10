import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Neural activity simulation types
interface NeuronSignal {
  fromLayer: number;
  fromNeuron: number;
  toLayer: number;
  toNeuron: number;
  progress: number;
  speed: number;
}

interface NeuronPosition {
  x: number;
  y: number;
  z: number;
}

interface VisualizationSettings {
  rotationSpeed: number;
  animationIntensity: number;
  signalCount: number;
  bloomIntensity: number;
  colorScheme: 'default' | 'grayscale' | 'rainbow' | 'heatmap';
}

const NeuralNetworkVisualization: React.FC = () => {
  // Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const signalsRef = useRef<NeuronSignal[]>([]);
  const signalMeshesRef = useRef<THREE.Mesh[]>([]);
  const neuronPositionsRef = useRef<NeuronPosition[][][]>([]);
  const layerPointsRef = useRef<THREE.Points[]>([]);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const rafIdRef = useRef<number | null>(null);
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<VisualizationSettings>({
    rotationSpeed: 0.1,
    animationIntensity: 0.2,
    signalCount: 10,
    bloomIntensity: 1.5,
    colorScheme: 'default',
  });
  const [activeNeurons, setActiveNeurons] = useState<Map<string, number>>(new Map());
  const [showControls, setShowControls] = useState(false);
  const [activationMode, setActivationMode] = useState<'wave' | 'random' | 'targeted'>('wave');
  
  // Constants for network structure
  const layerCount = 7;
  const neuronsByLayer = [30, 40, 60, 80, 60, 40, 30];
  const layerSpacing = 10;
  const voxelSize = 0.5;
  
  // Color schemes
  const colorSchemes = {
    default: (l: number, angle: number, layerCount: number) => {
      return {
        r: 0.2 + (l / layerCount) * 0.4,
        g: 0.4 + (Math.sin(angle) * 0.2),
        b: 0.8 - (l / layerCount) * 0.2,
      };
    },
    grayscale: () => {
      const v = 0.3 + Math.random() * 0.7;
      return { r: v, g: v, b: v };
    },
    rainbow: (l: number, angle: number, layerCount: number) => {
      const hue = (l / layerCount) + (angle / (Math.PI * 2));
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      return { r: color.r, g: color.g, b: color.b };
    },
    heatmap: (l: number, angle: number, layerCount: number) => {
      // Heat map: red-yellow-white progression
      const heat = (l / layerCount) * 0.7 + Math.random() * 0.3;
      return {
        r: Math.min(1.0, 0.5 + heat * 0.5),
        g: Math.min(1.0, heat * 0.9),
        b: Math.min(1.0, heat * 0.5),
      };
    }
  };
    
  // Create a single neuron signal
  const createSignal = useCallback(() => {
    const fromLayer = Math.floor(Math.random() * (layerCount - 1));
    const toLayer = fromLayer + 1;
    const fromNeuron = Math.floor(Math.random() * neuronsByLayer[fromLayer]);
    const toNeuron = Math.floor(Math.random() * neuronsByLayer[toLayer]);
    
    return {
      fromLayer,
      fromNeuron,
      toLayer,
      toNeuron,
      progress: 0,
      speed: 0.01 + Math.random() * 0.02,
    };
  }, []);
  
  // Initialize neuron positions
  const initializeNeuronPositions = useCallback(() => {
    const positions: NeuronPosition[][][] = [];
    
    for (let l = 0; l < layerCount; l++) {
      positions[l] = [];
      const neuronCount = neuronsByLayer[l];
      const layerX = (l - (layerCount - 1) / 2) * layerSpacing;
      
      for (let i = 0; i < neuronCount; i++) {
        positions[l][i] = [];
        const radius = 12;
        const angle = (i / neuronCount) * Math.PI * 2;
        const baseY = Math.sin(angle) * radius;
        const baseZ = Math.cos(angle) * radius;
        
        for (let j = 0; j < 10; j++) {
          const offsetX = (Math.random() - 0.5) * 2;
          const offsetY = (Math.random() - 0.5) * 2;
          const offsetZ = (Math.random() - 0.5) * 2;
          
          positions[l][i].push({
            x: layerX + offsetX,
            y: baseY + offsetY,
            z: baseZ + offsetZ,
          });
        }
      }
    }
    
    return positions;
  }, []);
  
  // Create neural network layers
  const createNeuralNetwork = useCallback(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const neuronPositions = initializeNeuronPositions();
    neuronPositionsRef.current = neuronPositions;
    
    // Create point material
    const pointMaterial = new THREE.PointsMaterial({
      size: voxelSize,
      sizeAttenuation: true,
      vertexColors: true,
    });
    
    // Generate points for each layer
    for (let l = 0; l < layerCount; l++) {
      const positions: number[] = [];
      const colors: number[] = [];
      const neuronCount = neuronsByLayer[l];
      const layerX = (l - (layerCount - 1) / 2) * layerSpacing;
      
      // Create neurons in a circular pattern
      for (let i = 0; i < neuronCount; i++) {
        const radius = 12;
        const angle = (i / neuronCount) * Math.PI * 2;
        
        for (let j = 0; j < 10; j++) {
          const position = neuronPositions[l][i][j];
          positions.push(position.x, position.y, position.z);
          
          // Get color based on current color scheme
          const colorFn = colorSchemes[settings.colorScheme];
          const color = colorFn(l, angle, layerCount);
          colors.push(color.r, color.g, color.b);
        }
      }
      
      // Create point cloud geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
      
      // Create point cloud
      const pointCloud = new THREE.Points(geometry, pointMaterial);
      scene.add(pointCloud);
      layerPointsRef.current.push(pointCloud);
      
      // Add animation data to userData
      pointCloud.userData = {
        originalPositions: [...positions],
        animationOffset: Math.random() * Math.PI * 2,
        layer: l,
      };
    }
    
    // Create connections between layers (just visual guides)
    createLayerConnections();
    
    // Create initial signals
    createSignalBatch();
  }, [settings.colorScheme]);
  
  // Create connections between adjacent layers
  const createLayerConnections = useCallback(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8080ff,
      transparent: true,
      opacity: 0.1,
    });
    
    // Create sparse connections between layers
    for (let l = 0; l < layerCount - 1; l++) {
      // Only create a subset of connections to avoid visual clutter
      const connectionsPerLayer = 30;
      
      for (let c = 0; c < connectionsPerLayer; c++) {
        const fromNeuron = Math.floor(Math.random() * neuronsByLayer[l]);
        const toNeuron = Math.floor(Math.random() * neuronsByLayer[l + 1]);
        
        // Use the first point from each neuron for the connection line
        const fromPos = neuronPositionsRef.current[l][fromNeuron][0];
        const toPos = neuronPositionsRef.current[l + 1][toNeuron][0];
        
        const points = [
          new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z),
          new THREE.Vector3(toPos.x, toPos.y, toPos.z),
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
      }
    }
  }, []);
  
  // Create a batch of signals
  const createSignalBatch = useCallback(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    
    // Clear existing signal meshes
    signalMeshesRef.current.forEach(mesh => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      }
    });
    
    signalMeshesRef.current = [];
    signalsRef.current = [];
    
    // Create new signals
    for (let i = 0; i < settings.signalCount; i++) {
      const signal = createSignal();
      signalsRef.current.push(signal);
      
      // Create a small sphere to represent the signal
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      signalMeshesRef.current.push(mesh);
      
      // Position will be set during animation
      updateSignalPosition(mesh, signal);
    }
  }, [settings.signalCount, createSignal]);
  
  // Update position of a signal mesh based on signal progress
  const updateSignalPosition = (mesh: THREE.Mesh, signal: NeuronSignal) => {
    const fromPos = neuronPositionsRef.current[signal.fromLayer][signal.fromNeuron][0];
    const toPos = neuronPositionsRef.current[signal.toLayer][signal.toNeuron][0];
    
    // Interpolate position based on progress
    mesh.position.set(
      fromPos.x + (toPos.x - fromPos.x) * signal.progress,
      fromPos.y + (toPos.y - fromPos.y) * signal.progress,
      fromPos.z + (toPos.z - fromPos.z) * signal.progress
    );
  };
  
  // Generate neural activation patterns
  const generateActivations = useCallback(() => {
    const newActive = new Map<string, number>();
    
    if (activationMode === 'wave') {
      // Create a wave pattern that moves through the network
      const wavePosition = (clockRef.current.getElapsedTime() % 7) / 7;
      const layerIdx = Math.floor(wavePosition * layerCount);
      
      if (layerIdx >= 0 && layerIdx < layerCount) {
        for (let n = 0; n < neuronsByLayer[layerIdx]; n++) {
          // Activate with varying intensities
          const intensity = 0.5 + 0.5 * Math.sin(n * 0.2 + clockRef.current.getElapsedTime() * 2);
          newActive.set(`${layerIdx}-${n}`, intensity);
        }
      }
    } else if (activationMode === 'random') {
      // Random neuron activations
      const activationCount = Math.floor(Math.random() * 20) + 10;
      
      for (let i = 0; i < activationCount; i++) {
        const l = Math.floor(Math.random() * layerCount);
        const n = Math.floor(Math.random() * neuronsByLayer[l]);
        newActive.set(`${l}-${n}`, 0.7 + Math.random() * 0.3);
      }
    } else if (activationMode === 'targeted') {
      // Targeted activations - simulate a specific pattern
      // Start at input layer
      if (clockRef.current.getElapsedTime() % 5 < 2.5) {
        // Activate specific input neurons
        for (let n = 10; n < 20; n++) {
          newActive.set(`0-${n}`, 0.9);
        }
        
        // Activate neurons in hidden layers along a path
        for (let l = 1; l < layerCount - 1; l++) {
          for (let n = Math.floor(neuronsByLayer[l] / 3); n < Math.floor(neuronsByLayer[l] / 3) + 5; n++) {
            newActive.set(`${l}-${n}`, 0.8);
          }
        }
        
        // Activate output neurons
        for (let n = 12; n < 17; n++) {
          newActive.set(`${layerCount - 1}-${n}`, 1.0);
        }
      }
    }
    
    setActiveNeurons(newActive);
  }, [activationMode]);
  
  // Update neuron colors based on activations
  const updateNeuronColors = useCallback(() => {
    layerPointsRef.current.forEach((points, l) => {
      const colors = points.geometry.attributes.color.array as Float32Array;
      const neuronCount = neuronsByLayer[l];
      
      for (let i = 0; i < neuronCount; i++) {
        const isActive = activeNeurons.has(`${l}-${i}`);
        const activationValue = activeNeurons.get(`${l}-${i}`) || 0;
        
        // For each voxel in this neuron
        for (let j = 0; j < 10; j++) {
          const colorIdx = (i * 10 + j) * 3;
          
          // Get the base color values
          let r = colors[colorIdx];
          let g = colors[colorIdx + 1];
          let b = colors[colorIdx + 2];
          
          if (isActive) {
            // Increase brightness based on activation value
            r = Math.min(1.0, r + 0.3 * activationValue);
            g = Math.min(1.0, g + 0.3 * activationValue);
            b = Math.min(1.0, b + 0.3 * activationValue);
          }
          
          colors[colorIdx] = r;
          colors[colorIdx + 1] = g;
          colors[colorIdx + 2] = b;
        }
      }
      
      points.geometry.attributes.color.needsUpdate = true;
    });
  }, [activeNeurons]);
  
  // Main animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !composerRef.current) return;
    
    const elapsedTime = clockRef.current.getElapsedTime();
    
    // Animate all point clouds
    layerPointsRef.current.forEach((pointCloud, idx) => {
      const positions = pointCloud.geometry.attributes.position.array as Float32Array;
      const originalPositions = pointCloud.userData.originalPositions as number[];
      const animationOffset = pointCloud.userData.animationOffset as number;
      const layer = pointCloud.userData.layer as number;
      
      // Pulse effect based on layer
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] =
          originalPositions[i] +
          Math.sin(elapsedTime * 0.5 + animationOffset + layer * 0.2) * settings.animationIntensity;
        positions[i + 1] =
          originalPositions[i + 1] +
          Math.sin(elapsedTime * 0.7 + animationOffset) * settings.animationIntensity;
        positions[i + 2] =
          originalPositions[i + 2] +
          Math.cos(elapsedTime * 0.6 + animationOffset) * settings.animationIntensity;
      }
      
      pointCloud.geometry.attributes.position.needsUpdate = true;
    });
    
    // Update signal positions and progress
    signalsRef.current.forEach((signal, idx) => {
      signal.progress += signal.speed;
      
      if (signal.progress >= 1) {
        // Signal reached destination, create a new signal
        const newSignal = createSignal();
        signalsRef.current[idx] = newSignal;
        
        // Activate the target neuron
        const key = `${signal.toLayer}-${signal.toNeuron}`;
        activeNeurons.set(key, 1.0);
        setActiveNeurons(new Map(activeNeurons));
      } else {
        updateSignalPosition(signalMeshesRef.current[idx], signal);
      }
    });
    
    // Generate neuron activations periodically
    if (Math.floor(elapsedTime * 10) % 5 === 0) {
      generateActivations();
    }
    
    // Update neuron colors based on activation
    updateNeuronColors();
    
    // Auto-rotation if controls aren't being used
    if (!controlsRef.current?.enabled) {
      sceneRef.current.rotation.y += settings.rotationSpeed * 0.01;
    }
    
    // Render the scene with post-processing
    composerRef.current.render();
    
    rafIdRef.current = requestAnimationFrame(animate);
  }, [settings.animationIntensity, settings.rotationSpeed, createSignal, generateActivations, updateNeuronColors]);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 40;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enabled = false; // Start with auto-rotation
    controlsRef.current = controls;
    
    // Set up post-processing
    const renderScene = new RenderPass(scene, camera);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      settings.bloomIntensity, // Intensity
      0.4, // Radius
      0.85 // Threshold
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    
    // Event listeners
    const handleMouseMove = () => {
      if (controlsRef.current && !controlsRef.current.enabled) {
        controlsRef.current.enabled = true;
      }
    };
    
    // Resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !composerRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      composerRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    
    // Initialize network and start animation
    clockRef.current.start();
    createNeuralNetwork();
    setIsLoading(false);
    rafIdRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      // Dispose of all geometries, materials, etc.
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        } else if (object instanceof THREE.Points) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      composer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);
  
  // Update effect composer when bloom settings change
  useEffect(() => {
    if (!composerRef.current) return;
    const bloomPass = composerRef.current.passes[1] as UnrealBloomPass;
    if (bloomPass) {
      bloomPass.strength = settings.bloomIntensity;
    }
  }, [settings.bloomIntensity]);
  
  // Recreate the visualization when the color scheme changes
  useEffect(() => {
    if (!sceneRef.current || !isLoading) return;
    
    // Clear existing network
    layerPointsRef.current.forEach(points => {
      sceneRef.current?.remove(points);
      points.geometry.dispose();
      if (points.material instanceof THREE.Material) {
        points.material.dispose();
      }
    });
    
    layerPointsRef.current = [];
    
    // Recreate with new color scheme
    createNeuralNetwork();
  }, [settings.colorScheme, createNeuralNetwork, isLoading]);
  
  // Update signals when count changes
  useEffect(() => {
    createSignalBatch();
  }, [settings.signalCount, createSignalBatch]);
  
  // Handle setting changes
  const handleSettingChange = (key: keyof VisualizationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-0 left-0 w-full h-full" ref={mountRef} />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white">
          <p className="text-xl">Loading visualization...</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">
          Claude Neural Network Visualization
        </h2>
        <p>
          A 3D representation of neural network activity with dynamic signal flow
        </p>
        <button 
          onClick={toggleControls} 
          className="mt-2 bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>
      
      {showControls && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 p-4 rounded text-white">
          <h3 className="font-bold mb-2">Visualization Controls</h3>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Rotation Speed</label>
            <input 
              type="range" 
              min="0" 
              max="0.5" 
              step="0.01"
              value={settings.rotationSpeed}
              onChange={(e) => handleSettingChange('rotationSpeed', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Animation Intensity</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={settings.animationIntensity}
              onChange={(e) => handleSettingChange('animationIntensity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Signal Count</label>
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="1"
              value={settings.signalCount}
              onChange={(e) => handleSettingChange('signalCount', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Bloom Intensity</label>
            <input 
              type="range" 
              min="0" 
              max="3" 
              step="0.1"
              value={settings.bloomIntensity}
              onChange={(e) => handleSettingChange('bloomIntensity', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Activation Pattern</label>
            <select 
              value={activationMode}
              onChange={(e) => setActivationMode(e.target.value as any)}
              className="bg-gray-800 text-white px-2 py-1 rounded w-full"
            >
              <option value="wave">Wave Pattern</option>
              <option value="random">Random Firing</option>
              <option value="targeted">Targeted Path</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Color Scheme</label>
            <select 
              value={settings.colorScheme}
              onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
              className="bg-gray-800 text-white px-2 py-1 rounded w-full"
            >
              <option value="default">Default (Blue-Purple)</option>
              <option value="grayscale">Grayscale</option>
              <option value="rainbow">Rainbow</option>
              <option value="heatmap">Heatmap</option>
            </select>
          </div>
          
          <div className="text-xs mt-4">
            <p>Mouse drag to rotate • Scroll to zoom</p>
            <p>Active neurons: {activeNeurons.size}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkVisualization;
