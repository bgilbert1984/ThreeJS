import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebGLMemoryUtils } from './webglMemoryUtils';

describe('WebGLMemoryUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkWebGLSupport', () => {
    it('detects software rendering when using SwiftShader', () => {
      const mockGL = {
        getExtension: vi.fn().mockReturnValue({
          UNMASKED_VENDOR_WEBGL: 1,
          UNMASKED_RENDERER_WEBGL: 2
        }),
        getParameter: vi.fn().mockImplementation((param) => {
          if (param === 1) return 'Google Inc.';
          if (param === 2) return 'Google SwiftShader';
          return '';
        })
      };

      // Mock canvas.getContext to return our mock GL context
      const mockGetContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(mockGL as any);

      const result = WebGLMemoryUtils.checkWebGLSupport();
      expect(result.hardwareAccelerated).toBe(false);
      expect(result.supported).toBe(true);
      expect(result.renderer).toBe('Google SwiftShader');
    });

    it('detects hardware acceleration with proper GPU', () => {
      const mockGL = {
        getExtension: vi.fn().mockReturnValue({
          UNMASKED_VENDOR_WEBGL: 1,
          UNMASKED_RENDERER_WEBGL: 2
        }),
        getParameter: vi.fn().mockImplementation((param) => {
          if (param === 1) return 'NVIDIA Corporation';
          if (param === 2) return 'NVIDIA GeForce RTX 3060';
          return '';
        })
      };

      const mockGetContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(mockGL as any);

      const result = WebGLMemoryUtils.checkWebGLSupport();
      expect(result.hardwareAccelerated).toBe(true);
      expect(result.supported).toBe(true);
      expect(result.renderer).toBe('NVIDIA GeForce RTX 3060');
    });
  });

  describe('checkPerformanceIssues', () => {
    it('detects high memory usage', () => {
      // Mock performance.memory
      Object.defineProperty(performance, 'memory', {
        value: {
          jsHeapSizeLimit: 1000000000,
          usedJSHeapSize: 900000000 // 90% usage
        },
        configurable: true
      });

      const result = WebGLMemoryUtils.checkPerformanceIssues();
      expect(result.hasIssues).toBe(true);
      expect(result.issues).toContain('High memory usage detected');
    });
  });

  describe('disposeObject', () => {
    it('properly disposes Three.js objects and tracks disposals', () => {
      const mockGeometry = {
        isBufferGeometry: true,
        dispose: vi.fn()
      };

      const mockMaterial = {
        isMaterial: true,
        dispose: vi.fn(),
        map: {
          isTexture: true,
          dispose: vi.fn()
        }
      };

      const mockObject = {
        geometry: mockGeometry,
        material: mockMaterial,
        children: []
      };

      WebGLMemoryUtils.disposeObject(mockObject);

      expect(mockGeometry.dispose).toHaveBeenCalled();
      expect(mockMaterial.dispose).toHaveBeenCalled();
      expect(mockMaterial.map.dispose).toHaveBeenCalled();

      const stats = WebGLMemoryUtils.getDisposeStats();
      expect(stats.geometries).toBeGreaterThan(0);
      expect(stats.materials).toBeGreaterThan(0);
      expect(stats.textures).toBeGreaterThan(0);
    });
  });

  describe('resetWebGLContext', () => {
    it('attempts to reset WebGL context with proper parameters', () => {
      const mockGL = {
        disable: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn()
      };

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockGL),
        width: 800,
        height: 600
      };

      const result = WebGLMemoryUtils.resetWebGLContext(mockCanvas as any);
      
      expect(result).toBe(true);
      expect(mockGL.disable).toHaveBeenCalled();
      expect(mockGL.clear).toHaveBeenCalled();
      expect(mockGL.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });
});