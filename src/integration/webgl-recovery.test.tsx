import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import ThreeScene from '../ThreeScene';
import { WebGLMemoryUtils } from '../utils/webglMemoryUtils';

describe('WebGL Context Recovery Integration', () => {
  let mockGL: any;
  let loseContextExt: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock WebGL context with context loss extension
    loseContextExt = {
      loseContext: vi.fn(),
      restoreContext: vi.fn()
    };
    
    mockGL = {
      getExtension: vi.fn((ext) => {
        if (ext === 'WEBGL_lose_context') return loseContextExt;
        if (ext === 'WEBGL_debug_renderer_info') {
          return {
            UNMASKED_VENDOR_WEBGL: 1,
            UNMASKED_RENDERER_WEBGL: 2
          };
        }
        return null;
      }),
      getParameter: vi.fn((param) => {
        if (param === 1) return 'NVIDIA Corporation';
        if (param === 2) return 'NVIDIA GeForce RTX 3060';
        return '';
      }),
      isContextLost: vi.fn().mockReturnValue(false)
    };
    
    // Mock canvas.getContext to return our mockGL
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockGL);
  });
  
  it('should handle WebGL context loss and recovery', async () => {
    const { container } = render(<ThreeScene />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    
    // Simulate context loss
    await act(async () => {
      mockGL.isContextLost.mockReturnValue(true);
      canvas?.dispatchEvent(new Event('webglcontextlost'));
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Check that the error message is shown
    const errorMessage = container.querySelector('.webgl-error');
    expect(errorMessage).toBeTruthy();
    
    // Simulate context restoration
    await act(async () => {
      mockGL.isContextLost.mockReturnValue(false);
      canvas?.dispatchEvent(new Event('webglcontextrestored'));
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Error message should be gone
    expect(container.querySelector('.webgl-error')).toBeFalsy();
  });
  
  it('should detect software rendering in headless environment', () => {
    mockGL.getParameter = vi.fn((param) => {
      if (param === 1) return 'Google Inc.';
      if (param === 2) return 'Google SwiftShader';
      return '';
    });
    
    const support = WebGLMemoryUtils.checkWebGLSupport();
    expect(support.hardwareAccelerated).toBe(false);
    expect(support.renderer).toContain('SwiftShader');
  });
  
  it('should attempt context recovery multiple times before failing', async () => {
    const { container } = render(<ThreeScene />);
    const canvas = container.querySelector('canvas');
    
    // Simulate repeated context losses
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        mockGL.isContextLost.mockReturnValue(true);
        canvas?.dispatchEvent(new Event('webglcontextlost'));
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Don't restore immediately
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
    }
    
    // Should show the "maximum attempts reached" message
    const errorMessage = container.querySelector('.webgl-error');
    expect(errorMessage?.textContent).toContain('maximum');
  });
  
  it('should clean up resources when unmounting during context loss', async () => {
    const { unmount, container } = render(<ThreeScene />);
    const canvas = container.querySelector('canvas');
    
    // Simulate context loss
    await act(async () => {
      mockGL.isContextLost.mockReturnValue(true);
      canvas?.dispatchEvent(new Event('webglcontextlost'));
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Unmount while context is lost
    unmount();
    
    // Verify cleanup occurred
    const stats = WebGLMemoryUtils.getDisposeStats();
    expect(stats.geometries + stats.materials + stats.textures).toBeGreaterThan(0);
  });
});