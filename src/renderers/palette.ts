import type { PaletteSettings } from '../palette';
import { fontFamily, roundedRectPath } from './shared';

// Draws the decorative color palette shared by Music Player and Polaroid. `y` is the top anchor
// of the block (matching paletteFootprint's reservation); each style lays itself out below that
// point. `left`/`width` describe the available horizontal band, `ink` is the label/outline color.
export function renderPalette(context: CanvasRenderingContext2D, swatches: string[], left: number, width: number, y: number, settings: PaletteSettings, ink: string) {
  const count = swatches.length;
  if (!count) return;
  const sizeScale = settings.paletteSize / 100, gapScale = settings.paletteGap / 100, centerX = left + width / 2;
  context.save(); context.textAlign = 'center';
  if (settings.paletteStyle === 'strip') {
    context.fillStyle = ink; context.globalAlpha = 0.75; context.font = `${8 * sizeScale}px ${fontFamily}`;
    context.fillText('C O L O R   P A L E T T E', centerX, y + 8);
    const cell = width / count;
    swatches.forEach((color, index) => {
      context.globalAlpha = 1; context.fillStyle = color;
      context.fillRect(left + index * cell + cell * (1 - gapScale) / 2, y + 20, cell * gapScale, 6 * sizeScale);
      context.fillStyle = ink; context.globalAlpha = 0.75; context.font = `${6.5 * sizeScale}px ${fontFamily}`;
      context.fillText(color.toUpperCase(), left + (index + 0.5) * cell, y + 40 * sizeScale);
    });
  } else if (settings.paletteStyle === 'dots') {
    const gap = 25 * gapScale;
    swatches.forEach((color, index) => {
      context.globalAlpha = 1; context.fillStyle = color;
      context.beginPath(); context.arc(centerX + (index - (count - 1) / 2) * gap, y + 10, 7 * sizeScale, 0, Math.PI * 2); context.fill();
    });
  } else if (settings.paletteStyle === 'gradient') {
    const barWidth = Math.max(60, width * gapScale), barHeight = 10 * sizeScale;
    const gradient = context.createLinearGradient(centerX - barWidth / 2, 0, centerX + barWidth / 2, 0);
    swatches.forEach((color, index) => gradient.addColorStop(count === 1 ? 0 : index / (count - 1), color));
    context.globalAlpha = 1; context.fillStyle = gradient;
    context.fill(roundedRectPath(centerX - barWidth / 2, y + 6, barWidth, barHeight, barHeight / 2));
  } else if (settings.paletteStyle === 'numbered') {
    const cell = Math.min(42, width / count) * sizeScale, gap = 8 * gapScale;
    const total = cell * count + gap * (count - 1), start = centerX - total / 2;
    swatches.forEach((color, index) => {
      const x = start + index * (cell + gap);
      context.globalAlpha = 1; context.fillStyle = color; context.fill(roundedRectPath(x, y, cell, cell * 0.62, 4 * sizeScale));
      context.fillStyle = ink; context.globalAlpha = 0.7; context.font = `600 ${8 * sizeScale}px ${fontFamily}`;
      context.fillText(String(index + 1).padStart(2, '0'), x + cell / 2, y + cell * 0.62 + 13);
    });
  } else if (settings.paletteStyle === 'hero') {
    const hero = 30 * sizeScale, dot = 6 * sizeScale, gap = 15 * gapScale;
    context.globalAlpha = 1; context.fillStyle = swatches[0]; context.fill(roundedRectPath(left, y, hero, hero, 8 * sizeScale));
    swatches.slice(1).forEach((color, index) => {
      context.fillStyle = color; context.beginPath(); context.arc(left + hero + gap + index * gap, y + hero / 2, dot / 2, 0, Math.PI * 2); context.fill();
    });
  } else if (settings.paletteStyle === 'necklace') {
    const gap = 24 * gapScale, radius = 5.5 * sizeScale, total = (count - 1) * gap, start = centerX - total / 2;
    context.strokeStyle = ink; context.globalAlpha = 0.3; context.lineWidth = 1;
    context.beginPath(); context.moveTo(start, y + 8); context.lineTo(start + total, y + 8); context.stroke();
    swatches.forEach((color, index) => {
      context.globalAlpha = 1; context.fillStyle = color;
      context.beginPath(); context.arc(start + index * gap, y + 8, radius, 0, Math.PI * 2); context.fill();
    });
  } else {
    const bandWidth = 26 * sizeScale, bandHeight = 14 * gapScale;
    swatches.forEach((color, index) => { context.globalAlpha = 1; context.fillStyle = color; context.fillRect(centerX - bandWidth / 2, y + index * bandHeight, bandWidth, bandHeight); });
  }
  context.restore();
}
