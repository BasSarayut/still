import { coverFonts } from './albumCover';

export type PlayerSettings = {
  backgroundMode: 'solid' | 'gradient' | 'photo';
  gradientEnd: string;
  gradientAngle: number;
  darkness: number;
  foreground: string | null;
  artworkSize: number;
  artworkRadius: number;
  artworkShadow: number;
  position: number;
  gap: number;
  titleFont: keyof typeof coverFonts;
  artistFont: keyof typeof coverFonts;
  titleSize: number;
  artistSize: number;
  titleWeight: number;
  artistWeight: number;
  titleColor: string | null;
  artistColor: string | null;
  align: 'left' | 'center';
  showProgress: boolean;
  showTimes: boolean;
  timeDisplay: 'duration' | 'remaining';
  controls: 'full' | 'compact' | 'none';
  glyph: 'play' | 'pause';
  buttonStyle: 'circle' | 'plain';
  controlsScale: number;
  showFavorite: boolean;
  paletteStyle: 'strip' | 'dots';
};

export type PlayerPreset = 'classic' | 'dark' | 'minimal';
export function createPlayerSettings(preset: PlayerPreset = 'classic'): PlayerSettings {
  const base: PlayerSettings = {
    backgroundMode: 'solid', gradientEnd: '#52656a', gradientAngle: 135, darkness: 0, foreground: null,
    artworkSize: 404, artworkRadius: 0, artworkShadow: 0, position: 25.5, gap: 18,
    titleFont: 'sans', artistFont: 'sans', titleSize: 25, artistSize: 14, titleWeight: 650, artistWeight: 500,
    titleColor: null, artistColor: null, align: 'left', showProgress: true, showTimes: true,
    timeDisplay: 'duration', controls: 'full', glyph: 'play', buttonStyle: 'circle', controlsScale: 1,
    showFavorite: true, paletteStyle: 'strip',
  };
  if (preset === 'dark') return { ...base, backgroundMode: 'photo', artworkRadius: 18, artworkShadow: 45, titleSize: 21, timeDisplay: 'remaining', glyph: 'pause', buttonStyle: 'plain' };
  if (preset === 'minimal') return { ...base, artworkRadius: 10, artworkShadow: 15, controls: 'compact', buttonStyle: 'plain', showFavorite: false, paletteStyle: 'dots' };
  return base;
}

const bound = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function restorePlayerSettings(value: unknown, preset: PlayerPreset = 'classic'): PlayerSettings {
  const result = createPlayerSettings(preset);
  if (!value || typeof value !== 'object') return result;
  const saved = value as Partial<PlayerSettings>;
  const ranges = { gradientAngle: [0, 360], darkness: [0, 80], artworkSize: [280, 420], artworkRadius: [0, 48], artworkShadow: [0, 80], position: [15, 42], gap: [8, 48], titleSize: [14, 38], artistSize: [10, 24], titleWeight: [100, 900], artistWeight: [100, 900], controlsScale: [0.7, 1.3] } as const;
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const candidate = saved[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate)) result[key] = bound(candidate, ranges[key][0], ranges[key][1]);
  }
  const options = { backgroundMode: ['solid', 'gradient', 'photo'], align: ['left', 'center'], timeDisplay: ['duration', 'remaining'], controls: ['full', 'compact', 'none'], glyph: ['play', 'pause'], buttonStyle: ['circle', 'plain'], paletteStyle: ['strip', 'dots'] } as const;
  for (const key of Object.keys(options) as (keyof typeof options)[]) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && (options[key] as readonly string[]).includes(candidate)) Object.assign(result, { [key]: candidate });
  }
  for (const key of ['titleFont', 'artistFont'] as const) if (saved[key] && Object.hasOwn(coverFonts, saved[key])) result[key] = saved[key];
  for (const key of ['foreground', 'titleColor', 'artistColor', 'gradientEnd'] as const) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate)) result[key] = candidate;
  }
  for (const key of ['showProgress', 'showTimes', 'showFavorite'] as const) if (typeof saved[key] === 'boolean') result[key] = saved[key];
  return result;
}

// Reserve two title lines and calculate every following block together. Both the canvas and
// its crop hit target use this layout, including the upward adjustment needed to fit the page.
export function playerLayout(height: number, settings: PlayerSettings, showPalette: boolean) {
  const size = settings.artworkSize;
  const title = size + settings.gap;
  const titleHeight = settings.titleSize * 2.24;
  const artist = title + titleHeight;
  const timeline = artist + settings.artistSize * 1.4 + 6;
  const progressBottom = timeline + (settings.showProgress ? settings.showTimes ? 26 : 8 : 0);
  const controls = progressBottom + (settings.controls === 'none' ? 0 : 40 * settings.controlsScale);
  const controlsBottom = controls + (settings.controls === 'none' ? 0 : 36 * settings.controlsScale);
  const palette = controlsBottom + 12;
  const end = showPalette ? palette + (settings.paletteStyle === 'strip' ? 40 : 22) : controlsBottom;
  const top = bound(height * settings.position / 100, 24, Math.max(24, height - 100 - end));
  return { left: (470 - size) / 2, top, size, title: top + title, titleHeight, artist: top + artist,
    timeline: top + timeline, controls: top + controls, palette: top + palette, bottom: top + end };
}
