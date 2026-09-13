import { createAlbumCover, restoreAlbumCover, type AlbumCover } from './albumCover';
import { createPlayerSettings, restorePlayerSettings, type PlayerSettings } from './musicPlayer';
import { createPolaroidSettings, restorePolaroidSettings, type PolaroidSettings } from './polaroid';
import { createTicketSettings, restoreTicketSettings, type TicketSettings } from './concertTicket';
import type { PaletteSettings } from './palette';

export type Crop = { zoom: number; x: number; y: number };
export type TemplateId = 'custom' | 'polaroid' | 'albumCover' | 'concertTicket';
export type Draft = {
  version: 1;
  templateId: TemplateId;
  device: string;
  title: string;
  artist: string;
  elapsed: string;
  duration: string;
  credit: string;
  showCredit: boolean;
  showPalette: boolean;
  showGuides: boolean;
  showProgress: boolean;
  showPauseGlyph: boolean;
  background: string;
  foreground: string | null;
  palette: string[];
  paletteByFrequency: string[];
  crop: Crop;
  image: Blob | null;
  albumCover: AlbumCover;
  player: PlayerSettings;
  polaroid: PolaroidSettings;
  concertTicket: TicketSettings;
};

export const initialCrop: Crop = { zoom: 1, x: 0.5, y: 0.5 };
export const initialDraft: Draft = {
  version: 1, templateId: 'custom', device: 'iPhone 16', title: 'เพลงโปรดของคุณ', artist: 'Your favorite artist',
  elapsed: '0:42', duration: '4:18', credit: '', showCredit: true, showPalette: true,
  showGuides: true, showProgress: true, showPauseGlyph: true, background: '#f3f1ec', foreground: null,
  palette: ['#3a474b', '#52656a', '#8eaaa9', '#b7c9c6', '#dbded6', '#f3f1ec'],
  paletteByFrequency: ['#3a474b', '#52656a', '#8eaaa9', '#b7c9c6', '#dbded6', '#f3f1ec'],
  crop: initialCrop, image: null, albumCover: createAlbumCover(), player: createPlayerSettings(), polaroid: createPolaroidSettings(), concertTicket: createTicketSettings(),
};

// Fixed light/dark text colors used whenever a template needs guaranteed contrast
// instead of a user-chosen foreground (see automaticForeground and playerColors).
export const lightText = '#faf9f6';
export const darkText = '#232927';

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

