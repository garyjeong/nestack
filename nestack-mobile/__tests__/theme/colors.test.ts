/**
 * Theme Colors Test Suite
 * Tests for the 5-theme color system (Ocean, Forest, Sunset, Berry, Night)
 */

import { themePalettes, colors, categoryColors, DEFAULT_THEME, type ThemeName } from '../../src/shared/theme/colors';

describe('Theme Palettes', () => {
  const themeNames: ThemeName[] = ['ocean', 'forest', 'sunset', 'berry', 'night'];

  it('should have all 5 theme palettes defined', () => {
    expect(Object.keys(themePalettes)).toHaveLength(5);
    themeNames.forEach((name) => {
      expect(themePalettes[name]).toBeDefined();
    });
  });

  it.each(themeNames)('should have required colors for %s theme', (themeName) => {
    const palette = themePalettes[themeName];
    expect(palette.primary).toBeDefined();
    expect(palette.secondary).toBeDefined();
    expect(palette.gradient).toBeDefined();
    expect(palette.gradient).toHaveLength(2);
  });

  it('should have valid hex color codes', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    themeNames.forEach((themeName) => {
      const palette = themePalettes[themeName];
      expect(palette.primary).toMatch(hexPattern);
      expect(palette.secondary).toMatch(hexPattern);
      palette.gradient.forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe('Ocean theme', () => {
    it('should have blue primary color', () => {
      expect(themePalettes.ocean.primary).toBe('#0066FF');
    });

    it('should have teal secondary color', () => {
      expect(themePalettes.ocean.secondary).toBe('#00D4AA');
    });
  });

  describe('Forest theme', () => {
    it('should have green primary color', () => {
      expect(themePalettes.forest.primary).toBe('#10B981');
    });
  });

  describe('Sunset theme', () => {
    it('should have orange primary color', () => {
      expect(themePalettes.sunset.primary).toBe('#F97316');
    });
  });

  describe('Berry theme', () => {
    it('should have purple primary color', () => {
      expect(themePalettes.berry.primary).toBe('#8B5CF6');
    });
  });

  describe('Night theme', () => {
    it('should have indigo primary color', () => {
      expect(themePalettes.night.primary).toBe('#6366F1');
    });
  });
});

describe('Base Colors', () => {
  it('should have stone palette', () => {
    expect(colors.stone).toBeDefined();
    expect(colors.stone[50]).toBe('#FAFAF9');
    expect(colors.stone[900]).toBe('#1C1917');
  });

  it('should have dark mode colors', () => {
    expect(colors.dark.background).toBe('#121212');
    expect(colors.dark.card).toBe('#1E1E1E');
  });

  it('should have semantic colors', () => {
    expect(colors.success.light).toBeDefined();
    expect(colors.warning.light).toBeDefined();
    expect(colors.error.light).toBeDefined();
    expect(colors.info.light).toBeDefined();
  });

  it('should have base colors', () => {
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.black).toBe('#000000');
    expect(colors.transparent).toBe('transparent');
  });
});

describe('Category Colors', () => {
  const categories = ['food', 'transport', 'shopping', 'entertainment', 'health', 'education', 'housing', 'savings', 'income', 'other'];

  it.each(categories)('should have colors for %s category', (category) => {
    const categoryKey = category as keyof typeof categoryColors;
    expect(categoryColors[categoryKey]).toBeDefined();
    expect(categoryColors[categoryKey].bg).toBeDefined();
    expect(categoryColors[categoryKey].icon).toBeDefined();
  });

  it('should have valid hex color codes for categories', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    Object.values(categoryColors).forEach((cat) => {
      expect(cat.bg).toMatch(hexPattern);
      expect(cat.icon).toMatch(hexPattern);
    });
  });
});

describe('Default Theme', () => {
  it('should be ocean', () => {
    expect(DEFAULT_THEME).toBe('ocean');
  });

  it('should be a valid theme name', () => {
    expect(themePalettes[DEFAULT_THEME]).toBeDefined();
  });
});
