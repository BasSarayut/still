import type { Crop } from './model';

export const coverFonts = {
  sans: 'Arial, "Noto Sans Thai Variable", "Noto Sans JP Variable", sans-serif',
  serif: 'Georgia, "Times New Roman", "Noto Sans Thai Variable", "Noto Sans JP Variable", serif',
  mono: '"Courier New", "Noto Sans Thai Variable", "Noto Sans JP Variable", monospace',
  thai: '"Noto Sans Thai Variable", "Noto Sans JP Variable", sans-serif',
  japanese: '"Noto Sans JP Variable", "Noto Sans Thai Variable", sans-serif',
  handwritten: '"Caveat Variable", "Noto Sans Thai Variable", "Noto Sans JP Variable", cursive',
};

// Shared label list so every template's font picker (player, polaroid, cover, ticket) stays in sync.
export const coverFontLabels: Record<keyof typeof coverFonts, string> = {
  sans: 'Sans · Arial', serif: 'Serif · Georgia', mono: 'Mono · Courier',
  thai: 'Noto Sans Thai', japanese: 'Noto Sans JP', handwritten: 'Handwritten · Caveat',
};

export type CoverText = {
  id: string;
  text: string;
  visible: boolean;
  font: keyof typeof coverFonts;
  size: number;
  weight: number;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  x: number;
  y: number;
  width: number;
  tracking: number;
  lineHeight: number;
  opacity: number;
  color: string | null;
  rotation: number;
  locked: boolean;
  shadow: number;
  stroke: number;
};

export type CoverLayout = {
  format: 'square' | 'phone';
  split: number;
  texts: CoverText[];
  style: CoverPreset;
  variant: 'balanced' | 'top' | 'side';
  photoX: number;
  photoY: number;
  photoWidth: number;
  photoHeight: number;
  photoRotation: number;
  photoRadius: number;
  photoOpacity: number;
  photoBorder: number;
  backgroundMode: 'solid' | 'gradient' | 'blur';
  gradientColor: string;
  grain: number;
  fade: number;
  vignette: number;
  lightLeak: number;
  overlay: number;
  decoration: 'none' | 'line' | 'tape' | 'label' | 'film';
  decorationColor: string;
  decorationOpacity: number;
};

export type AlbumCover = CoverLayout & {
  squareSize: number;
  customWidth: number;
  customHeight: number;
  useCustomSize: boolean;
  layouts: Partial<Record<'square' | 'phone', { layout: CoverLayout; crop: Crop }>>;
};

export function createCoverText(id: string, text = ''): CoverText {
  return { id, text, visible: true, font: 'sans', size: 14, weight: 400, italic: false,
    align: 'left', x: 6, y: 8, width: 40, tracking: 0, lineHeight: 1.4, opacity: 1, color: null,
    rotation: 0, locked: false, shadow: 0, stroke: 0 };
}

// The four roles every preset styles. A preset may leave a role's default text as-is (fresh
// draft) or, when applied over an existing cover, keep that role's current text and visibility
// (see applyCoverPreset) — only the style and position below are ever reset by a preset.
export type CoverPreset = 'classic' | 'poster' | 'cassette' | 'vinyl' | 'zine' | 'minimal' | 'fullPhoto' | 'swiss' | 'indie' | 'dreamy';
export const coverPresets: CoverPreset[] = ['minimal', 'fullPhoto', 'swiss', 'indie', 'vinyl', 'dreamy', 'classic', 'poster', 'cassette', 'zine'];

