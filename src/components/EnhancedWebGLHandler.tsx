// src/components/EnhancedWebGLHandler.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface EnhancedWebGLHandlerProps {
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
  maxRecoveryAttempts?: number;
  recoveryDelay?: number;
}

/**
 * Enhanced WebGL context handler with progressive fallback and monitoring
 */
const EnhancedWebGLHandler: React.FC<EnhancedWebGLHandlerProps> = ({
  children,
  fallbackContent,
  maxRecoveryAttempts = 3,
  recoveryDelay = 1500
}) => {
  const [contextLost, setContextLost] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const recoveryTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Default fallback content
  const defaultFallback = (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      background: '#121220',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '16px' }}>WebGL Context Lost</h2>
      <p style={{ maxWidth: '500px', marginBottom: '20px' }}>
        Your browser's 3D rendering context was lost. This can happen due to 
        system resource constraints or graphics driver issues.
      </p>
      
      {recoveryFailed ? (
        <>
          <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>
            Automatic recovery failed after {maxRecoveryAttempts} attempts.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a4acf',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </>
      ) : (
        <>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255,255,255,0.3)', 
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p>
            Attempting to recover ({recoveryAttempts}/{maxRecoveryAttempts})...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </div>
  );

  // Monitor WebGL memory usage and health
  useEffect(() => {
    const checkWebGLHealth = () => {
      const gl = canvasRef.current?.getContext('webgl2') || 
                canvasRef.current?.getContext('webgl');
                
      if (gl) {
        // Check for WebGL memory usage where available (Chrome/Firefox)
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log(`WebGL: ${vendor} - ${renderer}`);
        }
        
        // Check if context is lost
        if (gl.isContextLost()) {
          console.warn('WebGL context is already lost!');
          handleContextLoss();
        }
      }
    };
    
    // Run health check periodically
    const healthInterval = setInterval(checkWebGLHealth, 10000);
    
    return () => {
      clearInterval(healthInterval);
    };
  }, []);

  const handleContextLoss = () => {
    console.warn('WebGL context lost - attempting recovery');
    setContextLost(true);
    
    // Start recovery process
    if (recoveryAttempts < maxRecoveryAttempts) {
      setRecoveryAttempts(prev => prev + 1);
      
      // Clear any existing recovery timer
      if (recoveryTimerRef.current !== null) {
        window.clearTimeout(recoveryTimerRef.current);
      }
      
      // Set a new recovery timer
      recoveryTimerRef.current = window.setTimeout(() => {
        attemptRecovery();
      }, recoveryDelay);
    } else {
      setRecoveryFailed(true);
      console.error('Maximum WebGL recovery attempts reached');
    }
  };
  
  const attemptRecovery = () => {
    // Try to force a fresh context
    if (canvasRef.current) {
      // Create a new canvas to replace the old one
      const oldCanvas = canvasRef.current;
      const parent = oldCanvas.parentElement;
      
      if (parent) {
        // Remove the old canvas
        parent.removeChild(oldCanvas);
        
        // Force garbage collection where possible
        if (window.gc) {
          window.gc();
        }
        
        // Create a new canvas with the same attributes
        const newCanvas = document.createElement('canvas');
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        newCanvas.style.cssText = oldCanvas.style.cssText;
        
        // Replace the old canvas
        parent.appendChild(newCanvas);
        canvasRef.current = newCanvas;
        
        // Check if recovery was successful
        const gl = newCanvas.getContext('webgl2') || newCanvas.getContext('webgl');
        if (gl && !gl.isContextLost()) {
          handleContextRestored();
        } else if (recoveryAttempts < maxRecoveryAttempts) {
          // Try again with increasing delay
          recoveryTimerRef.current = window.setTimeout(() => {
            setRecoveryAttempts(prev => prev + 1);
            attemptRecovery();
          }, recoveryDelay * (recoveryAttempts + 1));
        } else {
          setRecoveryFailed(true);
        }
      }
    }
  };
  
  const handleContextRestored = () => {
    console.log('WebGL context restored successfully');
    setContextLost(false);
    setRecoveryAttempts(0);
    
    // Clear any pending recovery attempts
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  };
  
  // Custom Canvas component with context handlers
  const SafeCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const handleCanvasRef = (canvas: HTMLCanvasElement) => {
      canvasRef.current = canvas;
    };
    
    return (
      <Canvas
        onCreated={({ gl }) => {
          // Store the canvas element reference when created
          canvasRef.current = gl.domElement;
          
          // Set conservative WebGL parameters
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          gl.setClearColor(new THREE.Color('#000000'));
          
          // Set memory management options
          gl.info.autoReset = true;
          
          // Enable context loss handling
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            handleContextLoss();
          }, false);
          
          gl.domElement.addEventListener('webglcontextrestored', () => {
            handleContextRestored();
          }, false);
        }}
        gl={{
          antialias: false, // Set to false for better performance
          alpha: false,     // Set to false for better performance
          depth: true,
          stencil: false,   // Set to false if not needed
          powerPreference: 'default', // Use default for better compatibility
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false // Don't fail on low performance devices
        }}
      >
        {children}
      </Canvas>
    );
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimerRef.current !== null) {
        window.clearTimeout(recoveryTimerRef.current);
      }
    };
  }, []);
  
  // Render appropriate content based on context state
  if (contextLost) {
    return fallbackContent || defaultFallback;
  }
  
  return <SafeCanvas>{children}</SafeCanvas>;
};

export default EnhancedWebGLHandler;
