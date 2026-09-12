import { describe, expect, it } from 'vitest';
import { automaticForeground, cropRect, darkenForContrast, darkestColors, initialCrop, initialDraft, luminance, mixWithBlack, parseTime, progress, remaining, restoreDraft, validTimes } from './model';
import { devices } from './devices';
import { composition } from './renderer';

describe('wallpaper composition', () => {
  it('keeps artwork square and inside either portrait or landscape source at every zoom', () => {
    for (const [width, height] of [[1800, 900], [900, 1800]]) {
      for (const zoom of [1, 1.7, 4]) {
        for (const position of [-1, 0, 0.5, 1, 2]) {
          const crop = cropRect(width, height, { zoom, x: position, y: position });
          expect(crop.x).toBeGreaterThanOrEqual(0);
          expect(crop.y).toBeGreaterThanOrEqual(0);
          expect(crop.x + crop.size).toBeLessThanOrEqual(width);
          expect(crop.y + crop.size).toBeLessThanOrEqual(height);
        }
      }
    }
    expect(cropRect(1800, 900, initialCrop)).toEqual({ x: 450, y: 0, size: 900 });
  });
  it('leaves room for the palette, credit and lock-screen controls on every supported device', () => {
    for (const device of devices) {
      const height = device.height / device.width * 470;
      const frame = composition(height);
      expect(frame.top / height).toBeGreaterThan(0.24);
      expect(frame.top + frame.size + 254).toBeLessThan(height - 90);
    }
    expect(devices.find(device => device.name === 'iPhone 12 mini')).toMatchObject({ width: 1080, height: 2340 });
  });
});

describe('playback time', () => {
  it('rejects invalid times instead of exporting an impossible timeline', () => {
    for (const value of ['', '0:60', '-1:10', '1:1', '3:xx']) expect(parseTime(value)).toBeNull();
    expect(validTimes('2:00', '1:00')).toBe(false);
    expect(validTimes('0:00', '0:00')).toBe(false);
    expect(validTimes('4:18', '4:18')).toBe(true);
    expect(progress('0:42', '4:18')).toBeCloseTo(42 / 258);
  });
  it('shows time remaining as a negative countdown, like Apple Music', () => {
    expect(remaining('0:16', '3:38')).toBe('-3:22');
    expect(remaining('4:18', '4:18')).toBe('-0:00');
    expect(remaining('0:00', '0:59')).toBe('-0:59');
    expect(remaining('1:1', '4:18')).toBe('');
    expect(remaining('0:42', '')).toBe('');
  });
});

describe('colors and saved drafts', () => {
  it('chooses dark or light text based on contrast', () => {
    expect(automaticForeground('#ffffff')).toBe('#232927');
    expect(automaticForeground('#000000')).toBe('#faf9f6');
    expect(automaticForeground('#544a44')).toBe('#faf9f6');
  });
  it('recovers from missing, outdated and malformed local data', () => {
    expect(restoreDraft(null)).toEqual(initialDraft);
    expect(restoreDraft({ version: 99 })).toEqual(initialDraft);
    const draft = restoreDraft({ version: 1, title: '青色がすき。', background: 'broken', palette: ['oops'], crop: { zoom: 50, x: -2, y: 5 } });
    expect(draft.title).toBe('青色がすき。');
    expect(draft.background).toBe(initialDraft.background);
    expect(draft.palette).toEqual(initialDraft.palette);
    expect(draft.crop).toEqual({ zoom: 4, x: 0, y: 1 });
  });
  it('restores the Polaroid progress/pause visibility toggles, defaulting old drafts to both on', () => {
    expect(restoreDraft({ version: 1 })).toMatchObject({ showProgress: true, showPauseGlyph: true });
    expect(restoreDraft({ version: 1, showProgress: false, showPauseGlyph: false })).toMatchObject({ showProgress: false, showPauseGlyph: false });
  });
  it('defaults drafts saved before templates existed to the custom template, keeping old work unchanged', () => {
    expect(restoreDraft({ version: 1 }).templateId).toBe('custom');
    expect(restoreDraft({ version: 1, templateId: 'not-a-template' }).templateId).toBe('custom');
    expect(restoreDraft({ version: 1, templateId: 'nowPlaying' })).toMatchObject({ templateId: 'custom', player: { backgroundMode: 'photo', glyph: 'pause', timeDisplay: 'remaining' } });
    expect(restoreDraft({ version: 1, templateId: 'polaroid' }).templateId).toBe('polaroid');
  });
});

describe('nowPlaying template colors', () => {
  it('picks the two darkest palette colors, darkest first', () => {
    const palette = ['#dbded6', '#52656a', '#f3f1ec', '#8eaaa9', '#b7c9c6'];
    expect(darkestColors(palette)).toEqual(['#52656a', '#8eaaa9']);
    expect(darkestColors(['#123456'])).toEqual(['#123456', '#123456']);
  });
  it('mixes a color toward black without ever brightening it', () => {
    expect(mixWithBlack('#ffffff', 0)).toBe('#ffffff');
    expect(mixWithBlack('#ffffff', 1)).toBe('#000000');
    expect(mixWithBlack('#ffffff', 0.5)).toBe('#808080');
    expect(mixWithBlack('#8eaaa9', 2)).toBe('#000000');
  });
  it('darkens even a pale, near-white palette color enough to guarantee contrast with fixed light text', () => {
    expect(luminance(darkenForContrast('#ffffff', 0.035))).toBeLessThanOrEqual(0.035);
    expect(luminance(darkenForContrast('#f3f1ec', 0.09))).toBeLessThanOrEqual(0.09);
    // Already-dark colors are left alone rather than darkened further than necessary.
    expect(darkenForContrast('#101010', 0.09)).toBe('#101010');
  });
});
