import React, { useEffect, useRef } from 'react';
import { Canvas, Props as CanvasProps } from '@react-three/fiber';
import * as THREE from 'three';

interface ContextAwareCanvasProps extends CanvasProps {
  onContextLost?: (event: Event) => void;
  onContextRestored?: () => void;
  onContextCreationError?: (event: Event) => void;
  showErrorOverlay?: boolean;
}

/**
 * A Canvas component that adds WebGL context loss handling
 */
export const ContextAwareCanvas: React.FC<ContextAwareCanvasProps> = ({
  children,
  onContextLost,
  onContextRestored,
  onContextCreationError,
  showErrorOverlay = true,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const errorDivRef = useRef<HTMLDivElement | null>(null);

  // Save canvas reference when created
  const handleCanvasCreated = (state: { gl: THREE.WebGLRenderer }) => {
    // Store the canvas reference
    canvasRef.current = state.gl.domElement;

    // If onCreated prop is provided, call it
    if (props.onCreated) {
      props.onCreated(state);
    }
  };

  // Handle context loss
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost in ContextAwareCanvas');
    
    // Show error overlay if enabled
    if (showErrorOverlay) {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'absolute';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.width = '100%';
      errorDiv.style.height = '100%';
      errorDiv.style.display = 'flex';
      errorDiv.style.alignItems = 'center';
      errorDiv.style.justifyContent = 'center';
      errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      errorDiv.style.color = 'white';
      errorDiv.style.zIndex = '1000';
      errorDiv.style.flexDirection = 'column';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.padding = '20px';
      errorDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #ff5555;">WebGL Context Lost</h3>
        <p style="margin: 0 0 20px 0;">The 3D rendering context was lost. Attempting to recover...</p>
        <div style="width: 50%; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
          <div id="recovery-progress" style="width: 0%; height: 100%; background: #5555ff; transition: width 0.3s;"></div>
        </div>
      `;
      
      // Find the canvas container and append the error overlay
      if (canvasRef.current?.parentElement) {
        canvasRef.current.parentElement.appendChild(errorDiv);
        errorDivRef.current = errorDiv;
        
        // Animate the progress bar
        let progress = 0;
        const interval = setInterval(() => {
          progress = (progress + 1) % 100;
          const progressBar = document.getElementById('recovery-progress');
          if (progressBar) {
            progressBar.style.width = `${progress}%`;
          }
        }, 100);
        
        // Store the interval ID as a property of the error div for cleanup
        (errorDiv as any)._progressInterval = interval;
      }
    }

    // Call custom handler if provided
    if (onContextLost) {
      onContextLost(event);
    }
  };

  // Handle context restoration
  const handleContextRestored = () => {
    console.log('WebGL context restored in ContextAwareCanvas');
    
    // Remove error overlay if it exists
    if (errorDivRef.current) {
      // Clear the progress animation
      clearInterval((errorDivRef.current as any)._progressInterval);
      
      // Remove the div
      if (errorDivRef.current.parentElement) {
        errorDivRef.current.parentElement.removeChild(errorDivRef.current);
      }
      errorDivRef.current = null;
    }

    // Call custom handler if provided
    if (onContextRestored) {
      onContextRestored();
    }
  };

  // Handle context creation error
  const handleContextCreationError = (event: Event) => {
    console.error('WebGL context creation error in ContextAwareCanvas');
    
    // Show error message
    if (showErrorOverlay && canvasRef.current?.parentElement) {
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'absolute';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.width = '100%';
      errorDiv.style.height = '100%';
      errorDiv.style.display = 'flex';
      errorDiv.style.alignItems = 'center';
      errorDiv.style.justifyContent = 'center';
      errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      errorDiv.style.color = 'white';
      errorDiv.style.zIndex = '1000';
      errorDiv.style.flexDirection = 'column';
      errorDiv.style.textAlign = 'center';
      errorDiv.style.padding = '20px';
      errorDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #ff5555;">WebGL Error</h3>
        <p style="margin: 0 0 20px 0;">Unable to create WebGL context. Your browser may not support WebGL or your hardware may be incompatible.</p>
        <div style="max-width: 400px; margin: 0 auto;">
          <p style="font-size: 14px; opacity: 0.8; margin: 0 0 10px 0;">Try the following:</p>
          <ul style="text-align: left; padding-left: 20px; font-size: 14px; opacity: 0.8;">
            <li>Update your graphics drivers</li>
            <li>Try a different browser (Chrome or Firefox recommended)</li>
            <li>Disable hardware acceleration in your browser</li>
            <li>Check if your GPU is on the <a href="https://www.khronos.org/webgl/wiki/BlacklistsAndWhitelists" style="color: #5555ff;">WebGL compatibility list</a></li>
          </ul>
        </div>
      `;
      
      canvasRef.current.parentElement.appendChild(errorDiv);
      errorDivRef.current = errorDiv;
    }

    // Call custom handler if provided
    if (onContextCreationError) {
      onContextCreationError(event);
    }
  };

  // Attach and detach event listeners when the canvas reference changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('webglcontextlost', handleContextLost);
      canvasRef.current.addEventListener('webglcontextrestored', handleContextRestored);
      canvasRef.current.addEventListener('webglcontextcreationerror', handleContextCreationError);
    }

    return () => {
      // Clean up event listeners
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('webglcontextlost', handleContextLost);
        canvasRef.current.removeEventListener('webglcontextrestored', handleContextRestored);
        canvasRef.current.removeEventListener('webglcontextcreationerror', handleContextCreationError);
      }

      // Clean up error overlay if it exists
      if (errorDivRef.current) {
        clearInterval((errorDivRef.current as any)._progressInterval);
        if (errorDivRef.current.parentElement) {
          errorDivRef.current.parentElement.removeChild(errorDivRef.current);
        }
      }
    };
  }, [onContextLost, onContextRestored, onContextCreationError, showErrorOverlay]);

  // Default WebGL parameters for stability
  const defaultGLProps = {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: true,
    preserveDrawingBuffer: false,
  };

  return (
    <Canvas 
      {...props} 
      gl={{ ...defaultGLProps, ...(props.gl || {}) }}
      onCreated={handleCanvasCreated}
    >
      {children}
    </Canvas>
  );
};