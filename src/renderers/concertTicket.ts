import { automaticForeground, type Draft } from '../model';
import { coverCropRect, coverFonts } from '../albumCover';
import { ticketLayout, type TicketField, type TicketRect } from '../concertTicket';
import type { Device } from '../devices';
import { fontFamily } from './shared';

function textLines(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(paragraph)) {
      if (line && context.measureText(line + segment).width > width) { lines.push(line.trimEnd()); line = ''; }
      line += segment;
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

function drawText(context: CanvasRenderingContext2D, value: string, box: TicketRect, size: number, font: string, weight: number, align: CanvasTextAlign = 'left', maxLines = 1, shrink = false) {
  let actualSize = size;
  context.font = `${weight} ${actualSize}px ${font}`;
  let lines = textLines(context, value, box.width);
  while (shrink && lines.length > maxLines && actualSize > Math.max(12, size * 0.65)) {
    actualSize--; context.font = `${weight} ${actualSize}px ${font}`; lines = textLines(context, value, box.width);
  }
  if (lines.length > maxLines) {
    let last = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(lines[maxLines - 1]), item => item.segment);
    while (last.length && context.measureText(last.join('') + '…').width > box.width) last = last.slice(0, -1);
    lines[maxLines - 1] = last.join('') + '…';
  }
  context.textBaseline = 'top'; context.textAlign = align;
  const x = align === 'center' ? box.x + box.width / 2 : align === 'right' ? box.x + box.width : box.x;
  lines.slice(0, maxLines).forEach((line, index) => context.fillText(line, x, box.y + index * actualSize * 1.35));
}

