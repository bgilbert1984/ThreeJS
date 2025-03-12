// src/components/three-extend.ts
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Extend Three.js with postprocessing and controls
extend({ 
  OrbitControls,
  EffectComposer,
  RenderPass,
  UnrealBloomPass
});

// DO NOT extend THREE itself - this was causing the conflict
// Instead, extend specific classes you need
extend({
  // Common geometries
  BoxGeometry: THREE.BoxGeometry,
  SphereGeometry: THREE.SphereGeometry,
  PlaneGeometry: THREE.PlaneGeometry,
  CylinderGeometry: THREE.CylinderGeometry,
  
  // Materials
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  MeshPhongMaterial: THREE.MeshPhongMaterial,
  PointsMaterial: THREE.PointsMaterial,
  LineBasicMaterial: THREE.LineBasicMaterial,
  
  // Lights
  AmbientLight: THREE.AmbientLight,
  PointLight: THREE.PointLight,
  DirectionalLight: THREE.DirectionalLight,
  SpotLight: THREE.SpotLight,
  
  // Core objects
  BufferGeometry: THREE.BufferGeometry,
  Mesh: THREE.Mesh,
  Points: THREE.Points,
  Line: THREE.Line,
  Group: THREE.Group,
  Color: THREE.Color
});

// Set up global context loss handler
if (typeof window !== 'undefined') {
  window.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); // Prevent default - critical for recovery
    console.warn('WebGL context lost. Attempting to restore...');
    
    // Show a user-friendly message
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.color = 'white';
    overlay.style.padding = '20px';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.innerHTML = `
      <h3>WebGL Context Lost</h3>
      <p>The 3D rendering context was lost. Attempting to recover...</p>
      <p>The page will reload shortly.</p>
    `;
    document.body.appendChild(overlay);
    
    // Force a page reload after a short delay to restore context
    setTimeout(() => window.location.reload(), 2000);
  });
  
  window.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored successfully');
    // Remove any error overlays
    const overlay = document.querySelector('div[style*="webgl"]');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  });
}

// Export extended components for type safety
export { OrbitControls, EffectComposer, RenderPass, UnrealBloomPass };