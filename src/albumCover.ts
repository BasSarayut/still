import type { Crop } from './model';

export const coverFonts = {
  sans: 'Arial, "Noto Sans Thai Variable", "Noto Sans JP Variable", sans-serif',
  serif: 'Georgia, "Times New Roman", "Noto Sans Thai Variable", "Noto Sans JP Variable", serif',
  mono: '"Courier New", "Noto Sans Thai Variable", "Noto Sans JP Variable", monospace',
  thai: '"Noto Sans Thai Variable", "Noto Sans JP Variable", sans-serif',
  japanese: '"Noto Sans JP Variable", "Noto Sans Thai Variable", sans-serif',
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

export function createAlbumCover(): AlbumCover {
  return { format: 'square', split: 50, texts: [
    { ...createCoverText('artist', 'ARTIST NAME'), font: 'serif', size: 10, width: 28, y: 6 },
    { ...createCoverText('title', 'YOUR ALBUM\nTITLE'), font: 'serif', size: 14, weight: 700, align: 'center', x: 36, y: 6, width: 40, tracking: 1 },
    { ...createCoverText('credits', 'Written & composed by\nYour name'), size: 8, y: 17, width: 35 },
    { ...createCoverText('note', 'A little feeling, on repeat.'), size: 8, y: 43, width: 60 },
  ] };
}

const bounded = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function restoreAlbumCover(value: unknown): AlbumCover {
  const defaults = createAlbumCover();
  if (!value || typeof value !== 'object') return defaults;
  const saved = value as Partial<AlbumCover>;
  return {
    format: saved.format === 'phone' ? 'phone' : 'square',
    split: bounded(saved.split, defaults.split, 20, 80),
    texts: Array.isArray(saved.texts) ? saved.texts.slice(0, 12).filter((text): text is CoverText => !!text && typeof text === 'object').map((text, index) => {
      const fallback = createCoverText(`text-${index}`);
      return { ...fallback, id: `text-${index}`,
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