function legacyCover(preset: CoverPreset): Pick<AlbumCover, 'format' | 'split' | 'texts'> {
  if (preset === 'poster') return { format: 'square', split: 60, texts: [
    { ...createCoverText('artist', 'FEATURED ARTIST'), font: 'mono', size: 9, weight: 600, x: 6, y: 6, width: 50, tracking: 2 },
    { ...createCoverText('title', 'BIG NIGHT\nENERGY'), font: 'sans', size: 28, weight: 800, x: 6, y: 12, width: 90, tracking: -0.5, lineHeight: 1.05 },
    { ...createCoverText('credits', 'PRODUCED & MIXED BY\nYOUR NAME'), font: 'mono', size: 7, weight: 500, x: 6, y: 48, width: 42, tracking: 0.5 },
    { ...createCoverText('note', 'LIMITED EDITION PRESS'), font: 'sans', size: 8, weight: 600, align: 'right', x: 50, y: 48, width: 44, opacity: 0.85 },
  ] };
  if (preset === 'cassette') return { format: 'square', split: 30, texts: [
    { ...createCoverText('artist', 'MIXTAPE FOR YOU'), font: 'mono', size: 9, weight: 500, x: 6, y: 6, width: 45, tracking: 1 },
    { ...createCoverText('title', 'SIDE A // AFTER HOURS'), font: 'mono', size: 16, weight: 700, x: 6, y: 11, width: 60, tracking: 0.5, lineHeight: 1.2 },
    { ...createCoverText('credits', 'REC. DATE — YOUR NAME'), font: 'mono', size: 7, x: 6, y: 21, width: 50, tracking: 0.5 },
    { ...createCoverText('note', '60 MIN · NORMAL BIAS'), font: 'sans', size: 8, x: 6, y: 25, width: 55, opacity: 0.75 },
  ] };
  if (preset === 'vinyl') return { format: 'square', split: 45, texts: [
    { ...createCoverText('artist', 'CATALOG NO. STL-001'), font: 'mono', size: 9, weight: 500, align: 'center', x: 10, y: 8, width: 80, tracking: 3 },
    { ...createCoverText('title', 'SIDE ONE'), font: 'serif', size: 20, weight: 600, align: 'center', x: 10, y: 15, width: 80, tracking: 1.5, lineHeight: 1.3 },
    { ...createCoverText('credits', 'Mastered for vinyl by Your Name'), font: 'serif', size: 9, align: 'center', x: 10, y: 33, width: 80, tracking: 0.5 },
    { ...createCoverText('note', '33⅓ RPM · STEREO'), font: 'mono', size: 7, align: 'center', x: 10, y: 40, width: 80, tracking: 2, opacity: 0.7 },
  ] };
  if (preset === 'zine') return { format: 'square', split: 38, texts: [
    { ...createCoverText('artist', "XEROX'D & DISTRIBUTED"), font: 'mono', size: 8, weight: 500, x: 6, y: 5, width: 40, tracking: 1.5 },
    { ...createCoverText('title', 'paper cuts\n& polaroids'), font: 'serif', size: 22, weight: 700, italic: true, x: 6, y: 10, width: 85, lineHeight: 1.05 },
    { ...createCoverText('credits', 'zine no. 1 — your name'), font: 'mono', size: 7, x: 6, y: 30, width: 45, tracking: 0.5 },
    { ...createCoverText('note', '“keep this one, it’s for you.”'), font: 'serif', size: 10, italic: true, x: 6, y: 34, width: 80, lineHeight: 1.3, opacity: 0.8 },
  ] };
  return { format: 'square', split: 50, texts: [
    { ...createCoverText('artist', 'ARTIST NAME'), font: 'serif', size: 10, width: 28, y: 6 },
    { ...createCoverText('title', 'YOUR ALBUM\nTITLE'), font: 'serif', size: 14, weight: 700, align: 'center', x: 36, y: 6, width: 40, tracking: 1 },
    { ...createCoverText('credits', 'Written & composed by\nYour name'), size: 8, y: 17, width: 35 },
    { ...createCoverText('note', 'A little feeling, on repeat.'), size: 8, y: 43, width: 60 },
  ] };
}

