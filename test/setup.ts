import ResizeObserver from 'resize-observer-polyfill';

// Polyfill ResizeObserver
window.ResizeObserver = ResizeObserver;

// test/setup.ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend Three.js classes *here*, before any tests run
extend(THREE);  // Extends all of Three

expect.extend(matchers);

afterEach(() => {
  cleanup();
});