// Apple Music shows time remaining (a negative countdown) instead of the song's total length.
export function remaining(elapsed: string, duration: string): string {
  const current = parseTime(elapsed);
  const total = parseTime(duration);
  if (current === null || total === null) return '';
  const left = Math.max(0, total - current);
  const minutes = Math.floor(left / 60);
  const seconds = left % 60;
  return `-${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function luminance(hex: string) {
  const channels = [1, 3, 5].map(start => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

// Hue angle (0–360) of a hex color, used to arrange the decorative palette around a color wheel.
export function hue(hex: string): number {
  const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  const max = Math.max(red, green, blue), min = Math.min(red, green, blue), delta = max - min;
  if (delta === 0) return 0;
  const raw = max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  const degrees = raw * 60;
  return degrees < 0 ? degrees + 360 : degrees;
}

export function sortByHue(colors: string[]): string[] {
  return [...colors].sort((a, b) => hue(a) - hue(b));
}

// Which of the extracted colors the decorative palette shows, and in what order. `paletteCount`
// picks the N most dominant colors (from paletteByFrequency); `paletteOrder` then arranges them.
export function selectPaletteColors(draft: Pick<Draft, 'palette' | 'paletteByFrequency'>, settings: PaletteSettings): string[] {
  const source = draft.paletteByFrequency.length === draft.palette.length ? draft.paletteByFrequency : draft.palette;
  const dominant = source.slice(0, Math.min(settings.paletteCount, source.length));
  if (settings.paletteOrder === 'hue') return sortByHue(dominant);
  if (settings.paletteOrder === 'luminance') return [...dominant].sort((a, b) => luminance(a) - luminance(b));
  return dominant;
}

export function automaticForeground(background: string) {
  const backdrop = luminance(background);
  return (luminance(lightText) + 0.05) / (backdrop + 0.05) > (backdrop + 0.05) / (luminance(darkText) + 0.05) ? lightText : darkText;
}

// Two darkest colors of the extracted palette, used by the player's photo-derived background.
export function darkestColors(palette: string[]): [string, string] {
  const sorted = [...palette].sort((a, b) => luminance(a) - luminance(b));
  const first = sorted[0] ?? darkText;
  return [first, sorted[1] ?? first];
}

// Mixes a hex color toward black by `amount` (0–1).
export function mixWithBlack(hex: string, amount: number) {
  const portion = clamp(amount);
  const channels = [1, 3, 5].map(start => Math.round(parseInt(hex.slice(start, start + 2), 16) * (1 - portion)));
  return `#${channels.map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

// Darkens a color until its luminance is at or below `maxLuminance`, guaranteeing enough contrast
// for fixed light text regardless of how bright the source photo (and its palette) started out.
export function darkenForContrast(hex: string, maxLuminance: number) {
  let portion = 0;
  let result = hex;
  while (luminance(result) > maxLuminance && portion < 1) {
    portion = Math.min(1, portion + 0.05);
    result = mixWithBlack(hex, portion);
  }
  return result;
}

export function cropRect(width: number, height: number, crop: Crop) {
  const size = Math.min(width, height) / clamp(crop.zoom, 1, 4);
  return { x: (width - size) * clamp(crop.x), y: (height - size) * clamp(crop.y), size };
}

export function playerColors(draft: Draft) {
  const settings = draft.player;
  const [first, second] = darkestColors(draft.palette);
  const derived = settings.backgroundMode === 'photo' || settings.backgroundMode === 'ambient';
  const start = derived ? mixWithBlack(darkenForContrast(second, settings.backgroundMode === 'ambient' ? 0.2 : 0.09), settings.darkness / 100) : draft.background;
  const end = derived ? mixWithBlack(darkenForContrast(first, 0.035), settings.darkness / 100) : settings.backgroundMode === 'gradient' ? settings.gradientEnd : start;
  const contrast = (ink: string, background: string) => (Math.max(luminance(ink), luminance(background)) + 0.05) / (Math.min(luminance(ink), luminance(background)) + 0.05);
  const score = (ink: string) => Math.min(contrast(ink, start), contrast(ink, end));
  const foreground = settings.foreground ?? (score(lightText) > score(darkText) ? lightText : darkText);
  const composite = (background: string) => '#' + [1, 3, 5].map(index => Math.round(parseInt(settings.panelColor.slice(index, index + 2), 16) * settings.panelOpacity / 100 + parseInt(background.slice(index, index + 2), 16) * (1 - settings.panelOpacity / 100)).toString(16).padStart(2, '0')).join('');
  const surfaceScore = (ink: string) => Math.min(contrast(ink, composite(start)), contrast(ink, composite(end)));
  const contentForeground = settings.foreground ?? (settings.panel === 'none' ? foreground : surfaceScore(lightText) > surfaceScore(darkText) ? lightText : darkText);
  return { start, end, foreground, contentForeground };
}

export function restoreDraft(value: unknown): Draft {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) return initialDraft;
  const saved = value as Partial<Draft>;
  const restored = { ...initialDraft };
  const legacyDark = 'templateId' in value && value.templateId === 'nowPlaying';
  restored.templateId = saved.templateId === 'polaroid' || saved.templateId === 'albumCover' || saved.templateId === 'concertTicket' ? saved.templateId : 'custom';
  restored.player = restorePlayerSettings(saved.player, legacyDark ? 'dark' : 'classic');
  restored.albumCover = restoreAlbumCover(saved.albumCover);
  restored.polaroid = restorePolaroidSettings(saved.polaroid);
  restored.concertTicket = restoreTicketSettings(saved.concertTicket);
  if (!saved.polaroid) {
    for (const key of ['showProgress', 'showPauseGlyph'] as const) if (typeof saved[key] === 'boolean') restored.polaroid[key] = saved[key];
  }
  for (const key of ['device', 'title', 'artist', 'elapsed', 'duration', 'credit'] as const) {
    if (typeof saved[key] === 'string') restored[key] = saved[key].slice(0, 180);
  }
  for (const key of ['showCredit', 'showPalette', 'showGuides', 'showProgress', 'showPauseGlyph'] as const) {
    if (typeof saved[key] === 'boolean') restored[key] = saved[key];
  }
  const color = (candidate: unknown): candidate is string => typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate);
  if (color(saved.background)) restored.background = saved.background;
  if (color(saved.foreground)) restored.foreground = saved.foreground;
  if (!saved.player && !legacyDark && color(saved.foreground)) restored.player.foreground = saved.foreground;
  if (Array.isArray(saved.palette) && (saved.palette.length === 5 || saved.palette.length === 6) && saved.palette.every(color)) restored.palette = saved.palette;
  restored.paletteByFrequency = Array.isArray(saved.paletteByFrequency) && saved.paletteByFrequency.length === restored.palette.length && saved.paletteByFrequency.every(color)
    ? saved.paletteByFrequency : restored.palette;
  if (saved.crop && [saved.crop.zoom, saved.crop.x, saved.crop.y].every(Number.isFinite)) {
    restored.crop = { zoom: clamp(saved.crop.zoom, 1, 4), x: clamp(saved.crop.x), y: clamp(saved.crop.y) };
  }
  if (saved.image instanceof Blob) restored.image = saved.image;
  return restored;
}
