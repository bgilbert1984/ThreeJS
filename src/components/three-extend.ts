// src/components/three-extend.ts
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Configure OrbitControls with passive event listeners
const PassiveOrbitControls = OrbitControls;
PassiveOrbitControls.prototype.connect = function(domElement) {
  OrbitControls.prototype.connect.call(this, domElement);
  // Override wheel event listener with passive option
  domElement.removeEventListener('wheel', this.onMouseWheel);
  domElement.addEventListener('wheel', this.onMouseWheel, { passive: true });
};

// IMPORTANT: Only extend specific classes, not the entire THREE namespace
// This avoids conflicts and prevents the Canvas error
extend({
  // Controls
  OrbitControls: PassiveOrbitControls,
  
  // Post-processing
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  
  // Common geometries
  BoxGeometry: THREE.BoxGeometry,
  SphereGeometry: THREE.SphereGeometry,
  PlaneGeometry: THREE.PlaneGeometry,
  CylinderGeometry: THREE.CylinderGeometry,
  IcosahedronGeometry: THREE.IcosahedronGeometry,
  
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