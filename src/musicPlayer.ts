import { coverFonts } from './albumCover';

export type PlayerSettings = {
  backgroundMode: 'solid' | 'gradient' | 'photo' | 'ambient';
  layout: 'stack' | 'mini' | 'lyrics' | 'vinyl';
  artworkShape: 'square' | 'circle' | 'portrait' | 'landscape';
  artworkSide: 'left' | 'right';
  panel: 'none' | 'solid' | 'glass';
  panelColor: string; panelOpacity: number; panelRadius: number; panelPadding: number;
  accent: string | null;
  progressStyle: 'line' | 'thick' | 'segments' | 'waveform';
  progressThumb: 'none' | 'dot' | 'line' | 'ring';
  showPrevious: boolean; showNext: boolean; showShuffle: boolean; showRepeat: boolean;
  showExtra: boolean; extraText: string;
  lyrics: string; lyricFont: keyof typeof coverFonts; lyricSize: number; lyricHighlight: number; lyricOpacity: number;
  recordColor: string; recordLabelColor: string; recordLabel: string; recordReveal: number; recordGrooves: boolean;
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

export type PlayerPreset = 'classic' | 'dark' | 'minimal' | 'mini' | 'glass' | 'lyrics' | 'vinyl';
export function createPlayerSettings(preset: PlayerPreset = 'classic'): PlayerSettings {
  const base: PlayerSettings = {
    layout: 'stack', artworkShape: 'square', artworkSide: 'left', panel: 'none', panelColor: '#ffffff', panelOpacity: 20, panelRadius: 24, panelPadding: 20,
    accent: null, progressStyle: 'line', progressThumb: 'dot', showPrevious: true, showNext: true, showShuffle: true, showRepeat: true,
    showExtra: false, extraText: '', lyrics: '', lyricFont: 'sans', lyricSize: 32, lyricHighlight: 1, lyricOpacity: 35,
    recordColor: '#202226', recordLabelColor: '#d4bba2', recordLabel: 'SIDE A', recordReveal: 60, recordGrooves: true,
    backgroundMode: 'solid', gradientEnd: '#52656a', gradientAngle: 135, darkness: 0, foreground: null,
    artworkSize: 404, artworkRadius: 0, artworkShadow: 0, position: 25.5, gap: 18,
    titleFont: 'sans', artistFont: 'sans', titleSize: 25, artistSize: 14, titleWeight: 650, artistWeight: 500,
    titleColor: null, artistColor: null, align: 'left', showProgress: true, showTimes: true,
    timeDisplay: 'duration', controls: 'full', glyph: 'play', buttonStyle: 'circle', controlsScale: 1,
    showFavorite: true, paletteStyle: 'strip',
  };
  if (preset === 'dark') return { ...base, backgroundMode: 'photo', artworkRadius: 18, artworkShadow: 45, titleSize: 21, timeDisplay: 'remaining', glyph: 'pause', buttonStyle: 'plain' };
  if (preset === 'minimal') return { ...base, artworkRadius: 10, artworkShadow: 15, controls: 'compact', buttonStyle: 'plain', showFavorite: false, paletteStyle: 'dots' };
  if (preset === 'mini') return { ...base, layout: 'mini', panel: 'solid', panelColor: '#f8f6ef', panelOpacity: 100, artworkRadius: 10, titleSize: 21, position: 46, controls: 'compact', showFavorite: false, paletteStyle: 'dots', progressThumb: 'none' };
  if (preset === 'glass') return { ...base, panel: 'glass', backgroundMode: 'ambient', artworkSize: 360, artworkRadius: 14, artworkShadow: 25, panelOpacity: 14, titleSize: 23, buttonStyle: 'plain', progressStyle: 'thick', paletteStyle: 'dots' };
  if (preset === 'lyrics') return { ...base, layout: 'lyrics', backgroundMode: 'photo', artworkRadius: 10, titleSize: 19, artistSize: 13, position: 32, controls: 'compact', buttonStyle: 'plain', showFavorite: false, paletteStyle: 'dots', progressStyle: 'waveform', progressThumb: 'none', showExtra: true };
  if (preset === 'vinyl') return { ...base, layout: 'vinyl', titleFont: 'serif', titleSize: 28, artworkShadow: 30, position: 32, align: 'center', controls: 'compact', buttonStyle: 'plain', showFavorite: false, paletteStyle: 'dots', showExtra: true, recordReveal: 70 };
  return base;
}

export function applyPlayerPreset(current: PlayerSettings, preset: PlayerPreset): PlayerSettings {
  return { ...createPlayerSettings(preset), extraText: current.extraText, lyrics: current.lyrics, recordLabel: current.recordLabel };
}

const bound = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export function restorePlayerSettings(value: unknown, preset: PlayerPreset = 'classic'): PlayerSettings {
  const result = createPlayerSettings(preset);
  if (!value || typeof value !== 'object') return result;
  const saved = value as Partial<PlayerSettings>;
  const ranges = { panelOpacity: [0, 100], panelRadius: [0, 40], panelPadding: [12, 32], lyricSize: [20, 44], lyricHighlight: [1, 4], lyricOpacity: [10, 80], recordReveal: [25, 90], gradientAngle: [0, 360], darkness: [0, 80], artworkSize: [280, 420], artworkRadius: [0, 48], artworkShadow: [0, 80], position: [15, 65], gap: [8, 48], titleSize: [14, 38], artistSize: [10, 24], titleWeight: [100, 900], artistWeight: [100, 900], controlsScale: [0.7, 1.3] } as const;
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const candidate = saved[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate)) result[key] = bound(candidate, ranges[key][0], ranges[key][1]);
  }
  const options = { layout: ['stack', 'mini', 'lyrics', 'vinyl'], artworkShape: ['square', 'circle', 'portrait', 'landscape'], artworkSide: ['left', 'right'], panel: ['none', 'solid', 'glass'], progressStyle: ['line', 'thick', 'segments', 'waveform'], progressThumb: ['none', 'dot', 'line', 'ring'], backgroundMode: ['solid', 'gradient', 'photo', 'ambient'], align: ['left', 'center'], timeDisplay: ['duration', 'remaining'], controls: ['full', 'compact', 'none'], glyph: ['play', 'pause'], buttonStyle: ['circle', 'plain'], paletteStyle: ['strip', 'dots'] } as const;
  for (const key of Object.keys(options) as (keyof typeof options)[]) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && (options[key] as readonly string[]).includes(candidate)) Object.assign(result, { [key]: candidate });
  }
  for (const key of ['titleFont', 'artistFont', 'lyricFont'] as const) if (saved[key] && Object.hasOwn(coverFonts, saved[key])) result[key] = saved[key];
  for (const key of ['foreground', 'titleColor', 'artistColor', 'gradientEnd', 'panelColor', 'accent', 'recordColor', 'recordLabelColor'] as const) {
    const candidate = saved[key];
    if (typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate)) result[key] = candidate;
  }
  for (const key of ['showProgress', 'showTimes', 'showFavorite', 'showPrevious', 'showNext', 'showShuffle', 'showRepeat', 'showExtra', 'recordGrooves'] as const) if (typeof saved[key] === 'boolean') result[key] = saved[key];
  for (const key of ['extraText', 'lyrics', 'recordLabel'] as const) if (typeof saved[key] === 'string') result[key] = saved[key].slice(0, key === 'lyrics' ? 400 : key === 'recordLabel' ? 40 : 180);
  result.lyricHighlight = Math.round(result.lyricHighlight);
  return result;
}

