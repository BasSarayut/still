import type { Draft } from '../model';

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

export function line(context: CanvasRenderingContext2D, points: number[][]) {
  context.beginPath();
  points.forEach(([horizontal, vertical], index) => index ? context.lineTo(horizontal, vertical) : context.moveTo(horizontal, vertical));
  context.stroke();
}

export function triangle(context: CanvasRenderingContext2D, horizontal: number, vertical: number, size: number, direction = 1) {
  context.beginPath();
  context.moveTo(horizontal, vertical - size);
  context.lineTo(horizontal + size * 1.5 * direction, vertical);
  context.lineTo(horizontal, vertical + size);
  context.closePath();
  context.fill();
}

export function fitText(context: CanvasRenderingContext2D, value: string, horizontal: number, vertical: number, width: number, size: number, weight = 400) {
  context.font = `${weight} ${size}px ${fontFamily}`;
  let display = value;
  const characters = Array.from(value);
  while (context.measureText(display).width > width && characters.length) {
    characters.pop(); display = characters.join('') + '…';
  }
  context.fillText(display, horizontal, vertical);
}

export function titleText(context: CanvasRenderingContext2D, value: string, horizontal: number, vertical: number, width = 355) {
  let size = 25;
  context.font = `650 ${size}px ${fontFamily}`;
  while (size > 20 && context.measureText(value).width > width) {
    size--; context.font = `650 ${size}px ${fontFamily}`;
  }
  if (context.measureText(value).width <= width) {
    context.fillText(value, horizontal, vertical + 6);
    return;
  }
  const characters = Array.from(value);
  let first = '';
  while (characters.length && context.measureText(first + characters[0]).width < width) first += characters.shift();
  context.fillText(first, horizontal, vertical - 4);
  fitText(context, characters.join(''), horizontal, vertical + 22, width, size, 650);
}

export function roundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const path = new Path2D();
  path.moveTo(x + radius, y);
  path.arcTo(x + width, y, x + width, y + height, radius);
  path.arcTo(x + width, y + height, x, y + height, radius);
  path.arcTo(x, y + height, x, y, radius);
  path.arcTo(x, y, x + width, y, radius);
  path.closePath();
  return path;
}
