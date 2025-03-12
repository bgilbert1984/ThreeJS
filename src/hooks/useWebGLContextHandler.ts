import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLContextHandlerOptions {
  /**
   * Custom error message to display when context is lost
   */
  errorMessage?: string;
  /**
   * Whether to attempt automatic recovery
   */
  autoRecover?: boolean;
  /**
   * Maximum number of recovery attempts before giving up
   */
  maxRecoveryAttempts?: number;
  /**
   * Callback when context is lost
   */
  onContextLost?: (event: Event) => void;
  /**
   * Callback when context is restored
   */
  onContextRestored?: () => void;
  /**
   * Callback when recovery fails after max attempts
   */
  onRecoveryFailed?: () => void;
  /**
   * Delay in ms before attempting recovery
   */
  recoveryDelay?: number;
}

/**
 * Hook to handle WebGL context loss and restoration
 */
export const useWebGLContextHandler = ({
  errorMessage = 'WebGL context was lost. Attempting to recover...',
  autoRecover = true,
  maxRecoveryAttempts = 3,
  onContextLost,
  onContextRestored,
  onRecoveryFailed,
  recoveryDelay = 1000,
}: WebGLContextHandlerOptions = {}) => {
  const [contextLost, setContextLost] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const animateRef = useRef<(() => void) | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const resourcesRef = useRef<{
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
    textures: THREE.Texture[];
  }>({
    geometries: [],
    materials: [],
    textures: [],
  });

  // Function to register resources for proper disposal
  const registerResources = (resources: {
    geometries?: THREE.BufferGeometry[];
    materials?: THREE.Material[];
    textures?: THREE.Texture[];
  }) => {
    if (resources.geometries) {
      resourcesRef.current.geometries.push(...resources.geometries);
    }
    if (resources.materials) {
      resourcesRef.current.materials.push(...resources.materials);
    }
    if (resources.textures) {
      resourcesRef.current.textures.push(...resources.textures);
    }
  };

  // Function to handle context loss
  const handleContextLost = (event: Event) => {
    event.preventDefault(); // Prevent default browser action
    console.warn('WebGL context lost');
    setContextLost(true);
    
    // Cancel current animation frame
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.id = 'webgl-error-message';
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.background = 'rgba(0, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.textAlign = 'center';
    errorDiv.innerHTML = `
      <h3 style="margin-top: 0; color: #ff5555;">WebGL Error</h3>
      <p>${errorMessage}</p>
      <p id="recovery-status">Attempting to recover... (1/${maxRecoveryAttempts})</p>
    `;
    document.body.appendChild(errorDiv);
    
    // Call the custom context lost handler if provided
    if (onContextLost) {
      onContextLost(event);
    }
    
    // Attempt recovery if enabled
    if (autoRecover) {
      attemptRecovery();
    }
  };

  // Function to attempt recovery
  const attemptRecovery = () => {
    setRecoveryAttempts(prev => prev + 1);
    
    // Update status message
    const statusElement = document.getElementById('recovery-status');
    if (statusElement) {
      statusElement.textContent = `Attempting to recover... (${recoveryAttempts + 1}/${maxRecoveryAttempts})`;
    }
    
    // Check if we've reached max attempts
    if (recoveryAttempts >= maxRecoveryAttempts - 1) {
      const errorDiv = document.getElementById('webgl-error-message');
      if (errorDiv) {
        errorDiv.innerHTML = `
          <h3 style="margin-top: 0; color: #ff5555;">WebGL Error</h3>
          <p>Maximum recovery attempts reached. Please refresh the page.</p>
          <button id="reload-button" style="background: #5555ff; border: none; color: white; padding: 10px 15px; cursor: pointer; border-radius: 3px;">
            Reload Page
          </button>
        `;
        
        const reloadButton = document.getElementById('reload-button');
        if (reloadButton) {
          reloadButton.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }
      
      setRecoveryFailed(true);
      if (onRecoveryFailed) {
        onRecoveryFailed();
      }
      return;
    }
    
    // Wait for a delay and try again
    setTimeout(() => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        try {
          // Attempt to render a frame
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          handleContextRestored();
        } catch (error) {
          console.error('Recovery attempt failed:', error);
          attemptRecovery();
        }
      } else {
        console.error('Renderer, scene, or camera not available for recovery');
        attemptRecovery();
      }
    }, recoveryDelay);
  };

  // Function to handle context restoration
  const handleContextRestored = () => {
    console.log('WebGL context restored');
    setContextLost(false);
    setRecoveryAttempts(0);
    
    // Remove error message
    const errorDiv = document.getElementById('webgl-error-message');
    if (errorDiv) {
      document.body.removeChild(errorDiv);
    }
    
    // Restart animation loop
    if (animateRef.current && rendererRef.current) {
      animateRef.current();
    }
    
    // Call the custom context restored handler if provided
    if (onContextRestored) {
      onContextRestored();
    }
  };

  // Setup function to initialize the handler with Three.js objects
  const setupContextHandler = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    animate: () => void
  ) => {
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    animateRef.current = animate;
    
    // Add event listeners
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);
  };

  // Cleanup function
  const cleanupContextHandler = () => {
    if (rendererRef.current) {
      rendererRef.current.domElement.removeEventListener('webglcontextlost', handleContextLost);
      rendererRef.current.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
    }
    
    // Cancel animation frame if active
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    // Remove any error message
    const errorDiv = document.getElementById('webgl-error-message');
    if (errorDiv) {
      document.body.removeChild(errorDiv);
    }
    
    // Dispose of all resources
    resourcesRef.current.geometries.forEach(geometry => geometry.dispose());
    resourcesRef.current.materials.forEach(material => material.dispose());
    resourcesRef.current.textures.forEach(texture => texture.dispose());
    
    // Clear resources
    resourcesRef.current = {
      geometries: [],
      materials: [],
      textures: [],
    };
    
    // Dispose of renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
  };

  // Set animation frame ID for cancellation
  const setAnimationFrameId = (id: number) => {
    animationFrameIdRef.current = id;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupContextHandler();
    };
  }, []);

  return {
    contextLost,
    recoveryAttempts,
    recoveryFailed,
    setupContextHandler,
    cleanupContextHandler,
    registerResources,
    setAnimationFrameId,
  };
};