export function createAlbumCover(preset: CoverPreset = 'classic'): AlbumCover {
  const base = legacyCover(preset);
  const cover: AlbumCover = { ...base, style: preset, variant: 'balanced', photoX: 0, photoY: base.split, photoWidth: 100, photoHeight: 100 - base.split,
    photoRotation: 0, photoRadius: 0, photoOpacity: 1, photoBorder: 0, backgroundMode: 'solid', gradientColor: '#cfaea2', grain: 0, fade: 0, vignette: 0, lightLeak: 0, overlay: 0,
    decoration: 'none', decorationColor: '#f4eee3', decorationOpacity: 0.8, squareSize: 2400, customWidth: 1170, customHeight: 2532, useCustomSize: false, layouts: {} };
  if (['classic', 'poster', 'cassette', 'zine'].includes(preset)) return cover;
  const positions: Record<string, number[]> = {
    minimal: [16, 27, 68, 54], fullPhoto: [0, 0, 100, 100], swiss: [40, 26, 54, 65],
    indie: [8, 24, 84, 58], vinyl: [12, 38, 76, 54], dreamy: [16, 42, 68, 36],
  };
  [cover.photoX, cover.photoY, cover.photoWidth, cover.photoHeight] = positions[preset];
  cover.texts = [
    { ...createCoverText('artist', 'ARTIST NAME'), x: 8, y: 8, width: 84, size: 10, tracking: 2 },
    { ...createCoverText('title', 'YOUR ALBUM\nTITLE'), x: 8, y: 13, width: 84, size: 30, weight: 700, lineHeight: 1.1 },
    { ...createCoverText('credits', 'Written & composed by Your Name'), x: 8, y: 86, width: 84, size: 8 },
    { ...createCoverText('note', 'A little feeling, on repeat.'), x: 8, y: 92, width: 84, size: 8 },
  ];
  if (preset === 'minimal') cover.texts = cover.texts.map(text => ({ ...text, align: 'center', size: text.id === 'title' ? 19 : text.size, font: 'serif' }));
  if (preset === 'fullPhoto') {
    cover.overlay = 0.65;
    cover.texts = cover.texts.map(text => ({ ...text, color: '#ffffff', y: text.id === 'title' ? 66 : text.id === 'artist' ? 60 : text.y }));
  }
  if (preset === 'swiss') {
    cover.decoration = 'line';
    cover.texts[1] = { ...cover.texts[1], size: 42, tracking: -1, width: 90 };
    cover.texts[2] = { ...cover.texts[2], x: 6, y: 65, width: 28, font: 'mono' };
    cover.texts[3] = { ...cover.texts[3], x: 6, y: 81, width: 28 };
  }
  if (preset === 'indie') { cover.grain = 0.2; cover.fade = 0.12; cover.decoration = 'film'; cover.texts[0].y = 4; cover.texts[1].y = 9; cover.texts[1].font = 'handwritten'; cover.texts[1].size = 24; }
  if (preset === 'vinyl') { cover.texts[1].font = 'serif'; cover.texts[1].text = 'SIDE ONE'; cover.texts[2].y = 30; cover.texts[3].y = 94; }
  if (preset === 'dreamy') {
    cover.backgroundMode = 'blur'; cover.photoRadius = 18; cover.photoOpacity = 0.85; cover.lightLeak = 0.25;
    cover.texts = cover.texts.map(text => ({ ...text, align: 'center', font: 'serif', y: text.id === 'title' ? 24 : text.id === 'artist' ? 20 : text.y }));
  }
  return cover;
}

export function arrangeCover(cover: AlbumCover, variant = cover.variant): AlbumCover {
  const result = { ...cover, variant, texts: cover.texts.map(text => ({ ...text })) };
  if (variant === 'top') {
    result.texts = result.texts.map((text, index) => ({ ...text, x: 8, y: [6, 12, 33, 38][index] ?? 40, width: 84, align: 'left' }));
    if (cover.style !== 'fullPhoto') { result.photoY = 44; result.photoHeight = 48; }
  }
  if (variant === 'side') result.texts = result.texts.map((text, index) => ({ ...text, x: 5, y: 10 + index * 19, width: 35, align: 'left', size: Math.min(text.size, 25) }));
  if (cover.format === 'phone') {
    result.texts = result.texts.map(text => ({ ...text, y: 32 + text.y * 0.56 }));
    if (cover.style !== 'fullPhoto') { result.photoY = 32 + result.photoY * 0.5; result.photoHeight *= 0.52; }
  }
  return result;
}