export function renderConcertTicket(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth: number, emptyLabel: string) {
  canvas.width = outputWidth; canvas.height = Math.round(outputWidth * device.height / device.width);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvasError');
  const unit = outputWidth / 470, height = canvas.height / unit;
  context.scale(unit, unit); context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
  const settings = draft.concertTicket, layout = ticketLayout(height, settings);
  const ink = settings.ink ?? automaticForeground(settings.paper), stubInk = settings.ink ?? automaticForeground(settings.stubPaper);
  context.fillStyle = draft.background; context.fillRect(0, 0, 470, height);
  context.save(); context.translate(layout.centerX, layout.centerY); context.rotate(layout.angle); context.scale(layout.scale, layout.scale); context.translate(-layout.cardWidth / 2, -layout.cardHeight / 2);
  const frame = new Path2D(), w = layout.cardWidth, h = layout.cardHeight, r = settings.radius, seam = layout.seam;
  const notch = settings.showStub && settings.notches;
  frame.moveTo(r, 0);
  if (notch && !layout.portrait) { frame.lineTo(seam - 10, 0); frame.arc(seam, 0, 10, Math.PI, 0, true); }
  frame.lineTo(w - r, 0); frame.arcTo(w, 0, w, r, r);
  if (notch && layout.portrait) { frame.lineTo(w, seam - 10); frame.arc(w, seam, 10, -Math.PI / 2, Math.PI / 2, true); }
  frame.lineTo(w, h - r); frame.arcTo(w, h, w - r, h, r);
  if (notch && !layout.portrait) { frame.lineTo(seam + 10, h); frame.arc(seam, h, 10, 0, Math.PI, true); }
  frame.lineTo(r, h); frame.arcTo(0, h, 0, h - r, r);
  if (notch && layout.portrait) { frame.lineTo(0, seam + 10); frame.arc(0, seam, 10, Math.PI / 2, -Math.PI / 2, true); }
  frame.lineTo(0, r); frame.arcTo(0, 0, r, 0, r); frame.closePath();
  const circle = (x: number, y: number, radius: number) => { frame.moveTo(x + radius, y); frame.arc(x, y, radius, 0, Math.PI * 2); frame.closePath(); };
  if (settings.showStub && settings.perforation === 'holes') {
    const length = layout.portrait ? layout.cardWidth : layout.cardHeight;
    for (let p = 18; p < length - 14; p += settings.holeGap) circle(layout.portrait ? p : layout.seam, layout.portrait ? layout.seam : p, settings.holeSize);
  }
  context.save(); context.shadowColor = `rgba(0,0,0,${settings.shadow / 100})`; context.shadowBlur = 24 * unit; context.shadowOffsetY = 12 * unit;
  context.fillStyle = settings.paper; context.fill(frame, 'evenodd'); context.restore();
  context.save(); context.clip(frame, 'evenodd');
  if (settings.showStub) { context.fillStyle = settings.stubPaper; context.fillRect(layout.stub.x, layout.stub.y, layout.stub.width, layout.stub.height); }
  // Fixed seed gives the same paper grain in every preview and full-resolution export.
  if (settings.texture !== 'smooth' && settings.textureAmount > 0) {
    let seed = 240913;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    context.save(); context.globalAlpha = settings.textureAmount / 100 * 0.28; context.fillStyle = ink;
    for (let i = 0; i < layout.cardWidth * layout.cardHeight / 95; i++) {
      const x = random() * layout.cardWidth, y = random() * layout.cardHeight;
      context.fillRect(x, y, settings.texture === 'fiber' ? 0.5 + random() * 3 : 0.7 + random() * 1.5, 0.5 + random());
    }
    if (settings.texture === 'aged') {
      const wash = context.createLinearGradient(0, 0, layout.cardWidth, layout.cardHeight);
      wash.addColorStop(0, '#8a5a2f'); wash.addColorStop(0.22, 'rgba(138,90,47,0)'); wash.addColorStop(0.8, 'rgba(138,90,47,0)'); wash.addColorStop(1, '#8a5a2f');
      context.fillStyle = wash; context.fillRect(0, 0, layout.cardWidth, layout.cardHeight);
    }
    context.restore();
  }
  if (settings.showPhoto) {
    const box = layout.photo;
    context.save(); context.beginPath(); context.rect(box.x, box.y, box.width, box.height); context.clip();
    if (image) { const crop = coverCropRect(image.naturalWidth, image.naturalHeight, draft.crop, box.width / box.height); context.drawImage(image, crop.x, crop.y, crop.width, crop.height, box.x, box.y, box.width, box.height); }
    else {
      context.fillStyle = ink; context.globalAlpha = 0.07; context.fillRect(box.x, box.y, box.width, box.height); context.globalAlpha = 0.7;
      drawText(context, emptyLabel, { ...box, x: box.x + 12, y: box.y + box.height / 2 - 10, width: box.width - 24 }, 16, fontFamily, 400, 'center', 2);
    }
    context.restore();
  }
  const drawField = (field: TicketField, box: TicketRect, lines: number, fallback: string, size = field.size) => {
    context.fillStyle = field.color ?? fallback;
    if (field.label) { context.save(); context.globalAlpha = 0.75; drawText(context, field.label, box, 11, coverFonts.mono, 700, field.align); context.restore(); }
    drawText(context, field.text, { ...box, y: box.y + (field.label ? 16 : 0) }, size, coverFonts[field.font], field.weight, field.align, lines, true);
  };
  layout.cells.forEach(cell => drawField(cell.field, cell, cell.lines, ink));
  const field = (id: string) => settings.fields.find(item => item.id === id && item.visible && item.text);
  const footer = settings.showStub ? layout.stub : { x: layout.mainX, y: layout.mainY + layout.mainHeight - 96, width: layout.mainWidth, height: 96 };
  const footerInk = settings.showStub ? stubInk : ink;
  const inset = 23, inner = { x: footer.x + inset, y: footer.y + 20, width: footer.width - inset * 2, height: footer.height - 40 };
  let bottomY = inner.y;
  if (settings.showBadge) {
    context.fillStyle = settings.accent;
    context.fillRect(inner.x, inner.y, Math.min(inner.width, 110), 21);
    context.fillStyle = automaticForeground(settings.accent);
    drawText(context, settings.badge, { ...inner, x: inner.x + 6, y: inner.y + 4, width: Math.min(inner.width, 110) - 12 }, 10, coverFonts.mono, 650);
    bottomY += 32;
  }
  if (settings.showStub) {
    if (settings.linkedStub) {
      if (!layout.portrait) {
        for (const id of ['event', 'date']) {
          const item = field(id); if (!item) continue;
          drawField(item, { ...inner, y: bottomY }, 2, footerInk, id === 'event' ? 20 : 14);
          bottomY += id === 'event' ? 82 : 54;
        }
      }
      const seats = settings.fields.filter(item => ['zone', 'row', 'seat'].includes(item.id) && item.visible && item.text);
      if (!layout.portrait) {
        const small = seats.filter(item => item.id !== 'seat');
        small.forEach((item, index) => {
          const width = (inner.width - Math.max(0, small.length - 1) * 10) / Math.max(1, small.length);
          drawField(item, { x: inner.x + index * (width + 10), y: bottomY, width, height: 54 }, 1, footerInk);
        });
        if (small.length) bottomY += 54;
        const seat = seats.find(item => item.id === 'seat');
        if (seat) { drawField(seat, { ...inner, y: bottomY }, 1, footerInk, Math.max(28, seat.size)); bottomY += 64; }
      }
      if (layout.portrait) {
      seats.forEach((item, index) => {
        const width = (inner.width - Math.max(0, seats.length - 1) * 12) / Math.max(1, seats.length);
        drawField(item, { x: inner.x + index * (width + 12), y: bottomY, width, height: 60 }, 1, footerInk, item.id === 'seat' ? Math.max(24, item.size) : item.size);
      });
      if (seats.length) bottomY += 55;
      }
    } else {
      context.fillStyle = footerInk;
      drawText(context, settings.stubText, { ...inner, y: bottomY }, 18, coverFonts.mono, 500, 'left', layout.portrait ? 2 : 5, true);
      bottomY += layout.portrait ? 54 : 135;
    }
  }
  const serial = field('serial');
  if (settings.showBarcode) {
    const barcodeY = Math.max(bottomY, footer.y + footer.height - 58);
    const code = serial?.text ?? 'STILL', barcodeWidth = inner.width;
    context.fillStyle = footerInk;
    let x = inner.x, i = 0;
    while (x < inner.x + barcodeWidth - 4) {
      const bar = 1 + (code.charCodeAt(i % code.length) + i * 7) % 3;
      context.fillRect(x, barcodeY, bar, 21); x += bar + 1 + i % 2; i++;
    }
    bottomY = barcodeY + 25;
  }
  if (settings.showStub && serial) {
    context.fillStyle = serial.color ?? footerInk;
    drawText(context, [serial.label, serial.text].filter(Boolean).join(' '), { ...inner, y: Math.max(bottomY, footer.y + footer.height - 27) }, 10, coverFonts[serial.font], serial.weight, serial.align);
  }
  if (settings.showStub && settings.perforation !== 'none') {
    context.save(); context.strokeStyle = ink; context.globalAlpha = settings.perforationOpacity / 100; context.lineWidth = settings.perforation === 'dash' ? settings.holeSize : 0.5;
    context.setLineDash(settings.perforation === 'dash' ? [settings.holeSize * 2, settings.holeGap] : [1, settings.holeGap]);
    context.beginPath();
    if (layout.portrait) { context.moveTo(14, layout.seam); context.lineTo(layout.cardWidth - 14, layout.seam); }
    else { context.moveTo(layout.seam, 14); context.lineTo(layout.seam, layout.cardHeight - 14); }
    context.stroke(); context.restore();
  }
  context.restore(); context.restore();
}
