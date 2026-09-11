import { describe, expect, it } from 'vitest';
import { automaticForeground, cropRect, initialCrop, initialDraft, parseTime, progress, restoreDraft, validTimes } from './model';
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
});
