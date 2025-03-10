import { describe, it, expect } from 'vitest';
import { generateColor } from './utils';

describe('Utility Functions', () => {
  describe('generateColor', () => {
    it('should generate different colors for different indices', () => {
      const color1 = generateColor(1);
      const color2 = generateColor(2);
      expect(color1).not.toEqual(color2);
    });
    
    it('should generate HSL color strings', () => {
      const color = generateColor(5);
      expect(color).toMatch(/^hsl\(\d+(\.\d+)?, 70%, 60%\)$/);
    });

    it('should distribute colors evenly using the golden angle approximation', () => {
      // Test that the hue values are distributed using the golden angle
      const colorRegexHue = /^hsl\((\d+(\.\d+)?), 70%, 60%\)$/;
      
      const color1 = generateColor(1);
      const color2 = generateColor(2);
      
      const hue1 = parseFloat(colorRegexHue.exec(color1)![1]);
      const hue2 = parseFloat(colorRegexHue.exec(color2)![1]);
      
      // The difference should be approximately 137.5 degrees (golden angle)
      const hueDiff = Math.abs(hue2 - hue1);
      expect(hueDiff).toBeCloseTo(137.5);
    });
  });
});