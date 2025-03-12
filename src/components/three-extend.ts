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

// DO NOT extend THREE itself - this is causing the conflict
// extend(THREE); - REMOVE THIS LINE

// Handle WebGL context loss
if (typeof window !== 'undefined') {
  window.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL context lost. Attempting to restore...');
    // Force a page reload after a short delay to restore context
    setTimeout(() => window.location.reload(), 1000);
  });
}

// Export extended components for type safety
export { OrbitControls, EffectComposer, RenderPass, UnrealBloomPass };