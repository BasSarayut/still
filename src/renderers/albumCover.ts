import { automaticForeground, type Draft } from '../model';
import { coverCropRect, coverFonts, coverPhotoFrame, type CoverText } from '../albumCover';
import type { Device } from '../devices';
import { fontFamily } from './shared';

function drawText(context: CanvasRenderingContext2D, text: CoverText, height: number, ink: string) {
  if (!text.visible || !text.text) return;
  const x = text.x * 4.7;
  const y = text.y / 100 * height;
  const width = Math.min(text.width * 4.7, 470 - x);
  context.save();
  context.beginPath(); context.rect(x, y, width, height - y); context.clip();
  context.font = `${text.italic ? 'italic ' : ''}${text.weight} ${text.size}px ${coverFonts[text.font]}`;
  context.letterSpacing = `${text.tracking}px`;
  context.textBaseline = 'top';
  context.textAlign = text.align;
  context.fillStyle = text.color ?? ink;
  context.globalAlpha = text.opacity;
  const anchor = x + (text.align === 'center' ? width / 2 : text.align === 'right' ? width : 0);
  let lineIndex = 0;
  // Grapheme segmentation preserves Thai combining marks, Japanese, and emoji when wrapping.
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const paragraph of text.text.split('\n')) {
    let line = '';
    for (const { segment } of segmenter.segment(paragraph)) {
      if (line && context.measureText(line + segment).width > width) {
        context.fillText(line, anchor, y + lineIndex++ * text.size * text.lineHeight);
        line = '';
      }
      line += segment;
    }
    context.fillText(line, anchor, y + lineIndex++ * text.size * text.lineHeight);
  }
  context.restore();
}

export function renderAlbumCover(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const scale = outputWidth / 470;
  const height = canvas.height / scale;
  context.scale(scale, scale);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = draft.background;
  context.fillRect(0, 0, 470, height);
  const frame = coverPhotoFrame(height, draft.albumCover.split);
  if (image) {
    const crop = coverCropRect(image.naturalWidth, image.naturalHeight, draft.crop, frame.width / frame.height);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, frame.left, frame.top, frame.width, frame.height);
  } else {
    context.fillStyle = '#d8ddd7';
    context.fillRect(0, frame.top, frame.width, frame.height);
    context.fillStyle = '#536058';
    context.font = `13px ${fontFamily}`; context.textAlign = 'center';
    context.fillText(emptyLabel, 235, frame.top + frame.height / 2);
  }
  const ink = draft.foreground ?? automaticForeground(draft.background);
  for (const text of draft.albumCover.texts) drawText(context, text, height, ink);
}
