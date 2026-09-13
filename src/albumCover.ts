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
};

export type AlbumCover = {
  format: 'square' | 'phone';
  split: number;
  texts: CoverText[];
};

export function createCoverText(id: string, text = ''): CoverText {
  return { id, text, visible: true, font: 'sans', size: 14, weight: 400, italic: false,
    align: 'left', x: 6, y: 8, width: 40, tracking: 0, lineHeight: 1.4, opacity: 1, color: null };
}

// The four roles every preset styles. A preset may leave a role's default text as-is (fresh
// draft) or, when applied over an existing cover, keep that role's current text and visibility
// (see applyCoverPreset) — only the style and position below are ever reset by a preset.
export type CoverPreset = 'classic' | 'poster' | 'cassette' | 'vinyl' | 'zine';

export function createAlbumCover(preset: CoverPreset = 'classic'): AlbumCover {
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

// Applying a preset from the picker: reset split and each known role's style/position, but keep
// that role's current text and visibility, and carry over any custom blocks the preset doesn't
// define (added beyond the four built-in roles) completely unchanged.
export function applyCoverPreset(current: AlbumCover, preset: CoverPreset): AlbumCover {
  const target = createAlbumCover(preset);
  const roles = new Set(target.texts.map(text => text.id));
  const byId = new Map(current.texts.map(text => [text.id, text]));
  const texts = target.texts.map(text => {
    const existing = byId.get(text.id);
    return existing ? { ...text, text: existing.text, visible: existing.visible } : text;
  });
  const extras = current.texts.filter(text => !roles.has(text.id));
  return { format: current.format, split: target.split, texts: [...texts, ...extras] };
}

const bounded = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function restoreAlbumCover(value: unknown): AlbumCover {
  const defaults = createAlbumCover();
  if (!value || typeof value !== 'object') return defaults;
  const saved = value as Partial<AlbumCover>;
  const usedIds = new Set<string>();
  return {
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
