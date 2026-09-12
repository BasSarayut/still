import { describe, expect, it } from 'vitest';
import { applyCoverPreset, coverCropRect, coverPhotoFrame, createAlbumCover, restoreAlbumCover, type CoverPreset } from './albumCover';
import { restoreDraft } from './model';

const presets: CoverPreset[] = ['classic', 'poster', 'cassette', 'vinyl', 'zine'];

describe('album cover drafts', () => {
  it('preserves old work and restores independently editable cover text', () => {
    const old = restoreDraft({ version: 1, title: 'Existing song', templateId: 'polaroid' });
    expect(old.title).toBe('Existing song');
    expect(old.templateId).toBe('polaroid');
    expect(old.albumCover).toEqual(createAlbumCover());
    const cover = createAlbumCover();
    cover.format = 'phone'; cover.split = 64;
    cover.texts[0] = { ...cover.texts[0], text: 'เพลงของเรา\n私たちの歌', font: 'thai', size: 28, color: '#123456', visible: false, x: 20, opacity: 0.5 };
    const restored = restoreDraft({ version: 1, templateId: 'albumCover', albumCover: cover });
    expect(restored.templateId).toBe('albumCover');
    expect(restored.albumCover).toMatchObject({ format: 'phone', split: 64, texts: [expect.objectContaining({ text: 'เพลงของเรา\n私たちの歌', font: 'thai', size: 28, color: '#123456', visible: false, x: 20, opacity: 0.5 }), ...cover.texts.slice(1).map(({ id: _id, ...text }) => expect.objectContaining(text))] });
    expect(restoreAlbumCover({ texts: [] }).texts).toEqual([]);
  });

  it('bounds malformed saved settings and rejects invalid text fields without throwing', () => {
    const cover = restoreAlbumCover({ format: 'unknown', split: Infinity, texts: [null, { text: 42, font: '__proto__', color: 'red', size: 999, x: -10, y: NaN, width: 0, lineHeight: -8, opacity: 90 }] });
    expect(cover.format).toBe('square'); expect(cover.split).toBe(50);
    expect(cover.texts).toHaveLength(1);
    expect(cover.texts[0]).toMatchObject({ text: '', font: 'sans', color: null, size: 80, x: 0, y: 8, width: 5, lineHeight: 0.8, opacity: 1 });
    expect(restoreAlbumCover({ texts: Array(30).fill({}) }).texts).toHaveLength(12);
  });
});

describe('album cover presets', () => {
  it('gives every preset its own split ratio and four styled, non-empty text roles', () => {
    const seen = new Set<number>();
    for (const preset of presets) {
      const cover = createAlbumCover(preset);
      expect(cover.texts.map(text => text.id)).toEqual(['artist', 'title', 'credits', 'note']);
      for (const text of cover.texts) expect(text.text.trim()).not.toBe('');
      seen.add(cover.split);
    }
    expect(seen.size).toBe(presets.length);
  });

  it('resets style and split but preserves each role\'s text and visibility, plus untouched custom blocks', () => {
    const current = createAlbumCover('classic');
    current.texts[0] = { ...current.texts[0], text: 'My Artist', visible: false, size: 40 };
    current.texts.push({ ...current.texts[1], id: 'custom-1', text: 'Hand-picked line', font: 'mono', size: 33 });
    const next = applyCoverPreset(current, 'poster');
    const target = createAlbumCover('poster');
    expect(next.split).toBe(target.split);
    expect(next.texts[0]).toMatchObject({ id: 'artist', text: 'My Artist', visible: false, size: target.texts[0].size, font: target.texts[0].font });
    expect(next.texts[1]).toMatchObject({ id: 'title', text: current.texts[1].text, visible: true, size: target.texts[1].size });
    expect(next.texts.find(text => text.id === 'custom-1')).toEqual(current.texts.find(text => text.id === 'custom-1'));
  });

  it('restores presets\' full range of style values within bounds without clamping them', () => {
    for (const preset of presets) {
      const restored = restoreAlbumCover(createAlbumCover(preset));
      expect(restored).toEqual(createAlbumCover(preset));
    }
  });
});

describe('cover photo geometry', () => {
  it('fills every split and aspect without stretching or sampling outside the image', () => {
    for (const [width, height] of [[1800, 800], [800, 1800], [1200, 1200]]) {
      for (const canvasHeight of [470, 1022]) for (const split of [20, 50, 80]) {
        const frame = coverPhotoFrame(canvasHeight, split);
        expect(frame.top + frame.height).toBeCloseTo(canvasHeight);
        for (const zoom of [1, 2.5, 4]) for (const x of [0, 0.5, 1]) for (const y of [0, 0.5, 1]) {
          const crop = coverCropRect(width, height, { zoom, x, y }, frame.width / frame.height);
          expect(crop.width / crop.height).toBeCloseTo(frame.width / frame.height);
          expect(crop.x).toBeGreaterThanOrEqual(0); expect(crop.y).toBeGreaterThanOrEqual(0);
          expect(crop.x + crop.width).toBeLessThanOrEqual(width + 0.00001);
          expect(crop.y + crop.height).toBeLessThanOrEqual(height + 0.00001);
        }
      }
    }
  });
});
