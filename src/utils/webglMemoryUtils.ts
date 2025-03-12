// src/utils/webglMemoryUtils.ts

/**
 * Utility class for monitoring and optimizing WebGL memory
 */
export class WebGLMemoryUtils {
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
