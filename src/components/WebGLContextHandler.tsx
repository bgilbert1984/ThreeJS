// src/components/WebGLContextHandler.tsx
import React, { useEffect } from 'react';

interface WebGLContextHandlerProps {
  children: React.ReactNode;
}

/**
 * Component that handles WebGL context loss and recovery
 * Wrap your Three.js components with this handler to prevent crashes
 */
const WebGLContextHandler: React.FC<WebGLContextHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Create an overlay div for showing error messages
    const overlay = document.createElement('div');
    overlay.style.display = 'none';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    overlay.style.color = 'white';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';
    overlay.innerHTML = `
      <h3 style="margin-top: 0;">WebGL Context Lost</h3>
      <p>Attempting to recover the 3D rendering...</p>
      <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(overlay);

    // Handle context loss events
    const handleContextLost = (event: Event) => {
      event.preventDefault(); // Important: allows for potential recovery
      console.warn('WebGL context lost - attempting to recover');
      overlay.style.display = 'flex';
      
      // Attempt recovery after a short delay
      setTimeout(() => {
        console.log('Attempting to reload page to recover WebGL context');
        window.location.reload();
      }, 2000);
    };

    // Handle context restored events
    const handleContextRestored = () => {
      console.log('WebGL context restored successfully');
      overlay.style.display = 'none';
    };

    // Add global event listeners
    window.addEventListener('webglcontextlost', handleContextLost, false);
    window.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Find all canvas elements and add listeners
    const canvasElements = document.querySelectorAll('canvas');
    canvasElements.forEach(canvas => {
      canvas.addEventListener('webglcontextlost', handleContextLost, false);
      canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    });

    // Clean up
    return () => {
      document.body.removeChild(overlay);
      window.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('webglcontextrestored', handleContextRestored);
      
      canvasElements.forEach(canvas => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      });
    };
  }, []);

  return <>{children}</>;
};

export default WebGLContextHandler;
