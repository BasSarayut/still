import { automaticForeground, progress, type Draft } from '../model';
import { coverCropRect, coverFonts } from '../albumCover';
import { polaroidLayout } from '../polaroid';
import type { Device } from '../devices';
import { fitText, fontFamily, roundedRectPath } from './shared';

function caption(context: CanvasRenderingContext2D, text: string, x: number, y: number, width: number) {
  const characters = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment);
  let display = text;
  while (context.measureText(display).width > width && characters.length) {
    characters.pop(); display = characters.join('') + '…';
  }
  context.fillText(display, x, y);
}

export function renderPolaroid(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const height = canvas.height / (outputWidth / 470);
  context.scale(outputWidth / 470, outputWidth / 470);
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  const settings = draft.polaroid;
  const layout = polaroidLayout(height, settings, draft.showPalette);
  const wallInk = draft.foreground ?? automaticForeground(draft.background);
  const ink = settings.ink ?? automaticForeground(settings.paper);
  context.fillStyle = draft.background; context.fillRect(0, 0, 470, height);
  if (settings.wallPattern !== 'none') {
    context.save(); context.globalAlpha = 0.09; context.strokeStyle = wallInk; context.fillStyle = wallInk; context.lineWidth = 0.6;
    if (settings.wallPattern === 'grid') {
      context.beginPath();
      for (let x = 0; x <= 470; x += 24) { context.moveTo(x, 0); context.lineTo(x, height); }
      for (let y = 0; y <= height; y += 24) { context.moveTo(0, y); context.lineTo(470, y); }
      context.stroke();
    } else for (let x = 12; x < 470; x += 24) for (let y = 12; y < height; y += 24) {
      context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  }
  context.save();
  context.translate(layout.centerX, layout.centerY); context.rotate(layout.angle); context.scale(layout.scale, layout.scale);
  context.translate(-layout.cardWidth / 2, -layout.cardHeight / 2);
  const frame = roundedRectPath(0, 0, layout.cardWidth, layout.cardHeight, settings.radius);
  context.save();
  context.shadowColor = `rgba(0,0,0,${settings.shadow / 100})`; context.shadowBlur = 26 * outputWidth / 470; context.shadowOffsetY = 14 * outputWidth / 470;
  context.fillStyle = settings.paper; context.fill(frame); context.restore();
  context.save(); context.clip(frame);
  const pad = settings.padding, width = settings.photoWidth;
  context.save(); context.clip(roundedRectPath(pad, pad, width, layout.photoHeight, settings.photoRadius));
  if (image) {
    const crop = coverCropRect(image.naturalWidth, image.naturalHeight, draft.crop, layout.ratio);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, pad, pad, width, layout.photoHeight);
  } else {
    context.fillStyle = ink; context.globalAlpha = 0.05; context.fillRect(pad, pad, width, layout.photoHeight);
    context.globalAlpha = 0.4; context.textAlign = 'center'; context.font = `15px ${fontFamily}`;
    caption(context, emptyLabel, layout.cardWidth / 2, pad + layout.photoHeight / 2, width - 24);
    context.font = `9px ${fontFamily}`; caption(context, 'YOUR FAVORITE MOMENT', layout.cardWidth / 2, pad + layout.photoHeight / 2 + 24, width - 24);
  }
  context.restore();
  context.textBaseline = 'top'; context.textAlign = settings.align;
  const titleWidth = width - (settings.showPauseGlyph ? 42 : 0);
  const anchor = (available: number) => settings.align === 'center' ? pad + available / 2 : settings.align === 'right' ? pad + available : pad;
  context.fillStyle = settings.titleColor ?? ink;
  context.font = `${settings.titleItalic ? 'italic ' : ''}${settings.titleWeight} ${settings.titleSize}px ${coverFonts[settings.titleFont]}`;
  caption(context, draft.title, anchor(titleWidth), layout.titleY, titleWidth);
  if (settings.showPauseGlyph) {
    context.fillStyle = ink; context.globalAlpha = 0.6;
    context.fillRect(pad + width - 24, layout.titleY + 2, 5, 20); context.fillRect(pad + width - 14, layout.titleY + 2, 5, 20);
    context.globalAlpha = 1;
  }
  context.fillStyle = settings.artistColor ?? ink; context.globalAlpha = settings.artistColor ? 1 : 0.65;
  context.font = `${settings.artistItalic ? 'italic ' : ''}${settings.artistWeight} ${settings.artistSize}px ${coverFonts[settings.artistFont]}`;
  caption(context, draft.artist, anchor(width), layout.artistY, width);
  context.globalAlpha = 1; context.fillStyle = ink;
  if (settings.showStamp && settings.stamp) {
    context.font = `10px ${coverFonts.mono}`; context.globalAlpha = 0.65;
    caption(context, settings.stamp, anchor(width), layout.stampY, width); context.globalAlpha = 1;
  }
  if (settings.showProgress) {
    context.globalAlpha = 0.18; context.fill(roundedRectPath(pad, layout.timelineY, width, 2.4, 1.2));
    const current = progress(draft.elapsed, draft.duration);
    context.globalAlpha = 0.9;
    if (current > 0) context.fillRect(pad, layout.timelineY, width * current, 2.4);
    context.beginPath(); context.arc(pad + width * current, layout.timelineY + 1.2, 3.6, 0, Math.PI * 2); context.fill();
    if (settings.showTimes) {
      context.globalAlpha = 0.55; context.font = `10px ${fontFamily}`;
      context.textAlign = 'left'; context.fillText(draft.elapsed, pad, layout.timelineY + 10);
      context.textAlign = 'right'; context.fillText(draft.duration, pad + width, layout.timelineY + 10);
    }
  }
  context.restore();
  if (settings.tape !== 'none') {
    const tape = (x: number, angle: number) => {
      context.save(); context.translate(x, 2); context.rotate(angle); context.globalAlpha = 0.82; context.fillStyle = settings.tapeColor;
      context.fillRect(-43, -12, 86, 24);
      context.globalAlpha = 0.12; context.strokeStyle = automaticForeground(settings.tapeColor); context.lineWidth = 0.6;
      for (let i = -36; i < 40; i += 8) { context.beginPath(); context.moveTo(i, -10); context.lineTo(i - 5, 10); context.stroke(); }
      context.restore();
    };
    if (settings.tape === 'top') tape(layout.cardWidth / 2, -0.08);
    else { tape(28, -0.55); tape(layout.cardWidth - 28, 0.55); }
  }
  context.restore();
  if (draft.showPalette) {
    context.save(); context.textAlign = 'center'; context.fillStyle = wallInk; context.globalAlpha = 0.75;
    const width = Math.min(360, layout.width), left = (470 - width) / 2;
    if (settings.paletteStyle === 'strip') {
      context.font = `8px ${fontFamily}`; context.fillText('C O L O R   P A L E T T E', 235, layout.paletteY);
      draft.palette.forEach((color, index) => {
        const swatchWidth = width / draft.palette.length;
        context.globalAlpha = 1; context.fillStyle = color; context.fillRect(left + index * swatchWidth, layout.paletteY + 16, swatchWidth, 6);
        context.globalAlpha = 0.75; context.fillStyle = wallInk; context.font = `6.5px ${fontFamily}`;
        context.fillText(color.toUpperCase(), left + (index + 0.5) * swatchWidth, layout.paletteY + 36);
      });
    } else draft.palette.forEach((color, index) => {
      context.globalAlpha = 1; context.fillStyle = color;
      context.beginPath(); context.arc(235 + (index - (draft.palette.length - 1) / 2) * 22, layout.paletteY, 6, 0, Math.PI * 2); context.fill();
    });
    context.restore();
  }
  if (draft.showCredit && draft.credit) {
    context.globalAlpha = 0.65; context.fillStyle = wallInk; context.textAlign = 'center';
    fitText(context, draft.credit, 235, height - 72, 380, 10);
  }
  context.globalAlpha = 1;
}
