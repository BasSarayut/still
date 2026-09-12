import { describe, expect, it } from 'vitest';
import { applyPlayerPreset, createPlayerSettings, playerLayout, restorePlayerSettings, type PlayerPreset } from './musicPlayer';
import { initialDraft, luminance, playerColors, restoreDraft } from './model';
import { devices } from './devices';

describe('music player variations', () => {
  it('preserves personal words when applying every preset and restores all new settings', () => {
    const presets: PlayerPreset[] = ['classic', 'dark', 'minimal', 'mini', 'glass', 'lyrics', 'vinyl'];
    const current = { ...createPlayerSettings(), extraText: 'เชียงใหม่ · วันฝนตก', lyrics: '君と\nเพลงของเรา', recordLabel: 'SIDE B · 007' };
    for (const preset of presets) {
      const player = applyPlayerPreset(current, preset);
      expect(player).toMatchObject({ extraText: current.extraText, lyrics: current.lyrics, recordLabel: current.recordLabel });
      expect(restoreDraft({ ...initialDraft, player }).player).toEqual(player);
    }
    const old = restorePlayerSettings({ artworkSize: 350, controls: 'compact', titleFont: 'thai', backgroundMode: 'photo' });
    expect(old).toMatchObject({ artworkSize: 350, controls: 'compact', titleFont: 'thai', backgroundMode: 'photo', layout: 'stack', panel: 'none', artworkShape: 'square', showPrevious: true });
  });

  it('bounds malformed appearance settings and treats notes as strings', () => {
    const result = restorePlayerSettings({ layout: 'unknown', artworkShape: 'bad', panelColor: 'red', panelOpacity: 1000, lyricFont: '__proto__', lyricSize: NaN, lyricHighlight: 1.8, recordReveal: -50, lyrics: null, extraText: '<script>hello</script>', showShuffle: 'yes' });
    expect(result).toMatchObject({ layout: 'stack', artworkShape: 'square', panelColor: '#ffffff', panelOpacity: 100, lyricFont: 'sans', lyricSize: 32, lyricHighlight: 2, recordReveal: 25, lyrics: '', extraText: '<script>hello</script>', showShuffle: true });
  });

  it('fits every shape, panel and layout at extreme sizes, including four large lines', () => {
    for (const device of devices) for (const layout of ['stack', 'mini', 'lyrics', 'vinyl'] as const) for (const artworkShape of ['square', 'circle', 'portrait', 'landscape'] as const) for (const panel of ['none', 'glass'] as const) {
      const settings = { ...createPlayerSettings(), layout, artworkShape, panel, panelPadding: 32, artworkSize: 420, titleSize: 38, artistSize: 24, lyricSize: 44, lyrics: 'One\nTwo\nThree\nFour', showExtra: true, extraText: 'For someone\nWho feels like home', gap: 48, position: 65, controlsScale: 1.3 };
      const height = 470 * device.height / device.width, frame = playerLayout(height, settings, true);
      expect(frame.bottom).toBeLessThanOrEqual(height - 99.99);
      expect(frame.panel.top).toBeGreaterThanOrEqual(23.99);
      expect(frame.panel.left).toBeGreaterThanOrEqual(15.99);
      expect(frame.panel.left + frame.panel.width).toBeLessThanOrEqual(454.01);
      expect(frame.photo.top).toBeGreaterThanOrEqual(frame.panel.top);
      expect(frame.photo.top + frame.photo.height).toBeLessThanOrEqual(frame.timeline);
      expect(frame.photo.left).toBeGreaterThanOrEqual(frame.panel.left);
      expect(frame.photo.left + frame.photo.width).toBeLessThanOrEqual(frame.panel.left + frame.panel.width);
      expect(frame.textLeft + frame.textWidth).toBeLessThanOrEqual(frame.left + frame.size + 0.01);
      expect(frame.artist + settings.artistSize * frame.scale).toBeLessThan(frame.timeline);
      if (layout === 'vinyl') expect(frame.record.x + frame.record.radius).toBeCloseTo(frame.left + frame.size);
      if (layout === 'lyrics') expect(frame.photo.top).toBeGreaterThanOrEqual(frame.lyricTop + frame.lyricHeight);
    }
  });

  it('chooses ink against the panel surface while preserving wall ink and manual overrides', () => {
    const draft = { ...initialDraft, background: '#000000', player: { ...createPlayerSettings('mini'), panelColor: '#ffffff' } };
    expect(playerColors(draft)).toMatchObject({ foreground: '#faf9f6', contentForeground: '#232927' });
    expect(playerColors({ ...draft, player: { ...draft.player, panelOpacity: 0 } }).contentForeground).toBe('#faf9f6');
    expect(playerColors({ ...draft, player: { ...draft.player, foreground: '#abcdef' } }).contentForeground).toBe('#abcdef');
    const ambient = playerColors({ ...draft, palette: Array(5).fill('#ffffff'), player: createPlayerSettings('glass') });
    expect(luminance(ambient.start)).toBeLessThanOrEqual(0.2);
  });

  it('collapses optional note, progress and controls without moving the crop into text', () => {
    const settings = { ...createPlayerSettings('mini'), showExtra: true, extraText: '2026 · Our playlist' };
    const full = playerLayout(1020, settings, true);
    const plain = playerLayout(1020, { ...settings, showExtra: false, showProgress: false, controls: 'none' }, false);
    expect(plain.panel.height).toBeLessThan(full.panel.height);
    expect(plain.photo).toEqual(full.photo);
    const right = playerLayout(1020, { ...settings, artworkSide: 'right' }, true);
    expect(right.photo.left).toBeGreaterThan(right.textLeft + right.textWidth);
  });
});