// Reserve two title lines and calculate every following block together. Both the canvas and
// its crop hit target use this layout, including the upward adjustment needed to fit the page.
export function playerLayout(height: number, settings: PlayerSettings, showPalette: boolean) {
  const pad = settings.panel === 'none' ? 0 : settings.panelPadding;
  const size = Math.min(settings.artworkSize, 438 - pad * 2);
  const compact = settings.layout === 'mini' || settings.layout === 'lyrics';
  const ratio = settings.layout === 'vinyl' ? 1 : ({ square: 1, circle: 1, portrait: 3 / 4, landscape: 16 / 9 })[settings.artworkShape];
  const photoWidth = compact ? Math.min(116, size * 0.3) : settings.layout === 'vinyl' ? size / (1 + settings.recordReveal / 100) : size;
  const photoHeight = photoWidth / ratio;
  const lyricLines = settings.lyrics ? Math.min(4, settings.lyrics.split('\n').length) : 3;
  const lyricHeight = settings.layout === 'lyrics' ? lyricLines * settings.lyricSize * 1.5 + 32 : 0;
  const photoTop = lyricHeight;
  const photoX = compact && settings.artworkSide === 'right' ? size - photoWidth : 0;
  const textX = compact && settings.artworkSide === 'left' ? photoWidth + 18 : 0;
  const textWidth = compact ? size - photoWidth - 18 : size;
  const title = compact ? photoTop : photoHeight + settings.gap;
  const titleHeight = settings.titleSize * 2.24;
  const artist = title + titleHeight;
  const extra = Math.max(artist + settings.artistSize * 1.4 + 6, compact ? photoTop + photoHeight + 12 : 0);
  const timeline = extra + (settings.showExtra && settings.extraText ? 42 : 0);
  const trackHeight = settings.progressStyle === 'waveform' ? 28 : settings.progressStyle === 'thick' ? 7 : settings.progressStyle === 'segments' ? 10 : 2.5;
  const progressBottom = timeline + (settings.showProgress ? trackHeight + (settings.showTimes ? 23.5 : 5.5) : 0);
  const controls = progressBottom + (settings.controls === 'none' ? 0 : 40 * settings.controlsScale);
  const controlsBottom = controls + (settings.controls === 'none' ? 0 : 36 * settings.controlsScale);
  const palette = controlsBottom + pad + 12;
  const end = showPalette ? palette + (settings.paletteStyle === 'strip' ? 40 : 22) : controlsBottom;
  const scale = Math.min(1, (height - 124) / (end + pad));
  const top = bound(height * settings.position / 100, 24 + pad * scale, Math.max(24 + pad * scale, height - 100 - end * scale));
  const left = (470 - size * scale) / 2;
  return { left, top, size: size * scale, scale, title: top + title * scale, titleHeight: titleHeight * scale, artist: top + artist * scale,
    textLeft: left + textX * scale, textWidth: textWidth * scale, extra: top + extra * scale, lyricTop: top, lyricHeight: lyricHeight * scale,
    photo: { left: left + photoX * scale, top: top + photoTop * scale, width: photoWidth * scale, height: photoHeight * scale, radius: (settings.artworkShape === 'circle' && settings.layout !== 'vinyl' ? photoWidth / 2 : Math.min(settings.artworkRadius, photoWidth / 2, photoHeight / 2)) * scale },
    panel: { left: left - pad * scale, top: top - pad * scale, width: (size + pad * 2) * scale, height: (controlsBottom + pad * 2) * scale },
    record: { x: left + (size - photoWidth / 2) * scale, y: top + photoWidth * scale / 2, radius: photoWidth * scale / 2 },
    trackHeight: trackHeight * scale, timeline: top + timeline * scale, controls: top + controls * scale, palette: top + palette * scale, bottom: top + end * scale };
}
