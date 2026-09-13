// Palette display settings shared by Music Player and Polaroid (see coverFonts/coverFontLabels
// in albumCover.ts for the analogous pattern used for fonts). Which colors are shown and how
// they're ordered lives in model.ts (selectPaletteColors) since that needs the Draft's extracted
// palette; this file only owns the decorative display settings and their footprint on layout.
export type PaletteStyle = 'strip' | 'dots' | 'gradient' | 'ribbon' | 'necklace' | 'numbered' | 'hero';
export type PaletteOrder = 'frequency' | 'luminance' | 'hue';
export type PaletteSettings = {
  paletteStyle: PaletteStyle;
  paletteCount: number;
  paletteOrder: PaletteOrder;
  paletteSize: number;
  paletteGap: number;
};

export function createPaletteSettings(paletteStyle: PaletteStyle = 'strip'): PaletteSettings {
  return { paletteStyle, paletteCount: 5, paletteOrder: 'frequency', paletteSize: 100, paletteGap: 100 };
}

export function restorePaletteSettings(value: unknown, base: PaletteSettings): PaletteSettings {
  const result = { ...base };
  if (!value || typeof value !== 'object') return result;
  const saved = value as Partial<PaletteSettings>;
  const styles: PaletteStyle[] = ['strip', 'dots', 'gradient', 'ribbon', 'necklace', 'numbered', 'hero'];
  if (typeof saved.paletteStyle === 'string' && (styles as string[]).includes(saved.paletteStyle)) result.paletteStyle = saved.paletteStyle;
  const orders: PaletteOrder[] = ['frequency', 'luminance', 'hue'];
  if (typeof saved.paletteOrder === 'string' && (orders as string[]).includes(saved.paletteOrder)) result.paletteOrder = saved.paletteOrder;
  if (typeof saved.paletteCount === 'number' && Number.isFinite(saved.paletteCount)) result.paletteCount = Math.round(Math.min(6, Math.max(3, saved.paletteCount)));
  if (typeof saved.paletteSize === 'number' && Number.isFinite(saved.paletteSize)) result.paletteSize = Math.min(160, Math.max(60, saved.paletteSize));
  if (typeof saved.paletteGap === 'number' && Number.isFinite(saved.paletteGap)) result.paletteGap = Math.min(160, Math.max(60, saved.paletteGap));
  return result;
}

// Extra vertical space the decorative palette needs below its anchor point, scaled by size/gap.
// Used by both playerLayout and polaroidLayout so the composition never overlaps the palette.
export function paletteFootprint(settings: PaletteSettings): number {
  const sizeScale = settings.paletteSize / 100, gapScale = settings.paletteGap / 100;
  if (settings.paletteStyle === 'ribbon') return Math.round(12 + settings.paletteCount * 14 * gapScale);
  const base = { strip: 40, dots: 22, gradient: 20, numbered: 46, hero: 40, necklace: 20 }[settings.paletteStyle];
  return Math.round(base * sizeScale);
}
