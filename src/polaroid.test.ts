import { describe, expect, it } from 'vitest';
import { devices } from './devices';
import { initialDraft, restoreDraft } from './model';
import { createPolaroidSettings, photoDragDelta, polaroidLayout, restorePolaroidSettings, type PolaroidPreset } from './polaroid';
import { paletteFootprint } from './palette';

describe('customizable Polaroid', () => {
  it('migrates old paper drafts without losing the image, content, crop, or playback choices', () => {
    const image = new Blob(['image'], { type: 'image/png' });
    const draft = restoreDraft({ version: 1, templateId: 'polaroid', image, title: '思い出', crop: { zoom: 2, x: 0.2, y: 0.8 }, showProgress: false, showPauseGlyph: false });
    expect(draft).toMatchObject({ image, title: '思い出', crop: { zoom: 2, x: 0.2, y: 0.8 }, polaroid: { paper: '#fffdf9', photoFormat: 'square', showProgress: false, showPauseGlyph: false } });
    const custom = { ...createPolaroidSettings('diary'), stamp: 'ความทรงจำ', paper: '#c0ffee', rotation: 8 };
    expect(restoreDraft({ ...initialDraft, polaroid: custom }).polaroid).toEqual(custom);
  });

  it('rejects malformed settings and clamps unsafe geometry', () => {
    expect(restorePolaroidSettings(null)).toEqual(createPolaroidSettings());
    const result = restorePolaroidSettings({ photoWidth: Infinity, rotation: 90, padding: -20, titleSize: 500, photoFormat: 'broken', paper: 'red', ink: '#eeeeee', titleFont: 'toString', showStamp: 'yes', stamp: 'x'.repeat(100), texture: 'melted', textureAmount: 999, photoCorners: 'yes' });
    expect(result).toMatchObject({ photoWidth: 404, rotation: 10, padding: 8, titleSize: 32, photoFormat: 'square', paper: '#fffdf9', ink: '#eeeeee', titleFont: 'sans', showStamp: false, texture: 'smooth', textureAmount: 60, photoCorners: false });
    expect(result.stamp).toHaveLength(80);
  });

  it('accepts the shared handwritten font and paper texture settings', () => {
    const result = restorePolaroidSettings({ titleFont: 'handwritten', artistFont: 'handwritten', texture: 'aged', textureAmount: 40, photoCorners: true });
    expect(result).toMatchObject({ titleFont: 'handwritten', artistFont: 'handwritten', texture: 'aged', textureAmount: 40, photoCorners: true });
  });

  it('fits every preset and extreme card settings with space for captions, palette and credit', () => {
    const presets: PolaroidPreset[] = ['classic', 'clean', 'diary', 'cinema', 'noir', 'postcard', 'scrapbook', 'formal'];
    for (const device of devices) for (const preset of presets) for (const extreme of [false, true]) {
      const settings = createPolaroidSettings(preset);
      if (extreme) Object.assign(settings, { photoWidth: 404, padding: 36, rotation: 10, position: 50, captionHeight: 80, titleSize: 32, artistSize: 22, showStamp: true, showProgress: true });
      const height = 470 * device.height / device.width;
      const frame = polaroidLayout(height, settings, true);
      expect(frame.boundLeft).toBeGreaterThanOrEqual(15);
      expect(frame.boundRight).toBeLessThanOrEqual(455);
      expect(frame.boundTop).toBeGreaterThanOrEqual(31.99);
      expect(frame.paletteY + paletteFootprint(settings)).toBeLessThan(height - 100);
      if (settings.showProgress) expect(frame.timelineY + (settings.showTimes ? 24 : 8)).toBeLessThan(frame.cardHeight);
      expect(frame.width / frame.height).toBeCloseTo(frame.ratio);
    }
  });

  it('still leaves room for every palette style at maximum count, size and spacing', () => {
    const styles = ['strip', 'dots', 'gradient', 'ribbon', 'necklace', 'numbered', 'hero'] as const;
    for (const device of devices) for (const paletteStyle of styles) {
      const settings = { ...createPolaroidSettings(), paletteStyle, paletteCount: 6, paletteSize: 160, paletteGap: 160 };
      const height = 470 * device.height / device.width;
      const frame = polaroidLayout(height, settings, true);
      expect(frame.boundTop).toBeGreaterThanOrEqual(31.99);
      expect(frame.paletteY + paletteFootprint(settings)).toBeLessThan(height - 100);
    }
  });

  it('maps screen drag back into photo coordinates on a tilted card', () => {
    for (const angle of [-10, -5, 0, 8, 10]) {
      const radians = angle * Math.PI / 180;
      const result = photoDragDelta(30 * Math.cos(radians), 30 * Math.sin(radians), angle);
      expect(result.x).toBeCloseTo(30); expect(result.y).toBeCloseTo(0);
    }
  });
});