export function switchCoverFormat(cover: AlbumCover, crop: Crop, format: AlbumCover['format']): { albumCover: AlbumCover; crop: Crop } {
  if (format === cover.format) return { albumCover: cover, crop };
  const { layouts, squareSize, customWidth, customHeight, useCustomSize, ...layout } = cover;
  const saved = layouts[format];
  let target = saved?.layout;
  if (!target) {
    target = arrangeCover({ ...createAlbumCover(cover.style), format, variant: cover.variant });
  }
  const texts = cover.texts.map(text => {
    const style = target.texts.find(item => item.id === text.id);
    return { ...text, ...(style ?? { x: text.x, y: format === 'phone' ? 32 + text.y * 0.56 : Math.max(0, (text.y - 32) / 0.56) }), text: text.text, visible: text.visible, locked: text.locked };
  });
  return { albumCover: { ...target, texts, format, squareSize, customWidth, customHeight, useCustomSize, layouts: { ...layouts, [cover.format]: { layout, crop } } }, crop: saved?.crop ?? { x: 0.5, y: 0.5, zoom: 1 } };
}

export function albumPhotoFrame(height: number, cover: AlbumCover) {
  if (['classic', 'poster', 'cassette', 'zine'].includes(cover.style)) return coverPhotoFrame(height, cover.split);
  return { left: cover.photoX * 4.7, top: cover.photoY * height / 100, width: cover.photoWidth * 4.7, height: cover.photoHeight * height / 100 };
}

// Applying a preset from the picker: reset split and each known role's style/position, but keep
// that role's current text and visibility, and carry over any custom blocks the preset doesn't
// define (added beyond the four built-in roles) completely unchanged.
export function applyCoverPreset(current: AlbumCover, preset: CoverPreset): AlbumCover {
  const target = arrangeCover({ ...createAlbumCover(preset), format: current.format });
  const roles = new Set(target.texts.map(text => text.id));
  const byId = new Map(current.texts.map(text => [text.id, text]));
  const texts = target.texts.map(text => {
    const existing = byId.get(text.id);
    return existing ? { ...text, text: existing.text, visible: existing.visible } : text;
  });
  const extras = current.texts.filter(text => !roles.has(text.id));
  return { ...target, squareSize: current.squareSize, customWidth: current.customWidth, customHeight: current.customHeight, useCustomSize: current.useCustomSize, texts: [...texts, ...extras] };
}

