import { automaticForeground, type Draft } from '../model';
import { albumPhotoFrame, coverCropRect, coverFonts, type CoverText } from '../albumCover';
import type { Device } from '../devices';
import { fontFamily } from './shared';

function drawText(context: CanvasRenderingContext2D, text: CoverText, height: number, ink: string) {
  if (!text.visible || !text.text) return;
  const x = text.x * 4.7;
  const y = text.y / 100 * height;
  const width = Math.min(text.width * 4.7, 470 - x);
  context.save();
  context.translate(x + width / 2, y);
  context.rotate(text.rotation * Math.PI / 180);
  context.translate(-x - width / 2, -y);
  context.beginPath(); context.rect(x, y, width, height - y); context.clip();
  context.font = `${text.italic ? 'italic ' : ''}${text.weight} ${text.size}px ${coverFonts[text.font]}`;
  context.letterSpacing = `${text.tracking}px`;
  context.textBaseline = 'top';
  context.textAlign = text.align;
  context.fillStyle = text.color ?? ink;
  context.globalAlpha = text.opacity;
  context.shadowColor = '#00000099'; context.shadowBlur = text.shadow; context.shadowOffsetY = text.shadow / 3;
  context.strokeStyle = '#000000'; context.lineWidth = text.stroke;
  const anchor = x + (text.align === 'center' ? width / 2 : text.align === 'right' ? width : 0);
  let lineIndex = 0;
  // Grapheme segmentation preserves Thai combining marks, Japanese, and emoji when wrapping.
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const paragraph of text.text.split('\n')) {
    let line = '';
    for (const { segment } of segmenter.segment(paragraph)) {
      if (line && context.measureText(line + segment).width > width) {
        if (text.stroke) context.strokeText(line, anchor, y + lineIndex * text.size * text.lineHeight);
        context.fillText(line, anchor, y + lineIndex++ * text.size * text.lineHeight);
        line = '';
      }
      line += segment;
    }
    if (text.stroke) context.strokeText(line, anchor, y + lineIndex * text.size * text.lineHeight);
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
  const cover = draft.albumCover;
  if (cover.backgroundMode === 'gradient') {
    const gradient = context.createLinearGradient(0, 0, 470, height);
    gradient.addColorStop(0, draft.background); gradient.addColorStop(1, cover.gradientColor);
    context.fillStyle = gradient; context.fillRect(0, 0, 470, height);
  }
  if (cover.backgroundMode === 'blur' && image) {
    context.save(); context.filter = 'blur(28px)'; context.globalAlpha = 0.65;
    const crop = coverCropRect(image.naturalWidth, image.naturalHeight, { x: 0.5, y: 0.5, zoom: 1 }, 470 / height);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, -60, -60, 590, height + 120); context.restore();
  }
  const frame = albumPhotoFrame(height, cover);
  context.save();
  const centerX = frame.left + frame.width / 2; const centerY = frame.top + frame.height / 2;
  context.translate(centerX, centerY); context.rotate(cover.photoRotation * Math.PI / 180); context.translate(-centerX, -centerY);
  context.globalAlpha = cover.photoOpacity;
  context.beginPath();
  if (cover.style === 'vinyl') context.arc(centerX, centerY, Math.min(frame.width, frame.height) / 2, 0, Math.PI * 2);
  else context.roundRect(frame.left, frame.top, frame.width, frame.height, Math.min(cover.photoRadius, frame.width / 2, frame.height / 2));
  if (cover.photoBorder) { context.strokeStyle = cover.decorationColor; context.lineWidth = cover.photoBorder * 2; context.stroke(); }
  context.clip();
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
  if (cover.style === 'vinyl') {
    const radius = Math.min(frame.width, frame.height) / 2;
    context.strokeStyle = '#00000055'; context.lineWidth = 2;
    for (let ring = radius * 0.42; ring < radius; ring += 5) { context.beginPath(); context.arc(centerX, centerY, ring, 0, Math.PI * 2); context.stroke(); }
    context.fillStyle = cover.decorationColor; context.beginPath(); context.arc(centerX, centerY, radius * 0.29, 0, Math.PI * 2); context.fill();
    context.fillStyle = draft.background; context.beginPath(); context.arc(centerX, centerY, 5, 0, Math.PI * 2); context.fill();
  }
  context.restore();
  if (cover.overlay) {
    const shade = context.createLinearGradient(0, height * 0.3, 0, height);
    shade.addColorStop(0, 'transparent'); shade.addColorStop(1, `rgba(0,0,0,${cover.overlay})`);
    context.fillStyle = shade; context.fillRect(0, 0, 470, height);
  }
  if (cover.fade) { context.fillStyle = `rgba(244,238,227,${cover.fade})`; context.fillRect(0, 0, 470, height); }
  if (cover.vignette) {
    const vignette = context.createRadialGradient(235, height / 2, 80, 235, height / 2, height * 0.65);
    vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, `rgba(0,0,0,${cover.vignette})`);
    context.fillStyle = vignette; context.fillRect(0, 0, 470, height);
  }
  if (cover.lightLeak) {
    const light = context.createRadialGradient(0, height * 0.35, 0, 0, height * 0.35, 450);
    light.addColorStop(0, `rgba(255,136,80,${cover.lightLeak})`); light.addColorStop(1, 'transparent');
    context.fillStyle = light; context.fillRect(0, 0, 470, height);
  }
  if (cover.grain) {
    let seed = 37;
    for (let dot = 0; dot < 12000; dot++) {
      seed = (seed * 1664525 + 1013904223) >>> 0; const horizontal = seed / 4294967296 * 470;
      seed = (seed * 1664525 + 1013904223) >>> 0; const vertical = seed / 4294967296 * height;
      context.fillStyle = dot % 2 ? `rgba(0,0,0,${cover.grain * 0.3})` : `rgba(255,255,255,${cover.grain * 0.45})`;
      context.fillRect(horizontal, vertical, 0.7, 0.7);
    }
  }
  context.save(); context.globalAlpha = cover.decorationOpacity; context.fillStyle = cover.decorationColor;
  if (cover.decoration === 'line') context.fillRect(28, height * 0.94, 414, 2);
  if (cover.decoration === 'tape') { context.translate(centerX, frame.top); context.rotate(-0.09); context.fillRect(-55, -9, 110, 24); }
  if (cover.decoration === 'label') { context.beginPath(); context.roundRect(350, height * 0.8, 86, 35, 6); context.fill(); }
  if (cover.decoration === 'film') {
    for (let slot = 0; slot < 10; slot++) { context.fillRect(frame.left + 6 + slot * (frame.width - 12) / 10, frame.top + 5, 14, 7); context.fillRect(frame.left + 6 + slot * (frame.width - 12) / 10, frame.top + frame.height - 12, 14, 7); }
  }
  context.restore();
  const ink = draft.foreground ?? automaticForeground(draft.background);
  for (const text of draft.albumCover.texts) drawText(context, text, height, ink);
}
