// src/RobustThreeApp.tsx
import React, { useState, useEffect } from 'react';
import LightweightScene from './components/LightweightScene';
import { WebGLMemoryUtils } from './utils/webglMemoryUtils';

const RobustThreeApp: React.FC = () => {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [hardwareAccelerated, setHardwareAccelerated] = useState<boolean | null>(null);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  
  // Check WebGL capabilities on mount
  useEffect(() => {
    // Check browser info
    const browser = {
      name: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };
    
    setBrowserInfo(`${browser.name} - Cores: ${browser.hardwareConcurrency}`);
    
    // Check WebGL support
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | null = null;
    
    try {
      // Try to create a WebGL context, cast to WebGLRenderingContext
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      setWebGLSupported(!!gl);
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
          
          // Check for software rendering
          const isSoftwareRenderer = renderer.includes('SwiftShader') || 
                                    renderer.includes('ANGLE') ||
                                    renderer.includes('llvmpipe') ||
                                    renderer.includes('Software');
                                    
          setHardwareAccelerated(!isSoftwareRenderer);
          
          // Log WebGL info for debugging
          console.log('WebGL Renderer:', renderer);
          WebGLMemoryUtils.logWebGLInfo(canvas);
        } else {
          setHardwareAccelerated(null);
        }
      }
    } catch (e) {
      console.error('Error checking WebGL support:', e);
      setWebGLSupported(false);
    } finally { 
      // Clean up
      if (gl && gl.getExtension) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    }
    
    // Set up memory monitoring
    const checkMemory = () => {
      if (window.performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        console.log(`Memory: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
      }
    };
    
    const memoryInterval = setInterval(checkMemory, 10000);
    
    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
  
  // Render appropriate content based on WebGL support
  if (webGLSupported === false) {
    return (
      <div className="webgl-not-supported" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#121220',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '16px' }}>WebGL Not Supported</h2>
        <p style={{ maxWidth: '500px', marginBottom: '20px' }}>
          Your browser or device doesn't support WebGL, which is required for this 3D application.
        </p>
        <div style={{ maxWidth: '500px', textAlign: 'left', marginTop: '20px' }}>
          <h3>Troubleshooting:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Try using an updated version of Chrome, Firefox, or Edge</li>
            <li>Make sure your graphics drivers are up to date</li>
            <li>Try disabling hardware acceleration in your browser settings</li>
            <li>If on mobile, try a desktop browser</li>
          </ul>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
          Browser info: {browserInfo}
        </p>
      </div>
    );
  }
  
  if (hardwareAccelerated === false) {
    return (
      <div className="software-rendering-warning" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#332211',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Performance Warning</h2>
        <p style={{ maxWidth: '500px', marginBottom: '20px' }}>
          Your browser is using software rendering for WebGL, which may result in poor performance.
        </p>
        <button 
          onClick={() => setHardwareAccelerated(null)} // Proceed anyway
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a4acf',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Continue Anyway
        </button>
        <div style={{ maxWidth: '500px', textAlign: 'left' }}>
          <h3>Recommendations:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Update your graphics drivers</li>
            <li>Try a different browser</li>
            <li>Check if hardware acceleration is enabled in your browser settings</li>
          </ul>
        </div>
      </div>
    );
  }
  
  // Render the main application with the lightweight scene
  return (
    <div className="three-app-container" style={{ width: '100%', height: '100vh' }}>
      <LightweightScene />
    </div>
  );
};

export default RobustThreeApp;
