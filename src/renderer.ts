import { automaticForeground, cropRect, progress, type Draft } from './model';
import type { Device } from './devices';

export const fontFamily = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Noto Sans Thai Variable", "Noto Sans JP Variable", sans-serif';
export const composition = (height: number) => ({ left: 33, top: height * 0.255, size: 404 });

export async function prepareFonts(draft: Draft) {
  const text = `${draft.title} ${draft.artist} ${draft.credit}`;
  const fonts: Promise<FontFace[]>[] = [];
  if (/[\u0E00-\u0E7F]/.test(text)) fonts.push(document.fonts.load('650 25px "Noto Sans Thai Variable"', text));
  if (/[\u3000-\u9FFF\uFF00-\uFFEF]/.test(text)) fonts.push(document.fonts.load('650 25px "Noto Sans JP Variable"', text));
  await Promise.all(fonts);
  await document.fonts.ready;
}

function line(context: CanvasRenderingContext2D, points: number[][]) {
  context.beginPath();
  points.forEach(([horizontal, vertical], index) => index ? context.lineTo(horizontal, vertical) : context.moveTo(horizontal, vertical));
  context.stroke();
}

function triangle(context: CanvasRenderingContext2D, horizontal: number, vertical: number, size: number, direction = 1) {
  context.beginPath();
  context.moveTo(horizontal, vertical - size);
  context.lineTo(horizontal + size * 1.5 * direction, vertical);
  context.lineTo(horizontal, vertical + size);
  context.closePath();
  context.fill();
}

function fitText(context: CanvasRenderingContext2D, value: string, horizontal: number, vertical: number, width: number, size: number, weight = 400) {
  context.font = `${weight} ${size}px ${fontFamily}`;
  let display = value;
  const characters = Array.from(value);
  while (context.measureText(display).width > width && characters.length) {
    characters.pop(); display = characters.join('') + '…';
  }
  context.fillText(display, horizontal, vertical);
}

function titleText(context: CanvasRenderingContext2D, value: string, horizontal: number, vertical: number) {
  let size = 25;
  context.font = `650 ${size}px ${fontFamily}`;
  while (size > 20 && context.measureText(value).width > 355) {
    size--; context.font = `650 ${size}px ${fontFamily}`;
  }
  if (context.measureText(value).width <= 355) {
    context.fillText(value, horizontal, vertical + 6);
    return;
  }
  const characters = Array.from(value);
  let first = '';
  while (characters.length && context.measureText(first + characters[0]).width < 355) first += characters.shift();
  context.fillText(first, horizontal, vertical - 4);
  fitText(context, characters.join(''), horizontal, vertical + 22, 355, size, 650);
}

export function renderWallpaper(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth = 940) {
  canvas.width = outputWidth;
  canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('เบราว์เซอร์นี้ไม่รองรับการสร้างรูป');
  const height = canvas.height / (outputWidth / 470);
  context.scale(outputWidth / 470, outputWidth / 470);
  context.fillStyle = draft.background;
  context.fillRect(0, 0, 470, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  const { left, top, size } = composition(height);
  const foreground = draft.foreground ?? automaticForeground(draft.background);

  if (image) {
    const crop = cropRect(image.naturalWidth, image.naturalHeight, draft.crop);
    context.drawImage(image, crop.x, crop.y, crop.size, crop.size, left, top, size, size);
  } else {
    context.fillStyle = foreground;
    context.globalAlpha = 0.045;
    context.fillRect(left, top, size, size);
    context.globalAlpha = 0.38;
    context.strokeStyle = foreground;
    context.lineWidth = 1.3;
    const center = top + size / 2 - 22;
    context.strokeRect(214, center - 15, 42, 34);
    context.beginPath(); context.arc(225, center - 5, 3.5, 0, Math.PI * 2); context.stroke();
    line(context, [[218, center + 12], [230, center + 2], [239, center + 9], [247, center + 3], [253, center + 12]]);
    context.textAlign = 'center';
    context.font = `15px ${fontFamily}`;
    context.fillText('ใส่รูปที่เป็นคุณ', 235, center + 53);
    context.font = `10px ${fontFamily}`;
    context.fillText('YOUR FAVORITE MOMENT', 235, center + 75);
    context.textAlign = 'left';
    context.globalAlpha = 1;
  }

  const bottom = top + size;
  context.fillStyle = foreground;
  context.strokeStyle = foreground;
  titleText(context, draft.title, left, bottom + 35);
  context.globalAlpha = 0.75;
  fitText(context, draft.artist, left, bottom + 68, size, 14, 500);
  context.save();
  context.translate(419, bottom + 28);
  context.lineWidth = 1.7;
  context.stroke(new Path2D('M8 14 C-7 4 0 -5 8 1 C16 -5 23 4 8 14 Z'));
  context.restore();

  const timeline = bottom + 85;
  context.globalAlpha = 0.25;
  context.fillRect(left, timeline, size, 1.5);
  context.globalAlpha = 0.9;
  const current = progress(draft.elapsed, draft.duration);
  context.fillRect(left, timeline, size * current, 1.5);
  context.beginPath(); context.arc(left + size * current, timeline + 0.75, 3.4, 0, Math.PI * 2); context.fill();
  context.globalAlpha = 0.72;
  context.font = `10px ${fontFamily}`;
  context.fillText(draft.elapsed, left, timeline + 18);
  context.textAlign = 'right'; context.fillText(draft.duration, left + size, timeline + 18); context.textAlign = 'left';

  const controls = bottom + 148;
  context.globalAlpha = 0.95;
  context.lineWidth = 2;
  context.beginPath(); context.arc(235, controls, 36, 0, Math.PI * 2); context.stroke();
  triangle(context, 229, controls, 10.5);
  triangle(context, 146, controls, 8, -1); context.fillRect(129, controls - 8, 2.5, 16);
  triangle(context, 322, controls, 8); context.fillRect(336, controls - 8, 2.5, 16);
  context.globalAlpha = 0.64;
  context.lineWidth = 1.8;
  context.lineCap = 'round'; context.lineJoin = 'round';
  line(context, [[59, controls - 6], [64, controls - 6], [74, controls + 6], [81, controls + 6]]);
  line(context, [[59, controls + 6], [64, controls + 6], [74, controls - 6], [81, controls - 6]]);
  line(context, [[78, controls - 9], [82, controls - 6], [78, controls - 3]]);
  line(context, [[78, controls + 3], [82, controls + 6], [78, controls + 9]]);
  line(context, [[398, controls - 6], [409, controls - 6], [409, controls + 5], [394, controls + 5], [394, controls - 3]]);
  line(context, [[405, controls - 10], [410, controls - 6], [405, controls - 2]]);

  if (draft.showPalette) {
    context.globalAlpha = 0.8;
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
    context.globalAlpha = 0.7; context.fillStyle = foreground;
    context.textAlign = 'center';
    fitText(context, draft.credit, 235, height - 72, size, 10);
  }
  context.globalAlpha = 1;
}
