import { automaticForeground, cropRect, darkText, progress, type Draft } from '../model';
import type { Device } from '../devices';
import { composition, fitText, fontFamily, line, roundedRectPath } from './shared';

const framePad = 14;
const captionHeight = 122;
const radius = 16;
// The instant-film paper is always this fixed off-white, regardless of the user's chosen wall
// color behind it — a real Polaroid border doesn't change with the room it's pinned up in. Ink on
// that paper is therefore always dark; only text drawn directly on the customizable wall
// (palette label, credit) uses the user's foreground pick.
const framePaper = '#fffdf9';
const cardInk = darkText;

export function renderPolaroid(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const height = canvas.height / (outputWidth / 470);
  context.scale(outputWidth / 470, outputWidth / 470);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const wallInk = draft.foreground ?? automaticForeground(draft.background);
  context.fillStyle = draft.background;
  context.fillRect(0, 0, 470, height);

  const { left, top, size } = composition(height);
  const frameLeft = left - framePad;
  const frameTop = top - framePad;
  const frameWidth = size + framePad * 2;
  const frameHeight = framePad + size + captionHeight;
  const frame = roundedRectPath(frameLeft, frameTop, frameWidth, frameHeight, radius);

  context.save();
  context.shadowColor = 'rgba(0,0,0,0.28)';
  context.shadowBlur = 26;
  context.shadowOffsetY = 14;
  context.fillStyle = framePaper;
  context.fill(frame);
  context.restore();

  const photo = roundedRectPath(left, top, size, size, 4);
  context.save();
  context.clip(photo);
  if (image) {
    const crop = cropRect(image.naturalWidth, image.naturalHeight, draft.crop);
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, left, top, size, size);
  } else {
    context.fillStyle = cardInk;
    context.globalAlpha = 0.05;
    context.fillRect(left, top, size, size);
    context.globalAlpha = 0.4;
    context.strokeStyle = cardInk;
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
  context.fillStyle = cardInk;
  context.strokeStyle = cardInk;

  context.globalAlpha = 1;
  fitText(context, draft.title, left, bottom + 33, size - (draft.showPauseGlyph ? 56 : 0), 21, 700);
  if (draft.showPauseGlyph) {
    context.globalAlpha = 0.55;
    context.fillRect(iconsRight - 24, bottom + 16, 5, 20);
    context.fillRect(iconsRight - 14, bottom + 16, 5, 20);
  }

  context.globalAlpha = 0.6;
  fitText(context, draft.artist, left, bottom + 58, size - 56, 14, 500);
  context.globalAlpha = 1;

  if (draft.showProgress) {
    const timeline = bottom + 90;
    const track = roundedRectPath(left, timeline, size, 2.4, 1.2);
    context.globalAlpha = 0.18;
    context.fillStyle = cardInk;
    context.fill(track);
    const current = progress(draft.elapsed, draft.duration);
    context.globalAlpha = 0.9;
    context.fill(roundedRectPath(left, timeline, size * current, 2.4, 1.2));
    context.beginPath(); context.arc(left + size * current, timeline + 1.2, 3.6, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 0.55;
    context.font = `10px ${fontFamily}`;
    context.fillText(draft.elapsed, left, timeline + 18);
    context.textAlign = 'right'; context.fillText(draft.duration, left + size, timeline + 18); context.textAlign = 'left';
  }

  const frameBottom = frameTop + frameHeight;
  if (draft.showPalette) {
    context.globalAlpha = 0.75;
    context.fillStyle = wallInk;
    context.textAlign = 'center'; context.font = `8px ${fontFamily}`;
    context.fillText('C O L O R   P A L E T T E', 235, frameBottom + 34);
    const swatchWidth = size / draft.palette.length;
    draft.palette.forEach((color, index) => {
      context.globalAlpha = 1;
      context.fillStyle = color;
      context.fillRect(left + index * swatchWidth, frameBottom + 50, swatchWidth, 6);
      context.fillStyle = wallInk;
      context.globalAlpha = 0.75;
      context.font = `6.5px ${fontFamily}`;
      context.fillText(color.toUpperCase(), left + (index + 0.5) * swatchWidth, frameBottom + 70);
    });
  }
  if (draft.showCredit && draft.credit) {
    context.globalAlpha = 0.65; context.fillStyle = wallInk;
    context.textAlign = 'center';
    fitText(context, draft.credit, 235, height - 72, size, 10);
  }
  context.globalAlpha = 1;
}
