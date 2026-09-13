import { coverFonts } from './albumCover';
import { createPaletteSettings, paletteFootprint, restorePaletteSettings, type PaletteSettings } from './palette';

export type PolaroidPreset = 'classic' | 'clean' | 'diary' | 'cinema' | 'noir' | 'postcard' | 'scrapbook' | 'formal';
export type PolaroidSettings = {
  photoFormat: 'square' | 'portrait' | 'landscape';
  photoWidth: number; padding: number; captionHeight: number; radius: number; photoRadius: number;
  rotation: number; position: number; shadow: number;
  paper: string; ink: string | null;
  texture: 'smooth' | 'fiber' | 'aged'; textureAmount: number;
  titleFont: keyof typeof coverFonts; artistFont: keyof typeof coverFonts;
  titleSize: number; artistSize: number; titleWeight: number; artistWeight: number;
  titleItalic: boolean; artistItalic: boolean; titleColor: string | null; artistColor: string | null;
  align: 'left' | 'center' | 'right';
  showProgress: boolean; showPauseGlyph: boolean; showTimes: boolean;
  tape: 'none' | 'top' | 'corners'; tapeColor: string; photoCorners: boolean;
  showStamp: boolean; stamp: string;
  wallPattern: 'none' | 'grid' | 'dots';
} & PaletteSettings;

export function createPolaroidSettings(preset: PolaroidPreset = 'classic'): PolaroidSettings {
  const base: PolaroidSettings = {
    photoFormat: 'square', photoWidth: 404, padding: 14, captionHeight: 122, radius: 16, photoRadius: 4,
    rotation: 0, position: 25.5, shadow: 28, paper: '#fffdf9', ink: null, texture: 'smooth', textureAmount: 0,
    titleFont: 'sans', artistFont: 'sans', titleSize: 21, artistSize: 14, titleWeight: 700, artistWeight: 500,
    titleItalic: false, artistItalic: false, titleColor: null, artistColor: null, align: 'left',
    showProgress: true, showPauseGlyph: true, showTimes: true, tape: 'none', tapeColor: '#d8c5a0', photoCorners: false,
    showStamp: false, stamp: '', wallPattern: 'none', ...createPaletteSettings('strip'),
  };
  if (preset === 'clean') return { ...base, photoWidth: 350, padding: 22, captionHeight: 96, radius: 2, photoRadius: 0, shadow: 12, align: 'center', titleWeight: 500, showProgress: false, showPauseGlyph: false, paletteStyle: 'dots' };
  if (preset === 'diary') return { ...base, photoWidth: 330, padding: 20, rotation: -5, radius: 2, photoRadius: 0, paper: '#f7efd9', texture: 'fiber', textureAmount: 22, titleFont: 'serif', titleItalic: true, artistFont: 'mono', titleSize: 24, showProgress: false, showPauseGlyph: false, tape: 'top', showStamp: true, wallPattern: 'grid', paletteStyle: 'dots' };
  if (preset === 'cinema') return { ...base, photoFormat: 'landscape', photoWidth: 390, padding: 18, captionHeight: 110, radius: 0, photoRadius: 0, titleFont: 'japanese', artistFont: 'mono', titleSize: 25, showProgress: false, showPauseGlyph: false, showStamp: true, paletteStyle: 'dots' };
  if (preset === 'noir') return { ...base, photoFormat: 'portrait', photoWidth: 300, padding: 20, radius: 3, photoRadius: 0, paper: '#24252b', titleFont: 'serif', artistFont: 'mono', align: 'center', showProgress: false, showPauseGlyph: false, paletteStyle: 'dots' };
  if (preset === 'postcard') return { ...base, photoFormat: 'landscape', photoWidth: 380, padding: 20, captionHeight: 104, radius: 3, photoRadius: 0, rotation: -2, paper: '#f3e6d3', texture: 'aged', textureAmount: 26, titleFont: 'serif', artistFont: 'mono', titleSize: 22, showProgress: false, showPauseGlyph: false, showStamp: true, stamp: '2026.09.13 · Somewhere new', wallPattern: 'none', paletteStyle: 'dots' };
  if (preset === 'scrapbook') return { ...base, photoWidth: 340, padding: 18, rotation: 4, radius: 4, photoRadius: 0, paper: '#fff7ec', texture: 'fiber', textureAmount: 14, titleFont: 'handwritten', titleSize: 30, titleWeight: 600, artistFont: 'sans', tape: 'corners', tapeColor: '#f2b6c6', photoCorners: true, wallPattern: 'dots', paletteStyle: 'dots' };
  if (preset === 'formal') return { ...base, photoWidth: 360, padding: 26, captionHeight: 104, radius: 2, photoRadius: 0, shadow: 18, paper: '#faf6ef', titleFont: 'serif', artistFont: 'serif', titleSize: 22, artistSize: 13, align: 'center', showProgress: false, showPauseGlyph: false, tape: 'none', paletteStyle: 'dots' };
  return base;
}

