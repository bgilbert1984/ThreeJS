import * as THREE from 'three';

class WebGLMemoryUtils {
  private static disposeCount = 0;

  static forceGarbageCollection() {
    // Find all textures and materials in the scene
    THREE.Object3D.prototype.traverse.call(THREE.Cache, (object: any) => {
      if (object.isMaterial) {
        this.cleanupMaterial(object);
      } else if (object.isTexture) {
        object.dispose();
        this.disposeCount++;
      }
    });

    // Clear the download cache
    THREE.Cache.clear();
  }

  private static cleanupMaterial(material: THREE.Material) {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    material.dispose();
    this.disposeCount++;
  }

  static getDisposeStats() {
    const stats = {
      disposedCount: this.disposeCount,
      geometryCount: (THREE as any)._geometries?.length || 0,
      textureCount: (THREE as any)._textures?.length || 0
    };
    this.disposeCount = 0; // Reset counter
    return stats;
  }
}

export default WebGLMemoryUtils;