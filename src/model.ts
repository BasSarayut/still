export type Crop = { zoom: number; x: number; y: number };
export type Draft = {
  version: 1;
  device: string;
  title: string;
  artist: string;
  elapsed: string;
  duration: string;
  credit: string;
  showCredit: boolean;
  showPalette: boolean;
  showGuides: boolean;
  background: string;
  foreground: string | null;
  palette: string[];
  crop: Crop;
  image: Blob | null;
};

export const initialCrop: Crop = { zoom: 1, x: 0.5, y: 0.5 };
export const initialDraft: Draft = {
  version: 1, device: 'iPhone 16', title: 'เพลงโปรดของคุณ', artist: 'Your favorite artist',
  elapsed: '0:42', duration: '4:18', credit: '', showCredit: true, showPalette: true,
  showGuides: true, background: '#f3f1ec', foreground: null,
  palette: ['#52656a', '#8eaaa9', '#b7c9c6', '#dbded6', '#f3f1ec'],
  crop: initialCrop, image: null,
};

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function parseTime(value: string): number | null {
  if (!/^\d{1,3}:[0-5]\d$/.test(value)) return null;
  const [minutes, seconds] = value.split(':').map(Number);
  return minutes * 60 + seconds;
}

export function validTimes(elapsed: string, duration: string) {
  const current = parseTime(elapsed);
  const total = parseTime(duration);
  return current !== null && total !== null && total > 0 && current <= total;
}

export function progress(elapsed: string, duration: string) {
  return clamp((parseTime(elapsed) ?? 0) / Math.max(1, parseTime(duration) ?? 1));
}

export function luminance(hex: string) {
  const channels = [1, 3, 5].map(start => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function automaticForeground(background: string) {
  const light = '#faf9f6';
  const dark = '#232927';
  const backdrop = luminance(background);
  return (luminance(light) + 0.05) / (backdrop + 0.05) > (backdrop + 0.05) / (luminance(dark) + 0.05) ? light : dark;
}

export function cropRect(width: number, height: number, crop: Crop) {
  const size = Math.min(width, height) / clamp(crop.zoom, 1, 4);
  return { x: (width - size) * clamp(crop.x), y: (height - size) * clamp(crop.y), size };
}

export function restoreDraft(value: unknown): Draft {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) return initialDraft;
  const saved = value as Partial<Draft>;
  const restored = { ...initialDraft };
  for (const key of ['device', 'title', 'artist', 'elapsed', 'duration', 'credit'] as const) {
    if (typeof saved[key] === 'string') restored[key] = saved[key].slice(0, 180);
  }
  for (const key of ['showCredit', 'showPalette', 'showGuides'] as const) {
    if (typeof saved[key] === 'boolean') restored[key] = saved[key];
  }
  const color = (candidate: unknown): candidate is string => typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate);
  if (color(saved.background)) restored.background = saved.background;
  if (color(saved.foreground)) restored.foreground = saved.foreground;
  if (Array.isArray(saved.palette) && saved.palette.length === 5 && saved.palette.every(color)) restored.palette = saved.palette;
  if (saved.crop && [saved.crop.zoom, saved.crop.x, saved.crop.y].every(Number.isFinite)) {
    restored.crop = { zoom: clamp(saved.crop.zoom, 1, 4), x: clamp(saved.crop.x), y: clamp(saved.crop.y) };
  }
  if (saved.image instanceof Blob) restored.image = saved.image;
  return restored;
}