const bounded = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function restoreAlbumCover(value: unknown, nested = false): AlbumCover {
  const defaults = createAlbumCover();
  if (!value || typeof value !== 'object') return defaults;
  const saved = value as Partial<AlbumCover>;
  const usedIds = new Set<string>();
  return {
    ...defaults,
    style: coverPresets.includes(saved.style!) ? saved.style! : 'classic',
    variant: saved.variant === 'top' || saved.variant === 'side' ? saved.variant : 'balanced',
    ...Object.fromEntries((['photoX', 'photoY', 'photoWidth', 'photoHeight', 'photoRotation', 'photoRadius', 'photoOpacity', 'photoBorder', 'grain', 'fade', 'vignette', 'lightLeak', 'overlay', 'decorationOpacity', 'squareSize', 'customWidth', 'customHeight'] as const).map(key => {
      const bounds = key === 'squareSize' || key === 'customWidth' || key === 'customHeight' ? [320, 4096] : key === 'photoRotation' ? [-180, 180] : ['grain', 'fade', 'vignette', 'lightLeak', 'overlay', 'photoOpacity', 'decorationOpacity'].includes(key) ? [0, 1] : [key === 'photoWidth' || key === 'photoHeight' ? 5 : 0, 100];
      return [key, bounded(saved[key], defaults[key], bounds[0], bounds[1])];
    })),
    backgroundMode: saved.backgroundMode === 'gradient' || saved.backgroundMode === 'blur' ? saved.backgroundMode : 'solid',
    gradientColor: typeof saved.gradientColor === 'string' && /^#[0-9a-f]{6}$/i.test(saved.gradientColor) ? saved.gradientColor : defaults.gradientColor,
    decorationColor: typeof saved.decorationColor === 'string' && /^#[0-9a-f]{6}$/i.test(saved.decorationColor) ? saved.decorationColor : defaults.decorationColor,
    decoration: ['line', 'tape', 'label', 'film'].includes(saved.decoration!) ? saved.decoration! : 'none',
    useCustomSize: saved.useCustomSize === true,
    layouts: nested ? {} : Object.fromEntries((['square', 'phone'] as const).flatMap(format => {
      const slot = saved.layouts?.[format];
      if (!slot || typeof slot !== 'object') return [];
      const { layouts: _layouts, ...layout } = restoreAlbumCover(slot.layout, true);
      return [[format, { layout, crop: { x: bounded(slot.crop?.x, 0.5, 0, 1), y: bounded(slot.crop?.y, 0.5, 0, 1), zoom: bounded(slot.crop?.zoom, 1, 1, 4) } }]];
    })),
    format: saved.format === 'phone' ? 'phone' : 'square',
    split: bounded(saved.split, defaults.split, 20, 80),
    // Preserve each block's saved id (so preset role-matching survives a reload) unless it's
    // missing or a duplicate, in which case fall back to a positional id.
    texts: Array.isArray(saved.texts) ? saved.texts.slice(0, 12).filter((text): text is CoverText => !!text && typeof text === 'object').map((text, index) => {
      const fallback = createCoverText(`text-${index}`);
      const wanted = typeof text.id === 'string' && text.id ? text.id : fallback.id;
      const id = usedIds.has(wanted) ? fallback.id : wanted;
      usedIds.add(id);
      return { ...fallback, id,
        text: typeof text.text === 'string' ? text.text.slice(0, 1000) : '',
        visible: typeof text.visible === 'boolean' ? text.visible : true,
        font: Object.hasOwn(coverFonts, text.font) ? text.font : fallback.font,
        align: text.align === 'center' || text.align === 'right' ? text.align : 'left',
        italic: text.italic === true,
        locked: text.locked === true,
        rotation: bounded(text.rotation, 0, -180, 180), shadow: bounded(text.shadow, 0, 0, 20), stroke: bounded(text.stroke, 0, 0, 5),
        size: bounded(text.size, fallback.size, 6, 80),
        weight: bounded(text.weight, fallback.weight, 100, 900),
        x: bounded(text.x, fallback.x, 0, 95), y: bounded(text.y, fallback.y, 0, 95),
        width: bounded(text.width, fallback.width, 5, 100),
        tracking: bounded(text.tracking, fallback.tracking, -2, 12),
        lineHeight: bounded(text.lineHeight, fallback.lineHeight, 0.8, 3),
        opacity: bounded(text.opacity, fallback.opacity, 0, 1),
        color: typeof text.color === 'string' && /^#[0-9a-f]{6}$/i.test(text.color) ? text.color : null,
      };
    }) : defaults.texts,
  };
}

export function coverPhotoFrame(height: number, split: number) {
  const top = height * split / 100;
  return { left: 0, top, width: 470, height: height - top };
}

// A rectangular crop shared by rendering and drag gestures, so the image is never stretched.
export function coverCropRect(width: number, height: number, crop: Crop, aspect: number) {
  const zoom = Math.min(4, Math.max(1, crop.zoom));
  const cropWidth = Math.min(width, height * aspect) / zoom;
  const cropHeight = cropWidth / aspect;
  return { x: (width - cropWidth) * crop.x, y: (height - cropHeight) * crop.y, width: cropWidth, height: cropHeight };
}
