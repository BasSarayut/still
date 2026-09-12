import { describe, expect, it } from 'vitest';
import { createPlayerSettings, playerLayout, restorePlayerSettings } from './musicPlayer';
import { initialDraft, luminance, playerColors, restoreDraft } from './model';
import { devices } from './devices';

describe('unified player migration', () => {
  it('migrates old dark and classic drafts without losing content, photo, crop or colors', () => {
    const image = new Blob(['photo']);
    const content = { version: 1, title: 'เพลงเดิม', artist: 'Artist', image, crop: { zoom: 2, x: 0.2, y: 0.8 }, background: '#123456', foreground: '#abcdef', showPalette: false };
    const dark = restoreDraft({ ...content, templateId: 'nowPlaying' });
    expect(dark).toMatchObject({ ...content, templateId: 'custom' });
    expect(dark.player).toEqual(createPlayerSettings('dark'));
    const classic = restoreDraft({ ...content, templateId: 'custom' });
    expect(classic.player.foreground).toBe('#abcdef');
    expect(classic.player.backgroundMode).toBe('solid');
    expect(restoreDraft(dark).player).toEqual(dark.player);
    expect(restoreDraft(classic).player).toEqual(classic.player);
    expect(restoreDraft(dark)).toMatchObject(content);
  });
  it('bounds corrupt saved settings while retaining valid choices', () => {
    expect(restorePlayerSettings({ artworkSize: 99999, position: -10, titleSize: NaN, artworkRadius: Infinity, controls: 'invalid', showProgress: false, titleFont: '__proto__', foreground: 'red' })).toMatchObject({ artworkSize: 420, position: 15, titleSize: 25, artworkRadius: 0, controls: 'full', showProgress: false, titleFont: 'sans', foreground: null });
    const settings = { ...createPlayerSettings('minimal'), titleFont: 'thai' as const, artistColor: '#123456', controlsScale: 0.75 };
    expect(restorePlayerSettings(settings)).toEqual(settings);
  });
});

describe('player layout and colors', () => {
  it('keeps large text, photos and all decorations inside every device at extreme positions', () => {
    for (const device of devices) for (const position of [15, 25.5, 42]) for (const controls of ['full', 'compact', 'none'] as const) for (const showProgress of [false, true]) {
      const height = device.height / device.width * 470;
      const settings = { ...createPlayerSettings(), position, controls, showProgress, artworkSize: 420, gap: 48, titleSize: 38, artistSize: 24, controlsScale: 1.3 };
      const layout = playerLayout(height, settings, true);
      expect(layout.top).toBeGreaterThanOrEqual(24);
      expect(layout.bottom).toBeLessThanOrEqual(height - 100 + 0.001);
      expect(layout.artist).toBeCloseTo(layout.title + layout.titleHeight);
      expect(layout.timeline).toBeGreaterThan(layout.artist + settings.artistSize);
      expect(layout.left).toBeGreaterThanOrEqual(0);
      expect(layout.left + layout.size).toBeLessThanOrEqual(470);
    }
  });
  it('keeps the dark preset dark even with a bright image, but allows manual ink', () => {
    const draft = { ...initialDraft, palette: Array(5).fill('#ffffff'), player: createPlayerSettings('dark') };
    const colors = playerColors(draft);
    expect(luminance(colors.start)).toBeLessThanOrEqual(0.09);
    expect(luminance(colors.end)).toBeLessThanOrEqual(0.035);
    expect(colors.foreground).toBe('#faf9f6');
    expect(playerColors({ ...draft, player: { ...draft.player, foreground: '#123456' } }).foreground).toBe('#123456');
  });
});