export function restorePolaroidSettings(value: unknown): PolaroidSettings {
  const result = createPolaroidSettings();
  if (!value || typeof value !== 'object') return result;
  const saved = value as Partial<PolaroidSettings>;
  const ranges = { photoWidth: [260, 404], padding: [8, 36], captionHeight: [80, 180], radius: [0, 24], photoRadius: [0, 24], rotation: [-10, 10], position: [15, 50], shadow: [0, 60], textureAmount: [0, 60], titleSize: [14, 32], artistSize: [10, 22], titleWeight: [100, 900], artistWeight: [100, 900] } as const;
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const candidate = saved[key]; const [min, max] = ranges[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate)) result[key] = Math.min(max, Math.max(min, candidate));
  }
  const options = { photoFormat: ['square', 'portrait', 'landscape'], align: ['left', 'center', 'right'], tape: ['none', 'top', 'corners'], texture: ['smooth', 'fiber', 'aged'], wallPattern: ['none', 'grid', 'dots'] } as const;
  for (const key of Object.keys(options) as (keyof typeof options)[]) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && (options[key] as readonly string[]).includes(candidate)) Object.assign(result, { [key]: candidate });
  }
  Object.assign(result, restorePaletteSettings(saved, result));
  for (const key of ['titleFont', 'artistFont'] as const) if (typeof saved[key] === 'string' && Object.hasOwn(coverFonts, saved[key])) result[key] = saved[key];
  for (const key of ['paper', 'ink', 'titleColor', 'artistColor', 'tapeColor'] as const) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate)) result[key] = candidate;
  }
  for (const key of ['titleItalic', 'artistItalic', 'showProgress', 'showPauseGlyph', 'showTimes', 'showStamp', 'photoCorners'] as const) if (typeof saved[key] === 'boolean') result[key] = saved[key];
  if (typeof saved.stamp === 'string') result.stamp = saved.stamp.slice(0, 80);
  return result;
}

// Local paper coordinates are shared by rendering and the rotated photo hit target.
// Fit the entire rotated card, then reserve room below it for the palette and credit.
export function polaroidLayout(height: number, settings: PolaroidSettings, showPalette: boolean) {
  const ratio = { square: 1, portrait: 3 / 4, landscape: 16 / 9 }[settings.photoFormat];
  const photoHeight = settings.photoWidth / ratio;
  const titleY = settings.padding + photoHeight + 14;
  const artistY = titleY + settings.titleSize * 1.4 + 4;
  const stampY = artistY + settings.artistSize * 1.5 + 8;
  const timelineY = stampY + (settings.showStamp ? 22 : 0) + 8;
  const contentBottom = settings.showProgress ? timelineY + (settings.showTimes ? 24 : 8) : stampY + (settings.showStamp ? 18 : 0);
  const cardWidth = settings.photoWidth + settings.padding * 2;
  const cardHeight = Math.max(settings.padding + photoHeight + settings.captionHeight, contentBottom + 12);
  const angle = settings.rotation * Math.PI / 180;
  const boundWidth = Math.abs(Math.cos(angle)) * cardWidth + Math.abs(Math.sin(angle)) * cardHeight;
  const boundHeight = Math.abs(Math.sin(angle)) * cardWidth + Math.abs(Math.cos(angle)) * cardHeight;
  const reserved = showPalette ? 150 + paletteFootprint(settings) : 110;
  const scale = Math.min(1, 438 / boundWidth, (height - reserved - 40) / boundHeight);
  const extentY = boundHeight * scale / 2;
  const centerY = Math.max(extentY + 32, Math.min(height - reserved - extentY, height * settings.position / 100 - settings.padding + cardHeight * scale / 2));
  const cardLeft = 235 - cardWidth * scale / 2;
  const cardTop = centerY - cardHeight * scale / 2;
  return { ratio, angle, scale, cardWidth, cardHeight, centerX: 235, centerY, cardLeft, cardTop,
    left: cardLeft + settings.padding * scale, top: cardTop + settings.padding * scale,
    width: settings.photoWidth * scale, height: photoHeight * scale, photoHeight,
    titleY, artistY, stampY, timelineY, bottom: centerY + extentY, paletteY: centerY + extentY + 34,
    boundLeft: 235 - boundWidth * scale / 2, boundRight: 235 + boundWidth * scale / 2,
    boundTop: centerY - extentY,
  };
}

export function photoDragDelta(dx: number, dy: number, rotation: number) {
  const angle = rotation * Math.PI / 180;
  return { x: dx * Math.cos(angle) + dy * Math.sin(angle), y: -dx * Math.sin(angle) + dy * Math.cos(angle) };
}
