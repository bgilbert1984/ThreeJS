import * as THREE from 'three';

interface WebGLMemoryStats {
  geometries: number;
  textures: number;
  programs: number;
  totalMemoryMB?: number;
  disposedCount: number;
}

/**
 * Utility class for managing WebGL memory and context
 */
export class WebGLMemoryUtils {
  private static disposedCount = 0;
  private static lastDisposedCount = 0;
  private static memoryStats: WebGLMemoryStats = {
    geometries: 0,
    textures: 0,
    programs: 0,
    disposedCount: 0
  };

  /**
   * Check if WebGL is available and hardware accelerated
   */
  public static checkWebGLSupport(): {
    supported: boolean;
    hardwareAccelerated: boolean;
    renderer: string;
    vendor: string;
    version: string;
  } {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return {
        supported: false,
        hardwareAccelerated: false,
        renderer: 'None',
        vendor: 'None',
        version: 'None'
      };
    }

    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      let renderer = 'Unknown';
      let vendor = 'Unknown';

      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }

      // Check for software rendering
      const isSoftwareRenderer = 
        renderer.includes('SwiftShader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('Software') ||
        renderer.includes('Mesa') ||
        vendor.includes('Google SwiftShader') ||
        (renderer.includes('ANGLE') && !renderer.includes('Direct3D')) ||
        vendor.includes('Microsoft Basic Render');

      return {
        supported: true,
        hardwareAccelerated: !isSoftwareRenderer,
        renderer,
        vendor,
        version: gl.getParameter(gl.VERSION)
      };
    } catch (e) {
      console.error('Error checking WebGL support:', e);
      return {
        supported: true,
        hardwareAccelerated: false,
        renderer: 'Error',
        vendor: 'Error',
        version: 'Error'
      };
    } finally {
      // Clean up
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  }

  /**
   * Log WebGL information for a canvas
   */
  public static logWebGLInfo(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      console.log('WebGL Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      console.log('WebGL Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }

    console.log('WebGL Version:', gl.getParameter(gl.VERSION));
    console.log('Max Texture Size:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    
    // Log memory info if available
    if ((performance as any).memory) {
      console.log('JS Heap Size:', ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2), 'MB');
    }
  }

  /**
   * Force garbage collection of Three.js objects
   */
  public static forceGarbageCollection(): void {
    if (!THREE) return;

    const startStats = this.getWebGLResourceCount();
    
    // Clear Three.js caches
    THREE.Cache.clear();
    
    // Reset tracking
    this.lastDisposedCount = this.disposedCount;
    this.disposedCount = 0;

    // Update memory stats
    const endStats = this.getWebGLResourceCount();
    this.memoryStats = {
      geometries: endStats.geometries,
      textures: endStats.textures,
      programs: endStats.programs,
      totalMemoryMB: (performance as any).memory?.usedJSHeapSize / 1048576,
      disposedCount: startStats.total - endStats.total
    };
  }

  /**
   * Get stats about disposed resources
   */
  public static getDisposeStats(): WebGLMemoryStats {
    return this.memoryStats;
  }

  /**
   * Get counts of current WebGL resources
   */
  private static getWebGLResourceCount() {
    if (!(THREE as any).WebGLRenderer) return { geometries: 0, textures: 0, programs: 0, total: 0 };

    const geometries = (THREE as any)._geometries?.length || 0;
    const textures = (THREE as any)._textures?.length || 0;
    const programs = (THREE as any)._programs?.length || 0;

    return {
      geometries,
      textures, 
      programs,
      total: geometries + textures + programs
    };
  }

  /**
   * Check for performance issues that might indicate WebGL problems
   */
  public static checkPerformanceIssues(): {
    hasIssues: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    let hasIssues = false;

    // Check if using software rendering
    const { hardwareAccelerated, renderer } = this.checkWebGLSupport();
    if (!hardwareAccelerated) {
      issues.push('Using software rendering - hardware acceleration may be disabled');
      hasIssues = true;
    }

    // Check available memory
    if ((performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit;
      if (memoryUsage > 0.8) {
        issues.push('High memory usage detected');
        hasIssues = true;
      }
    }

    // Check for high resource counts
    const resources = this.getWebGLResourceCount();
    if (resources.geometries > 1000 || resources.textures > 100) {
      issues.push('High number of WebGL resources detected');
      hasIssues = true;
    }

    return { hasIssues, issues };
  }

  private static disposedGeometries = 0;
  private static disposedMaterials = 0;
  private static disposedTextures = 0;
  
  /**
   * Dispose of a Three.js object and all its children recursively
   */
  static disposeObject(object: any): void {
    if (!object) return;
    
    // Handle dispose for the object itself
    if (object.dispose && typeof object.dispose === 'function') {
      object.dispose();
      
      // Track disposed resources by type
      if (object.isBufferGeometry || object.isGeometry) {
        this.disposedGeometries++;
      } else if (object.isMaterial) {
        this.disposedMaterials++;
      } else if (object.isTexture) {
        this.disposedTextures++;
      }
    }
    
    // Handle special case for mesh objects
    if (object.geometry && object.geometry.dispose && typeof object.geometry.dispose === 'function') {
      object.geometry.dispose();
      this.disposedGeometries++;
    }
    
    // Handle materials
    if (object.material) {
      if (Array.isArray(object.material)) {
        // Handle multi-materials
        object.material.forEach((material: any) => {
          if (material.dispose && typeof material.dispose === 'function') {
            this.disposeMaterial(material);
          }
        });
      } else if (object.material.dispose && typeof object.material.dispose === 'function') {
        // Handle single material
        this.disposeMaterial(object.material);
      }
    }
    
    // Recursively process children
    if (object.children && object.children.length > 0) {
      // Create a copy of the children array as it might be modified during iteration
      const childrenCopy = [...object.children];
      for (let i = 0; i < childrenCopy.length; i++) {
        this.disposeObject(childrenCopy[i]);
      }
      
      // Clear the children array
      object.children.length = 0;
    }
  }
  
  /**
   * Dispose a material and its textures
   */
  private static disposeMaterial(material: any): void {
    if (!material) return;
    
    // Dispose textures
    const textureProperties = [
      'map', 'lightMap', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap',
      'emissiveMap', 'metalnessMap', 'roughnessMap', 'alphaMap', 'aoMap', 'envMap'
    ];
    
    textureProperties.forEach(propName => {
      if (material[propName]) {
        const texture = material[propName];
        if (texture && texture.dispose && typeof texture.dispose === 'function') {
          texture.dispose();
          this.disposedTextures++;
        }
        material[propName] = null;
      }
    });
    
    // Dispose material itself
    material.dispose();
    this.disposedMaterials++;
  }
  
  /**
   * Force a browser garbage collection if the browser supports it
   * Note: This is not guaranteed to work in all browsers
   */
  static forceGarbageCollection(): void {
    if (window.gc) {
      try {
        window.gc();
        console.log('Forced garbage collection');
      } catch (e) {
        console.warn('Failed to force garbage collection:', e);
      }
    }
  }
  
  /**
   * Get stats about disposed resources
   */
  static getDisposeStats(): { geometries: number; materials: number; textures: number } {
    return {
      geometries: this.disposedGeometries,
      materials: this.disposedMaterials,
      textures: this.disposedTextures
    };
  }
  
  /**
   * Log WebGL context information
   */
  static logWebGLInfo(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL context not available');
      return;
    }
    
    console.log('WebGL Version:', gl.getParameter(gl.VERSION));
    console.log('WebGL Vendor:', gl.getParameter(gl.VENDOR));
    console.log('WebGL Renderer:', gl.getParameter(gl.RENDERER));
    
    // Try to get detailed renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      console.log('Unmasked Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      console.log('Unmasked Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
    
    // Log memory info if available (Chrome only)
    if (gl.getExtension('WEBGL_debug_shaders')) {
      console.log('WEBGL_debug_shaders extension available');
    }
    
    // Log WebGL capabilities
    console.log('Max Texture Size:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log('Max Viewport Dimensions:', gl.getParameter(gl.MAX_VIEWPORT_DIMS));
    console.log('Max Vertex Attributes:', gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
  }
  
  /**
   * Reset WebGL context to try to recover from context loss
   */
  static resetWebGLContext(canvas: HTMLCanvasElement): boolean {
    // Attempt to get a fresh context
    const gl = canvas.getContext('webgl2', { powerPreference: 'default' }) || 
              canvas.getContext('webgl', { powerPreference: 'default' });
              
    if (gl) {
      // Clear all state
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.STENCIL_TEST);
      gl.disable(gl.SCISSOR_TEST);
      gl.disable(gl.DITHER);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
      gl.disable(gl.SAMPLE_COVERAGE);
      
      // Clear buffers
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
      
      // Reset viewport
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      return true;
    }
    
    return false;
  }
}
