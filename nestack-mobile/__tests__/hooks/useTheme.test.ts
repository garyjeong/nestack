/**
 * useTheme Hook Test Suite
 * Tests for theme management functionality
 */

import { themePalettes, colors, DEFAULT_THEME } from '../../src/shared/theme/colors';

describe('Theme System', () => {
  describe('Theme Palette Access', () => {
    it('should return correct palette for ocean theme', () => {
      const palette = themePalettes['ocean'];
      expect(palette.primary).toBe('#0066FF');
      expect(palette.secondary).toBe('#00D4AA');
    });

    it('should return correct palette for forest theme', () => {
      const palette = themePalettes['forest'];
      expect(palette.primary).toBe('#10B981');
      expect(palette.secondary).toBe('#34D399');
    });

    it('should return correct palette for sunset theme', () => {
      const palette = themePalettes['sunset'];
      expect(palette.primary).toBe('#F97316');
      expect(palette.secondary).toBe('#FBBF24');
    });

    it('should return correct palette for berry theme', () => {
      const palette = themePalettes['berry'];
      expect(palette.primary).toBe('#8B5CF6');
      expect(palette.secondary).toBe('#EC4899');
    });

    it('should return correct palette for night theme', () => {
      const palette = themePalettes['night'];
      expect(palette.primary).toBe('#6366F1');
      expect(palette.secondary).toBe('#818CF8');
    });

    it('should return correct gradient colors', () => {
      const palette = themePalettes['ocean'];
      expect(palette.gradient).toEqual(['#0066FF', '#00D4AA']);
    });
  });

  describe('Color Mode Colors', () => {
    it('should have correct light mode stone colors', () => {
      expect(colors.stone[50]).toBe('#FAFAF9');
      expect(colors.stone[900]).toBe('#1C1917');
    });

    it('should have correct dark mode background', () => {
      expect(colors.dark.background).toBe('#121212');
      expect(colors.dark.card).toBe('#1E1E1E');
    });

    it('should have different colors for light and dark modes', () => {
      expect(colors.stone[50]).not.toBe(colors.dark.background);
    });
  });

  describe('Semantic Colors', () => {
    it('should have success colors', () => {
      expect(colors.success.light).toBe('#10B981');
      expect(colors.success.dark).toBe('#34D399');
    });

    it('should have warning colors', () => {
      expect(colors.warning.light).toBe('#F59E0B');
      expect(colors.warning.dark).toBe('#FBBF24');
    });

    it('should have error colors', () => {
      expect(colors.error.light).toBe('#EF4444');
      expect(colors.error.dark).toBe('#F87171');
    });

    it('should have info colors', () => {
      expect(colors.info.light).toBe('#3B82F6');
      expect(colors.info.dark).toBe('#60A5FA');
    });
  });

  describe('Default Theme', () => {
    it('should have ocean as default theme', () => {
      expect(DEFAULT_THEME).toBe('ocean');
    });
  });
});
