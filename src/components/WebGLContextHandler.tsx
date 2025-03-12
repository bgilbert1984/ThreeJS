// src/components/WebGLContextHandler.tsx
import React, { useEffect } from 'react';
import * as THREE from 'three';
import WebGLMemoryUtils from '../utils/WebGLMemoryUtils';

interface WebGLContextHandlerProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Component that handles WebGL context loss and recovery
 * Wrap your Three.js components with this handler to prevent crashes
 */
const WebGLContextHandler: React.FC<WebGLContextHandlerProps> = ({ children, onError }) => {
  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      const error = new Error('WebGL not supported');
      if (onError) onError(error);
      return;
    }

    // Set up context loss handler
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, pausing rendering...');
      
      // Force cleanup when context is lost
      WebGLMemoryUtils.forceGarbageCollection();
    };

    // Context restored handler
    const handleContextRestored = () => {
      console.log('WebGL context restored, resuming...');
    };

    // Add handlers with passive option where appropriate
    const addEventListeners = (element: HTMLCanvasElement) => {
      element.addEventListener('webglcontextlost', handleContextLost);
      element.addEventListener('webglcontextrestored', handleContextRestored);
      
      // Add passive wheel listener
      element.addEventListener('wheel', () => {}, { passive: true });
    };

    // Find and set up all WebGL canvases
    const setupCanvases = () => {
      document.querySelectorAll('canvas').forEach(canvas => {
        const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (context) {
          addEventListeners(canvas);
        }
      });
    };

    // Initial setup
    setupCanvases();

    // Watch for new canvases
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLCanvasElement) {
            addEventListeners(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
      document.querySelectorAll('canvas').forEach(canvas => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      });
    };
  }, [onError]);

  return <>{children}</>;
};

export default WebGLContextHandler;