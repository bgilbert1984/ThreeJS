import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWebGLContextHandler } from './hooks/useWebGLContextHandler';
import { WebGLMemoryUtils } from './utils/webglMemoryUtils';

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
    onContextLost: (_event) => {
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

    // Check WebGL support and capabilities before initializing
    const webGLSupport = WebGLMemoryUtils.checkWebGLSupport();
    if (!webGLSupport.supported || !webGLSupport.hardwareAccelerated) {
      console.error('WebGL not properly supported:', webGLSupport);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // Basic scene setup
    camera.position.z = 5;
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Register resources for cleanup
    registerResources({
      geometries: [geometry],
      materials: [material],
    });

    // Animation function
    const animate = () => {
      if (!contextLost) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
        const frameId = requestAnimationFrame(animate);
        setAnimationFrameId(frameId);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (!contextLost) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    // Set up context loss handling
    setupContextHandler(renderer, scene, camera, animate);

    // Start animation and add event listeners
    animate();
    window.addEventListener('resize', handleResize);

    // Performance monitoring
    const monitorPerformance = () => {
      const performanceIssues = WebGLMemoryUtils.checkPerformanceIssues();
      if (performanceIssues.hasIssues) {
        console.warn('Performance issues detected:', performanceIssues.issues);
      }
    };

    const performanceInterval = setInterval(monitorPerformance, 10000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(performanceInterval);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      cleanupContextHandler();
    };
  }, [setupContextHandler, cleanupContextHandler, registerResources, contextLost, setAnimationFrameId]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeScene;