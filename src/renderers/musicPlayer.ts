import { automaticForeground, playerColors, progress, remaining, selectPaletteColors, type Draft } from '../model';
import { coverCropRect, coverFonts } from '../albumCover';
import { playerLayout } from '../musicPlayer';
import type { Device } from '../devices';
import { fitText, fontFamily, line, roundedRectPath, triangle } from './shared';
import { renderPalette } from './palette';

function textLines(context: CanvasRenderingContext2D, text: string, width: number, maxLines: number) {
  const segments = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), item => item.segment);
  const lines: string[] = [];
  let current = '';
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (segment === '\n') { if (lines.length === maxLines - 1) return [...lines, current + (index < segments.length - 1 ? '…' : '')]; lines.push(current); current = ''; continue; }
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
  const foreground = colors.contentForeground, accent = settings.accent ?? foreground, scale = frame.scale;
  if (settings.backgroundMode === 'solid') context.fillStyle = colors.start;
  else {
    const angle = settings.gradientAngle * Math.PI / 180;
    const extent = Math.abs(470 * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    const dx = Math.sin(angle) * extent / 2, dy = -Math.cos(angle) * extent / 2;
    const gradient = settings.backgroundMode === 'photo' || settings.backgroundMode === 'ambient'
      ? context.createRadialGradient(235, top + size / 2, 0, 235, top + size / 2, height * 0.85)
      : context.createLinearGradient(235 - dx, height / 2 - dy, 235 + dx, height / 2 + dy);
    gradient.addColorStop(0, colors.start); gradient.addColorStop(1, colors.end); context.fillStyle = gradient;
  }
  context.fillRect(0, 0, 470, height);
  if (settings.backgroundMode === 'ambient') {
    for (const [x, y, radius] of [[40, height * 0.2, 450], [460, height * 0.75, 470]]) {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, colors.start); glow.addColorStop(1, colors.start + '00');
      context.fillStyle = glow; context.fillRect(0, 0, 470, height);
    }
  }
  if (settings.panel !== 'none') {
    const box = frame.panel, panel = roundedRectPath(box.left, box.top, box.width, box.height, settings.panelRadius * scale);
    context.save(); context.fillStyle = settings.panelColor; context.globalAlpha = settings.panelOpacity / 100; context.fill(panel); context.restore();
    if (settings.panel === 'glass') {
      context.save(); context.strokeStyle = '#ffffff'; context.globalAlpha = 0.35; context.lineWidth = scale; context.stroke(panel); context.restore();
    }
  }
  if (settings.layout === 'vinyl') {
    const { x, y, radius } = frame.record;
    context.save(); context.fillStyle = settings.recordColor; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
    context.clip();
    if (settings.recordGrooves) {
      context.strokeStyle = automaticForeground(settings.recordColor); context.globalAlpha = 0.14; context.lineWidth = 0.65 * scale;
      for (let r = radius * 0.38; r < radius * 0.97; r += 4 * scale) { context.beginPath(); context.arc(x, y, r, 0, Math.PI * 2); context.stroke(); }
    }
    const shine = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
    shine.addColorStop(0, '#ffffff00'); shine.addColorStop(0.4, '#ffffff00'); shine.addColorStop(0.5, '#ffffff50'); shine.addColorStop(0.6, '#ffffff00'); shine.addColorStop(1, '#ffffff00');
    context.globalAlpha = 0.6; context.fillStyle = shine; context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.globalAlpha = 1; context.fillStyle = settings.recordLabelColor; context.beginPath(); context.arc(x, y, radius * 0.33, 0, Math.PI * 2); context.fill();
    context.fillStyle = automaticForeground(settings.recordLabelColor); context.font = `600 ${9 * scale}px ${coverFonts.mono}`; context.textAlign = 'center';
    context.fillText(textLines(context, settings.recordLabel, radius * 0.54, 1)[0], x, y - radius * 0.12);
    context.beginPath(); context.arc(x, y + 3 * scale, 4 * scale, 0, Math.PI * 2); context.fill(); context.restore();
  }
  const photo = frame.photo;
  const card = roundedRectPath(photo.left, photo.top, photo.width, photo.height, photo.radius);
  if (settings.artworkShadow > 0) {
    context.save(); context.shadowColor = `rgba(0,0,0,${settings.artworkShadow / 100})`;
    context.shadowBlur = 32 * outputWidth / 470 * scale; context.shadowOffsetY = 18 * outputWidth / 470 * scale; context.fillStyle = colors.end; context.fill(card); context.restore();
  }
  context.save(); context.clip(card);
  if (image) {
    const crop = coverCropRect(image.naturalWidth, image.naturalHeight, draft.crop, photo.width / photo.height);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, photo.left, photo.top, photo.width, photo.height);
  } else {
    context.fillStyle = foreground; context.globalAlpha = 0.06; context.fillRect(photo.left, photo.top, photo.width, photo.height);
    context.globalAlpha = 0.4; context.textAlign = 'center'; context.font = `${(photo.width < 150 ? 10 : 15) * scale}px ${fontFamily}`;
    context.fillText(textLines(context, emptyLabel, photo.width - 12, 1)[0], photo.left + photo.width / 2, photo.top + photo.height / 2);
  }
  context.restore(); context.fillStyle = foreground; context.strokeStyle = foreground;

  context.textBaseline = 'top'; context.textAlign = settings.align;
  const textWidth = frame.textWidth - (settings.showFavorite ? 38 * scale : 0);
  const anchor = settings.align === 'center' ? frame.textLeft + textWidth / 2 : frame.textLeft;
  context.font = `${settings.titleWeight} ${settings.titleSize * scale}px ${coverFonts[settings.titleFont]}`;
  const title = textLines(context, draft.title, textWidth, 2);
  context.fillStyle = settings.titleColor ?? foreground;
  title.forEach((text, index) => context.fillText(text, anchor, frame.title + (frame.titleHeight - title.length * settings.titleSize * scale * 1.12) / 2 + index * settings.titleSize * scale * 1.12));
  context.font = `${settings.artistWeight} ${settings.artistSize * scale}px ${coverFonts[settings.artistFont]}`;
  context.fillStyle = settings.artistColor ?? foreground; context.globalAlpha = settings.artistColor ? 1 : 0.72;
  context.fillText(textLines(context, draft.artist, textWidth, 1)[0], anchor, frame.artist);
  context.globalAlpha = 1; context.textBaseline = 'alphabetic'; context.textAlign = 'left'; context.fillStyle = foreground;
  if (settings.showFavorite) {
    context.save(); context.strokeStyle = accent; context.translate(frame.textLeft + frame.textWidth - 22 * scale, frame.title + frame.titleHeight / 2 - 5 * scale); context.scale(scale, scale); context.lineWidth = 1.6;
    context.stroke(new Path2D('M8 14 C-7 4 0 -5 8 1 C16 -5 23 4 8 14 Z')); context.restore();
  }
  if (settings.showExtra && settings.extraText) {
    context.save(); context.fillStyle = foreground; context.globalAlpha = 0.7; context.textBaseline = 'top'; context.font = `${13 * scale}px ${fontFamily}`;
    textLines(context, settings.extraText, size, 2).forEach((text, index) => context.fillText(text, left, frame.extra + index * 18 * scale)); context.restore();
  }
  if (settings.layout === 'lyrics') {
    const lines = (settings.lyrics || 'Your favorite words\nA moment to remember\nA song to keep').split('\n').slice(0, 4);
    context.save(); context.textBaseline = 'top'; context.textAlign = settings.align; context.font = `600 ${settings.lyricSize * scale}px ${coverFonts[settings.lyricFont]}`;
    lines.forEach((value, index) => {
      const active = index === Math.min(settings.lyricHighlight, lines.length) - 1;
      context.fillStyle = active ? accent : foreground; context.globalAlpha = active ? 1 : settings.lyricOpacity / 100;
      context.fillText(textLines(context, value, size, 1)[0], settings.align === 'center' ? 235 : left, frame.lyricTop + index * settings.lyricSize * 1.5 * scale);
    }); context.restore();
  }
  if (settings.showProgress) {
    const drawTrack = () => {
      if (settings.progressStyle === 'line' || settings.progressStyle === 'thick') context.fill(roundedRectPath(left, frame.timeline, size, frame.trackHeight, frame.trackHeight / 2));
      else for (let i = 0; i < 48; i++) {
        const barHeight = settings.progressStyle === 'segments' ? frame.trackHeight : frame.trackHeight * (0.18 + 0.82 * Math.abs(Math.sin(i * 1.71 + 0.4) * Math.cos(i * 0.43)));
        context.fill(roundedRectPath(left + i * size / 48, frame.timeline + (frame.trackHeight - barHeight) / 2, size / 48 * 0.58, barHeight, Math.min(1.2 * scale, barHeight / 2)));
      }
    };
    context.fillStyle = foreground; context.globalAlpha = 0.25; drawTrack();
    const current = progress(draft.elapsed, draft.duration);
    context.save(); context.beginPath(); context.rect(left, frame.timeline, size * current, frame.trackHeight); context.clip(); context.globalAlpha = 1; context.fillStyle = accent; drawTrack(); context.restore();
    context.globalAlpha = 1; context.fillStyle = accent; context.strokeStyle = accent;
    const thumbX = left + size * current, thumbY = frame.timeline + frame.trackHeight / 2;
    if (settings.progressThumb === 'dot' || settings.progressThumb === 'ring') { context.beginPath(); context.arc(thumbX, thumbY, (settings.progressThumb === 'ring' ? 4.5 : 3.5) * scale, 0, Math.PI * 2); context.lineWidth = 1.8 * scale; if (settings.progressThumb === 'ring') context.stroke(); else context.fill(); }
    if (settings.progressThumb === 'line') context.fillRect(thumbX - scale, thumbY - 7 * scale, 2 * scale, 14 * scale);
    if (settings.showTimes) {
      context.fillStyle = foreground; context.globalAlpha = 0.72; context.font = `${10 * scale}px ${fontFamily}`;
      context.fillText(draft.elapsed, left, frame.timeline + frame.trackHeight + 17.5 * scale); context.textAlign = 'right';
      context.fillText(settings.timeDisplay === 'remaining' ? remaining(draft.elapsed, draft.duration) : draft.duration, left + size, frame.timeline + frame.trackHeight + 17.5 * scale); context.textAlign = 'left';
    }
  }
  if (settings.controls !== 'none') {
    context.save(); context.globalAlpha = 0.95; context.fillStyle = accent; context.strokeStyle = accent; context.translate(235, frame.controls); const controlsScale = Math.min(settings.controlsScale * scale, size / 320); context.scale(controlsScale, controlsScale);
    context.lineWidth = 1.8;
    if (settings.buttonStyle === 'circle') { context.beginPath(); context.arc(0, 0, 32, 0, Math.PI * 2); context.stroke(); }
    if (settings.glyph === 'play') triangle(context, -6, 0, 11);
    else { context.fillRect(-11, -13, 7, 26); context.fillRect(4, -13, 7, 26); }
    context.fillStyle = foreground; context.strokeStyle = foreground;
    if (settings.showPrevious) { triangle(context, -75, 0, 9, -1); context.fillRect(-93, -9, 2.5, 18); }
    if (settings.showNext) { triangle(context, 75, 0, 9); context.fillRect(90, -9, 2.5, 18); }
    if (settings.controls === 'full') {
      context.globalAlpha = 0.65; context.lineCap = 'round'; context.lineJoin = 'round';
      if (settings.showShuffle) {
      line(context, [[-144, -6], [-139, -6], [-129, 6], [-122, 6]]);
      line(context, [[-144, 6], [-139, 6], [-129, -6], [-122, -6]]);
      line(context, [[-125, -9], [-121, -6], [-125, -3]]);
      line(context, [[-125, 3], [-121, 6], [-125, 9]]);
      }
      if (settings.showRepeat) {
      line(context, [[127, -6], [142, -6], [142, 6], [127, 6], [127, 0]]);
      line(context, [[138, -10], [142, -6], [138, -2]]);
      }
    }
    context.restore();
  }
  if (draft.showPalette) renderPalette(context, selectPaletteColors(draft, settings), left, size, frame.palette, settings, colors.foreground);
  if (draft.showCredit && draft.credit) {
    context.globalAlpha = 0.7; context.fillStyle = colors.foreground; context.textAlign = 'center'; fitText(context, draft.credit, 235, height - 72, size, 10);
  }
  context.globalAlpha = 1;
}
