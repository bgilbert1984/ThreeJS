import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWebGLContextHandler } from './hooks/useWebGLContextHandler';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Use our WebGL context handler hook
  const {
    contextLost,
    setupContextHandler,
    cleanupContextHandler,
    registerResources,
    setAnimationFrameId
  } = useWebGLContextHandler({
    errorMessage: 'WebGL context was lost. Attempting to recover your 3D scene...',
    maxRecoveryAttempts: 3,
    onContextLost: (_event) => { // Prefix with underscore to indicate intentionally unused parameter
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
    
    // Animation function
    const animate = () => {
      if (contextLost) return; // Don't animate when context is lost
      
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      renderer.render(scene, camera);
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    };
    
    // Set up WebGL context loss/recovery handlers
    // Fix: Pass all required arguments to setupContextHandler
    setupContextHandler(renderer, scene, camera, animate);
    
    // Start animation loop
    animate();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      console.log('ThreeScene: Cleaning up resources');
      window.removeEventListener('resize', handleResize);
      
      // Clean up WebGL context handlers
      cleanupContextHandler();
      
      // Remove the canvas from the DOM
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose renderer
      renderer.dispose();
    };
  }, [setupContextHandler, cleanupContextHandler, registerResources, contextLost, setAnimationFrameId]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeScene;