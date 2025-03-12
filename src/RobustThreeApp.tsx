// src/RobustThreeApp.tsx
import React, { useState, useEffect } from 'react';
import LightweightScene from './components/LightweightScene';
import { WebGLMemoryUtils } from './utils/webglMemoryUtils';

const RobustThreeApp: React.FC = () => {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [hardwareAccelerated, setHardwareAccelerated] = useState<boolean | null>(null);
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [webGLInfo, setWebGLInfo] = useState<{
    version: string;
    vendor: string;
    renderer: string;
    maxTextureSize: number;
    extensions: string[];
  } | null>(null);
  
  // Enhanced WebGL capabilities check
  useEffect(() => {
    // Check browser info
    const browser = {
      name: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };
    
    setBrowserInfo(`${browser.name} - Cores: ${browser.hardwareConcurrency}`);
    
    // Thorough WebGL support check
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let webgl2Supported = false;
    
    try {
      // Try WebGL 2 first
      gl = canvas.getContext('webgl2');
      if (gl) {
        webgl2Supported = true;
      } else {
        // Fall back to WebGL 1 with explicit type casting
        gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      }

      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let renderer = 'Unknown';
        let vendor = 'Unknown';

        if (debugInfo) {
          renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          
          // More detailed software rendering detection
          const isSoftwareRenderer = 
            renderer.includes('SwiftShader') || 
            renderer.includes('ANGLE') ||
            renderer.includes('llvmpipe') ||
            renderer.includes('Software') ||
            renderer.includes('Mesa') ||
            vendor.includes('Google SwiftShader') ||
            vendor.includes('Microsoft Basic Render');
                                    
          setHardwareAccelerated(!isSoftwareRenderer);
        } else {
          setHardwareAccelerated(null);
        }

        // Gather detailed WebGL information
        const extensions = gl.getSupportedExtensions() || [];
        const glInfo = {
          version: webgl2Supported ? 'WebGL 2.0' : 'WebGL 1.0',
          vendor: vendor,
          renderer: renderer,
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          extensions: extensions
        };
        setWebGLInfo(glInfo);

        // Perform capability tests
        const isCapable = checkWebGLCapabilities(gl);
        setWebGLSupported(isCapable);

        // Log WebGL info for debugging
        console.log('WebGL Info:', glInfo);
        WebGLMemoryUtils.logWebGLInfo(canvas);

      } else {
        setWebGLSupported(false);
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

  // Helper function to check WebGL capabilities
  const checkWebGLCapabilities = (gl: WebGLRenderingContext | WebGL2RenderingContext): boolean => {
    try {
      // Check for essential extensions and capabilities
      const isWebGL2 = gl instanceof WebGL2RenderingContext;
      
      if (!isWebGL2) {
        // For WebGL 1.0, we need these as extensions
        const requiredExtensions = [
          'OES_texture_float',
          'WEBGL_depth_texture'
        ];

        const missingExtensions = requiredExtensions.filter(ext => 
          !gl.getExtension(ext)
        );

        if (missingExtensions.length > 0) {
          console.warn('Missing required WebGL extensions:', missingExtensions);
          return false;
        }
      }
      // In WebGL 2.0, float textures and depth textures are core features

      // Check minimum texture size support
      const minRequiredTextureSize = 2048;
      if (gl.getParameter(gl.MAX_TEXTURE_SIZE) < minRequiredTextureSize) {
        console.warn('Insufficient max texture size support');
        return false;
      }

      // Check vertex texture support
      const vertexTextureUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
      if (vertexTextureUnits === 0) {
        console.warn('No vertex texture support');
        return false;
      }

      // Test actual rendering capability
      try {
        const testTexture = gl.createTexture();
        const testFramebuffer = gl.createFramebuffer();
        
        if (!testTexture || !testFramebuffer) {
          console.warn('Failed to create test texture or framebuffer');
          return false;
        }

        // Additional WebGL 2.0 specific checks
        if (isWebGL2) {
          // Verify float texture support is working
          gl.bindTexture(gl.TEXTURE_2D, testTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
          
          // Check if the format is supported
          gl.bindFramebuffer(gl.FRAMEBUFFER, testFramebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, testTexture, 0);
          
          const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
          if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.warn('Float texture rendering not supported');
            return false;
          }
        }

        // Cleanup
        gl.deleteTexture(testTexture);
        gl.deleteFramebuffer(testFramebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return true;
      } catch (e) {
        console.error('Error testing WebGL capabilities:', e);
        return false;
      }

    } catch (error) {
      console.error('Error checking WebGL capabilities:', error);
      return false;
    }
  };

  // Render not supported message with more detailed information
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
        <h2 style={{ marginBottom: '16px' }}>WebGL Support Issue Detected</h2>
        <p style={{ maxWidth: '500px', marginBottom: '20px' }}>
          {webGLInfo ? 
            `Your system's WebGL capabilities don't meet the minimum requirements for this application.` :
            `Your browser or device doesn't have WebGL enabled or supported.`
          }
        </p>
        
        {webGLInfo && (
          <div style={{ maxWidth: '500px', marginBottom: '20px', textAlign: 'left' }}>
            <h3>Detected Configuration:</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Version: {webGLInfo.version}</li>
              <li>Renderer: {webGLInfo.renderer}</li>
              <li>Vendor: {webGLInfo.vendor}</li>
              <li>Max Texture Size: {webGLInfo.maxTextureSize}</li>
            </ul>
          </div>
        )}

        <div style={{ maxWidth: '500px', textAlign: 'left', marginTop: '20px' }}>
          <h3>Troubleshooting Steps:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Enable hardware acceleration in your browser settings</li>
            <li>Update your graphics drivers to the latest version</li>
            <li>Try using an updated version of Chrome, Firefox, or Edge</li>
            <li>If using a laptop, ensure it's not in power-saving mode</li>
            <li>Check if WebGL is enabled in your browser flags</li>
            {hardwareAccelerated === false && (
              <li style={{color: '#ff6b6b'}}>
                Software rendering detected - hardware acceleration may be disabled
              </li>
            )}
          </ul>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
          <p>Browser info: {browserInfo}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Detection
          </button>
        </div>
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
