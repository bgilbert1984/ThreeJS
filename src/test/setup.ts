import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

// Polyfill for ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserverPolyfill;
}

// Enhanced WebGL context mocking
const createWebGLContext = () => ({
  bindBuffer: vi.fn(),
  createBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  getExtension: vi.fn((extension) => {
    if (extension === 'WEBGL_debug_renderer_info') {
      return {
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      };
    }
    if (extension === 'WEBGL_lose_context') {
      return {
        loseContext: vi.fn(),
        restoreContext: vi.fn()
      };
    }
    return null;
  }),
  getParameter: vi.fn((param) => {
    const parameterMap: { [key: number]: any } = {
      0x9245: 'Test Vendor',  // UNMASKED_VENDOR_WEBGL
      0x9246: 'Test Renderer', // UNMASKED_RENDERER_WEBGL
      0x1F02: 'WebGL 2.0',    // VERSION
      0x0D33: 4096,           // MAX_TEXTURE_SIZE
      0x8869: 4,              // MAX_VERTEX_TEXTURE_IMAGE_UNITS
    };
    return parameterMap[param] || null;
  }),
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
  isContextLost: vi.fn(() => false),
});

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return createWebGLContext();
  }
  return null;
});

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    jsHeapSizeLimit: 2172649472,
    totalJSHeapSize: 1000000000,
    usedJSHeapSize: 500000000
  },
  writable: true,
  configurable: true
});

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

Object.defineProperty(window, 'WebGL2RenderingContext', {
  value: vi.fn(),
  writable: true
});

// Mock window.gc for memory tests
Object.defineProperty(window, 'gc', {
  value: vi.fn(),
  writable: true
});

// Add screen object for device pixel ratio tests
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080
  },
  writable: true
});

// Mock matchMedia for responsive tests
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));