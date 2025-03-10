import ResizeObserver from 'resize-observer-polyfill';

// Polyfill ResizeObserver
window.ResizeObserver = ResizeObserver;

import { extend } from '@react-three/fiber';
import {
  Mesh,
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  MeshBasicMaterial
} from 'three';

extend({ Mesh, Points, PointsMaterial, BufferGeometry, Float32BufferAttribute, MeshStandardMaterial, MeshBasicMaterial });