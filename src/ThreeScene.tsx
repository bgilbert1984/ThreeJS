import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWebGLContextHandler } from './hooks/useWebGLContextHandler';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use our new WebGL context handler hook
  const {
    contextLost,
    setupContextHandler,
    cleanupContextHandler,
    registerResources,
    setAnimationFrameId
  } = useWebGLContextHandler({
    errorMessage: 'WebGL context was lost. Attempting to recover your 3D scene...',
    maxRecoveryAttempts: 3,
    onContextLost: (event) => {
      console.warn('ThreeScene: WebGL context lost, pausing animations and interactions');
    },
    onContextRestored: () => {
      console.log('ThreeScene: WebGL context restored, resuming scene');
    },
    onRecoveryFailed: () => {
      console.error('ThreeScene: Could not recover WebGL context after multiple attempts');
    }
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
       75,
       window.innerWidth / window.innerHeight,
       0.1,
       1000
    );

    // Add WebGL renderer options for better stability
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    mountRef.current.appendChild(renderer.domElement);

    // Add a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Register resources for proper disposal
    registerResources({
      geometries: [geometry],
      materials: [material],
      textures: []
    });

    // Position the camera
    camera.position.z = 5;

    // Animation loop with error handling
    const animate = () => {
      if (contextLost) return; // Don't animate when context is lost
      
      try {
        const id = requestAnimationFrame(animate);
        setAnimationFrameId(id);
        
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    // Set up context handler with our Three.js objects
    setupContextHandler(renderer, scene, camera, animate);

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Use our cleanup function from the hook
      cleanupContextHandler();
      
      // Remove canvas from DOM if not already removed
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [setupContextHandler, cleanupContextHandler, registerResources, contextLost, setAnimationFrameId]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeScene;