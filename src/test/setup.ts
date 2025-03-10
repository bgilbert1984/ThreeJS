import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

// Polyfill for ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserverPolyfill;
}

// Mocks for WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  bindBuffer: vi.fn(),
  createBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  getExtension: vi.fn(() => null),
  getParameter: vi.fn(),
  getProgramParameter: vi.fn(),
  getShaderParameter: vi.fn(),
  getUniformLocation: vi.fn(),
  activeTexture: vi.fn(),
  attachShader: vi.fn(),
  bindTexture: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(() => ({})),
  createShader: vi.fn(() => ({})),
  createTexture: vi.fn(() => ({})),
  deleteShader: vi.fn(),
  depthFunc: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  linkProgram: vi.fn(),
  shaderSource: vi.fn(),
  texParameteri: vi.fn(),
  uniform1i: vi.fn(),
  useProgram: vi.fn(),
  vertexAttribPointer: vi.fn(),
  viewport: vi.fn(),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
  return setTimeout(() => callback(performance.now()), 1);
});

global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  clearTimeout(id);
});

// Mock WebGLRenderingContext
Object.defineProperty(window, 'WebGLRenderingContext', {
  value: vi.fn(),
  writable: true
});