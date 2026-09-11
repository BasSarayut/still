import { cropRect, darkenForContrast, darkestColors, lightText, progress, remaining, type Draft } from '../model';
import type { Device } from '../devices';
import { composition, fitText, fontFamily, line, roundedRectPath, triangle } from './shared';

const radius = 18;

function star(context: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  context.beginPath();
  for (let index = 0; index < 5; index++) {
    const outerAngle = -Math.PI / 2 + index * (2 * Math.PI / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    const outer: [number, number] = [cx + size * Math.cos(outerAngle), cy + size * Math.sin(outerAngle)];
    const inner: [number, number] = [cx + size * 0.42 * Math.cos(innerAngle), cy + size * 0.42 * Math.sin(innerAngle)];
    if (index === 0) context.moveTo(...outer); else context.lineTo(...outer);
    context.lineTo(...inner);
  }
  context.closePath();
  context.stroke();
}

function moreDots(context: CanvasRenderingContext2D, cx: number, cy: number, gap: number) {
  for (const offset of [-gap, 0, gap]) {
    context.beginPath();
    context.arc(cx + offset, cy, 1.7, 0, Math.PI * 2);
    context.fill();
  }
}

export function renderNowPlaying(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const height = canvas.height / (outputWidth / 470);
  context.scale(outputWidth / 470, outputWidth / 470);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const { left, top, size } = composition(height);
  const foreground = lightText;
  const [darkest, second] = darkestColors(draft.palette);
  // Edge stays near-black regardless of the source photo; center keeps a little more of the
  // photo's color as a subtle glow, but never bright enough to threaten contrast with light text.
  const centerColor = darkenForContrast(second, 0.09);
  const edgeColor = darkenForContrast(darkest, 0.035);
  const cx = left + size / 2;
  const cy = top + size / 2;
  const backdrop = context.createRadialGradient(cx, cy, 0, cx, cy, Math.max(470, height) * 0.85);
  backdrop.addColorStop(0, centerColor);
  backdrop.addColorStop(1, edgeColor);
  context.fillStyle = backdrop;
  context.fillRect(0, 0, 470, height);

  const card = roundedRectPath(left, top, size, size, radius);
  context.save();
  context.shadowColor = 'rgba(0,0,0,0.45)';
  context.shadowBlur = 32;
  context.shadowOffsetY = 18;
  context.fillStyle = edgeColor;
  context.fill(card);
  context.restore();

  context.save();
  context.clip(card);
  if (image) {
    const crop = cropRect(image.naturalWidth, image.naturalHeight, draft.crop);
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, left, top, size, size);
  } else {
    context.fillStyle = foreground;
    context.globalAlpha = 0.08;
    context.fillRect(left, top, size, size);
    context.globalAlpha = 0.4;
    context.strokeStyle = foreground;
    context.lineWidth = 1.3;
    const center = top + size / 2 - 22;
    context.strokeRect(214, center - 15, 42, 34);
    context.beginPath(); context.arc(225, center - 5, 3.5, 0, Math.PI * 2); context.stroke();
    line(context, [[218, center + 12], [230, center + 2], [239, center + 9], [247, center + 3], [253, center + 12]]);
    context.textAlign = 'center';
    context.font = `15px ${fontFamily}`;
    context.fillText(emptyLabel, 235, center + 53);
    context.font = `10px ${fontFamily}`;
    context.fillText('YOUR FAVORITE MOMENT', 235, center + 75);
    context.textAlign = 'left';
    context.globalAlpha = 1;
  }
  context.restore();

  const bottom = top + size;
  const iconsRight = left + size;
  context.fillStyle = foreground;
  context.strokeStyle = foreground;

  context.globalAlpha = 1;
  fitText(context, draft.title, left, bottom + 33, size - 66, 21, 650);
  context.globalAlpha = 0.85;
  context.lineWidth = 1.6;
  star(context, iconsRight - 46, bottom + 27, 8);
  moreDots(context, iconsRight - 13, bottom + 27, 4);

  context.globalAlpha = 0.65;
  fitText(context, draft.artist, left, bottom + 58, size, 14, 500);
  context.globalAlpha = 1;

  const timeline = bottom + 90;
  const track = roundedRectPath(left, timeline, size, 3, 1.5);
  context.globalAlpha = 0.3;
  context.fillStyle = foreground;
  context.fill(track);
  const current = progress(draft.elapsed, draft.duration);
  context.globalAlpha = 0.95;
  context.fill(roundedRectPath(left, timeline, size * current, 3, 1.5));
  context.beginPath(); context.arc(left + size * current, timeline + 1.5, 4, 0, Math.PI * 2); context.fill();
  context.globalAlpha = 0.7;
  context.font = `10px ${fontFamily}`;
  context.fillText(draft.elapsed, left, timeline + 20);
  context.textAlign = 'right'; context.fillText(remaining(draft.elapsed, draft.duration), left + size, timeline + 20); context.textAlign = 'left';

  const controls = bottom + 148;
  context.globalAlpha = 0.9;
  context.fillRect(222, controls - 16, 9, 32);
  context.fillRect(239, controls - 16, 9, 32);
  triangle(context, 146, controls, 12, -1); context.fillRect(129, controls - 10, 3, 20);
  triangle(context, 322, controls, 12); context.fillRect(336, controls - 10, 3, 20);
  context.globalAlpha = 0.6;
  context.lineWidth = 1.8;
  context.lineCap = 'round'; context.lineJoin = 'round';
  line(context, [[59, controls - 6], [64, controls - 6], [74, controls + 6], [81, controls + 6]]);
  line(context, [[59, controls + 6], [64, controls + 6], [74, controls - 6], [81, controls - 6]]);
  line(context, [[78, controls - 9], [82, controls - 6], [78, controls - 3]]);
  line(context, [[78, controls + 3], [82, controls + 6], [78, controls + 9]]);
  line(context, [[398, controls - 6], [409, controls - 6], [409, controls + 5], [394, controls + 5], [394, controls - 3]]);
  line(context, [[405, controls - 10], [410, controls - 6], [405, controls - 2]]);

  if (draft.showPalette) {
    context.globalAlpha = 0.75;
    context.textAlign = 'center'; context.font = `8px ${fontFamily}`;
    context.fillText('C O L O R   P A L E T T E', 235, bottom + 217);
    const swatchWidth = size / 5;
    draft.palette.forEach((color, index) => {
      context.globalAlpha = 1;
      context.fillStyle = color;
      context.fillRect(left + index * swatchWidth, bottom + 234, swatchWidth, 6);
      context.fillStyle = foreground;
      context.globalAlpha = 0.75;
      context.font = `6.5px ${fontFamily}`;
      context.fillText(color.toUpperCase(), left + (index + 0.5) * swatchWidth, bottom + 254);
    });
  }
  if (draft.showCredit && draft.credit) {
    context.globalAlpha = 0.65; context.fillStyle = foreground;
    context.textAlign = 'center';
    fitText(context, draft.credit, 235, height - 72, size, 10);
  }
  context.globalAlpha = 1;
}
