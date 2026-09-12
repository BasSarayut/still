import { cropRect, playerColors, progress, remaining, type Draft } from '../model';
import { coverFonts } from '../albumCover';
import { playerLayout } from '../musicPlayer';
import type { Device } from '../devices';
import { fitText, fontFamily, line, roundedRectPath, triangle } from './shared';

function textLines(context: CanvasRenderingContext2D, text: string, width: number, maxLines: number) {
  const segments = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment);
  const lines: string[] = [];
  let current = '';
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (context.measureText(current + segment).width > width && current) {
      if (lines.length === maxLines - 1) {
        while (current && context.measureText(current + '…').width > width) current = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(current), item => item.segment).slice(0, -1).join('');
        lines.push(current + '…'); return lines;
      }
      lines.push(current); current = '';
    }
    current += segment;
  }
  lines.push(current); return lines;
}

export function renderMusicPlayer(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const height = canvas.height / (outputWidth / 470);
  context.scale(outputWidth / 470, outputWidth / 470);
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  const settings = draft.player;
  const colors = playerColors(draft);
  const frame = playerLayout(height, settings, draft.showPalette);
  const { left, top, size } = frame;
  const foreground = colors.foreground;
  if (settings.backgroundMode === 'solid') context.fillStyle = colors.start;
  else {
    const angle = settings.gradientAngle * Math.PI / 180;
    const extent = Math.abs(470 * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    const dx = Math.sin(angle) * extent / 2, dy = -Math.cos(angle) * extent / 2;
    const gradient = settings.backgroundMode === 'photo'
      ? context.createRadialGradient(235, top + size / 2, 0, 235, top + size / 2, height * 0.85)
      : context.createLinearGradient(235 - dx, height / 2 - dy, 235 + dx, height / 2 + dy);
    gradient.addColorStop(0, colors.start); gradient.addColorStop(1, colors.end); context.fillStyle = gradient;
  }
  context.fillRect(0, 0, 470, height);
  const card = roundedRectPath(left, top, size, size, settings.artworkRadius);
  if (settings.artworkShadow > 0) {
    context.save(); context.shadowColor = `rgba(0,0,0,${settings.artworkShadow / 100})`;
    context.shadowBlur = 32; context.shadowOffsetY = 18; context.fillStyle = colors.end; context.fill(card); context.restore();
  }
  context.save(); context.clip(card);
  if (image) {
    const crop = cropRect(image.naturalWidth, image.naturalHeight, draft.crop);
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, left, top, size, size);
  } else {
    context.fillStyle = foreground; context.globalAlpha = 0.06; context.fillRect(left, top, size, size);
    context.globalAlpha = 0.4; context.textAlign = 'center'; context.font = `15px ${fontFamily}`;
    context.fillText(emptyLabel, 235, top + size / 2);
    context.font = `10px ${fontFamily}`; context.fillText('YOUR FAVORITE MOMENT', 235, top + size / 2 + 25);
  }
  context.restore(); context.fillStyle = foreground; context.strokeStyle = foreground;

  context.textBaseline = 'top'; context.textAlign = settings.align;
  const textWidth = size - (settings.showFavorite ? 38 : 0);
  const anchor = settings.align === 'center' ? 235 : left;
  context.font = `${settings.titleWeight} ${settings.titleSize}px ${coverFonts[settings.titleFont]}`;
  const title = textLines(context, draft.title, settings.align === 'center' && settings.showFavorite ? size - 76 : textWidth, 2);
  context.fillStyle = settings.titleColor ?? foreground;
  title.forEach((text, index) => context.fillText(text, anchor, frame.title + (frame.titleHeight - title.length * settings.titleSize * 1.12) / 2 + index * settings.titleSize * 1.12));
  context.font = `${settings.artistWeight} ${settings.artistSize}px ${coverFonts[settings.artistFont]}`;
  context.fillStyle = settings.artistColor ?? foreground; context.globalAlpha = settings.artistColor ? 1 : 0.72;
  context.fillText(textLines(context, draft.artist, size, 1)[0], anchor, frame.artist);
  context.globalAlpha = 1; context.textBaseline = 'alphabetic'; context.textAlign = 'left'; context.fillStyle = foreground;
  if (settings.showFavorite) {
    context.save(); context.translate(left + size - 22, frame.title + frame.titleHeight / 2 - 5); context.lineWidth = 1.6;
    context.stroke(new Path2D('M8 14 C-7 4 0 -5 8 1 C16 -5 23 4 8 14 Z')); context.restore();
  }
  if (settings.showProgress) {
    context.globalAlpha = 0.25; context.fill(roundedRectPath(left, frame.timeline, size, 2.5, 1.25));
    context.globalAlpha = 0.9;
    const current = progress(draft.elapsed, draft.duration);
    context.fillRect(left, frame.timeline, size * current, 2.5);
    context.beginPath(); context.arc(left + size * current, frame.timeline + 1.25, 3.5, 0, Math.PI * 2); context.fill();
    if (settings.showTimes) {
      context.globalAlpha = 0.72; context.font = `10px ${fontFamily}`;
      context.fillText(draft.elapsed, left, frame.timeline + 20); context.textAlign = 'right';
      context.fillText(settings.timeDisplay === 'remaining' ? remaining(draft.elapsed, draft.duration) : draft.duration, left + size, frame.timeline + 20); context.textAlign = 'left';
    }
  }
  if (settings.controls !== 'none') {
    context.save(); context.globalAlpha = 0.95; context.translate(235, frame.controls); context.scale(settings.controlsScale, settings.controlsScale);
    context.lineWidth = 1.8;
    if (settings.buttonStyle === 'circle') { context.beginPath(); context.arc(0, 0, 32, 0, Math.PI * 2); context.stroke(); }
    if (settings.glyph === 'play') triangle(context, -6, 0, 11);
    else { context.fillRect(-11, -13, 7, 26); context.fillRect(4, -13, 7, 26); }
    triangle(context, -75, 0, 9, -1); context.fillRect(-93, -9, 2.5, 18);
    triangle(context, 75, 0, 9); context.fillRect(90, -9, 2.5, 18);
    if (settings.controls === 'full') {
      context.globalAlpha = 0.65; context.lineCap = 'round'; context.lineJoin = 'round';
      line(context, [[-144, -6], [-139, -6], [-129, 6], [-122, 6]]);
      line(context, [[-144, 6], [-139, 6], [-129, -6], [-122, -6]]);
      line(context, [[-125, -9], [-121, -6], [-125, -3]]);
      line(context, [[-125, 3], [-121, 6], [-125, 9]]);
      line(context, [[127, -6], [142, -6], [142, 6], [127, 6], [127, 0]]);
      line(context, [[138, -10], [142, -6], [138, -2]]);
    }
    context.restore();
  }
  if (draft.showPalette) {
    context.textAlign = 'center';
    if (settings.paletteStyle === 'dots') {
      draft.palette.forEach((color, index) => { context.fillStyle = color; context.globalAlpha = 1; context.beginPath(); context.arc(235 + (index - 2) * 25, frame.palette + 10, 7, 0, Math.PI * 2); context.fill(); });
    } else {
      context.fillStyle = foreground; context.globalAlpha = 0.75; context.font = `8px ${fontFamily}`;
      context.fillText('C O L O R   P A L E T T E', 235, frame.palette + 8);
      draft.palette.forEach((color, index) => {
        context.globalAlpha = 1; context.fillStyle = color; context.fillRect(left + index * size / 5, frame.palette + 20, size / 5, 6);
        context.fillStyle = foreground; context.globalAlpha = 0.75; context.font = `6.5px ${fontFamily}`;
        context.fillText(color.toUpperCase(), left + (index + 0.5) * size / 5, frame.palette + 40);
      });
    }
  }
  if (draft.showCredit && draft.credit) {
    context.globalAlpha = 0.7; context.fillStyle = foreground; context.textAlign = 'center'; fitText(context, draft.credit, 235, height - 72, size, 10);
  }
  context.globalAlpha = 1;
}
