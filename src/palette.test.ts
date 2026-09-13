import { describe, expect, it } from 'vitest';
import { createPaletteSettings, paletteFootprint, restorePaletteSettings, type PaletteStyle } from './palette';

describe('shared palette settings', () => {
  it('defaults to a labeled strip showing the five most dominant colors', () => {
    expect(createPaletteSettings()).toEqual({ paletteStyle: 'strip', paletteCount: 5, paletteOrder: 'frequency', paletteSize: 100, paletteGap: 100 });
    expect(createPaletteSettings('dots').paletteStyle).toBe('dots');
  });

  it('falls back to the current style when restoring malformed settings, but clamps valid numbers', () => {
    const base = createPaletteSettings('numbered');
    const restored = restorePaletteSettings({ paletteStyle: 'invented', paletteOrder: 'random', paletteCount: 1, paletteSize: 0, paletteGap: 9999 }, base);
    expect(restored).toEqual({ paletteStyle: 'numbered', paletteOrder: 'frequency', paletteCount: 3, paletteSize: 60, paletteGap: 160 });
    expect(restorePaletteSettings(null, base)).toEqual(base);
    expect(restorePaletteSettings(undefined, base)).toEqual(base);
  });

  it('accepts every valid style, order and in-range number unchanged', () => {
    const valid = { paletteStyle: 'hero' as const, paletteOrder: 'hue' as const, paletteCount: 6, paletteSize: 150, paletteGap: 70 };
    expect(restorePaletteSettings(valid, createPaletteSettings())).toEqual(valid);
  });

  it('reserves more room for a taller style, a bigger size, or more stacked ribbon bands', () => {
    const styles: PaletteStyle[] = ['strip', 'dots', 'gradient', 'ribbon', 'necklace', 'numbered', 'hero'];
    for (const paletteStyle of styles) {
      const base = { ...createPaletteSettings(paletteStyle) };
      const bigger = { ...base, paletteSize: 160 };
      expect(paletteFootprint(bigger)).toBeGreaterThanOrEqual(paletteFootprint(base));
    }
    const fewer = { ...createPaletteSettings('ribbon'), paletteCount: 3 };
    const more = { ...fewer, paletteCount: 6 };
    expect(paletteFootprint(more)).toBeGreaterThan(paletteFootprint(fewer));
  });
});
