import { coverFonts } from './albumCover';

export type TicketPreset = 'photo' | 'classic' | 'midnight';
export type TicketFieldId = 'event' | 'artist' | 'date' | 'time' | 'venue' | 'gate' | 'zone' | 'row' | 'seat' | 'holder' | 'serial' | 'note';
export type TicketField = {
  id: TicketFieldId; label: string; text: string; visible: boolean;
  font: keyof typeof coverFonts; size: number; weight: number; color: string | null;
  align: 'left' | 'center' | 'right';
};
export type TicketSettings = {
  preset: TicketPreset; orientation: 'portrait' | 'landscape';
  size: number; position: number; rotation: number; radius: number; shadow: number;
  showPhoto: boolean; photoShare: number;
  showStub: boolean; stubSide: 'start' | 'end'; stubShare: number; linkedStub: boolean; stubText: string;
  perforation: 'none' | 'dash' | 'holes'; holeSize: number; holeGap: number; perforationOpacity: number; notches: boolean;
  paper: string; stubPaper: string; ink: string | null; accent: string;
  texture: 'smooth' | 'fiber' | 'aged'; textureAmount: number;
  showBarcode: boolean; showBadge: boolean; badge: string;
  fields: TicketField[];
};

export function createTicketSettings(preset: TicketPreset = 'photo'): TicketSettings {
  const field = (id: TicketFieldId, label: string, text: string, visible = true): TicketField => ({
    id, label, text, visible, font: id === 'event' || id === 'artist' ? 'sans' : 'mono', size: id === 'event' ? 30 : id === 'artist' ? 19 : 18,
    weight: id === 'event' ? 750 : id === 'artist' ? 500 : 700, color: null, align: 'left',
  });
  const settings: TicketSettings = {
    preset, orientation: 'portrait', size: 92, position: 28, rotation: 0, radius: 8, shadow: 20,
    showPhoto: true, photoShare: 44, showStub: true, stubSide: 'end', stubShare: 23, linkedStub: true, stubText: 'THE NIGHT WE SANG TOGETHER',
    perforation: 'holes', holeSize: 1.4, holeGap: 7, perforationOpacity: 40, notches: true,
    paper: '#fffaf0', stubPaper: '#eee5d4', ink: null, accent: '#a34432', texture: 'fiber', textureAmount: 20,
    showBarcode: true, showBadge: true, badge: 'ADMIT ONE',
    fields: [field('event', 'LIVE IN CONCERT', 'THE NIGHT\nWE REMEMBER'), field('artist', 'ARTIST', 'Your favorite artist'),
      field('date', 'DATE', '13 SEP 2026'), field('time', 'DOORS', '18:00'), field('venue', 'VENUE', 'BANGKOK · THAILAND'),
      field('gate', 'GATE', '03', false), field('zone', 'ZONE', 'A'), field('row', 'ROW', '07'), field('seat', 'SEAT', '024'),
      field('holder', 'NAME', 'Your name', false), field('serial', 'TICKET NO.', 'STL-000024'), field('note', 'MEMORY', 'I was here. With you.', false)],
  };
  if (preset === 'classic') Object.assign(settings, { orientation: 'landscape', radius: 2, paper: '#f4ead4', stubPaper: '#e5d5b5', accent: '#a13b30', texture: 'aged', photoShare: 35, stubShare: 24 });
  if (preset === 'midnight') Object.assign(settings, { paper: '#22252d', stubPaper: '#303541', accent: '#c6d7f2', texture: 'smooth', radius: 6 });
  return settings;
}

export function applyTicketPreset(current: TicketSettings, preset: TicketPreset): TicketSettings {
  const target = createTicketSettings(preset);
  return { ...target, stubText: current.stubText, linkedStub: current.linkedStub, badge: current.badge,
    fields: current.fields.map(field => ({ ...target.fields.find(item => item.id === field.id)!, label: field.label, text: field.text, visible: field.visible })) };
}

const color = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const bounded = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function restoreTicketSettings(value: unknown): TicketSettings {
  const result = createTicketSettings();
  if (!value || typeof value !== 'object') return result;
  const saved = value as Partial<TicketSettings>;
  const options = { preset: ['photo', 'classic', 'midnight'], orientation: ['portrait', 'landscape'], stubSide: ['start', 'end'], perforation: ['none', 'dash', 'holes'], texture: ['smooth', 'fiber', 'aged'] } as const;
  for (const key of Object.keys(options) as (keyof typeof options)[]) if ((options[key] as readonly unknown[]).includes(saved[key])) Object.assign(result, { [key]: saved[key] });
  const ranges = { size: [65, 100], position: [15, 65], rotation: [-10, 10], radius: [0, 24], shadow: [0, 60], photoShare: [25, 55], stubShare: [18, 30], holeSize: [0.7, 2.5], holeGap: [5, 14], perforationOpacity: [10, 90], textureAmount: [0, 60] } as const;
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) result[key] = bounded(saved[key], result[key], ranges[key][0], ranges[key][1]);
  for (const key of ['showPhoto', 'showStub', 'linkedStub', 'notches', 'showBarcode', 'showBadge'] as const) if (typeof saved[key] === 'boolean') result[key] = saved[key];
  for (const key of ['paper', 'stubPaper', 'ink', 'accent'] as const) if (color(saved[key])) result[key] = saved[key];
  for (const key of ['stubText', 'badge'] as const) if (typeof saved[key] === 'string') result[key] = saved[key].slice(0, key === 'badge' ? 40 : 180);
  if (Array.isArray(saved.fields)) {
    const used = new Set<TicketFieldId>();
    const restored: TicketField[] = [];
    for (const item of saved.fields) {
      if (!item || typeof item !== 'object') continue;
      const base = result.fields.find(field => field.id === item.id);
      if (!base || used.has(base.id)) continue;
      used.add(base.id);
      restored.push({ ...base, label: typeof item.label === 'string' ? item.label.slice(0, 40) : base.label,
        text: typeof item.text === 'string' ? item.text.slice(0, 180) : base.text, visible: typeof item.visible === 'boolean' ? item.visible : base.visible,
        font: typeof item.font === 'string' && Object.hasOwn(coverFonts, item.font) ? item.font : base.font,
        size: bounded(item.size, base.size, 12, base.id === 'event' ? 38 : 24), weight: bounded(item.weight, base.weight, 100, 900),
        color: color(item.color) ? item.color : null, align: ['left', 'center', 'right'].includes(item.align) ? item.align : base.align });
    }
    result.fields = [...restored, ...result.fields.filter(field => !used.has(field.id))];
  }
  return result;
}

export type TicketRect = { x: number; y: number; width: number; height: number };
export type TicketCell = TicketRect & { field: TicketField; lines: number };

// Layout and crop hit target share unrotated paper coordinates. Hidden fields consume no space.
export function ticketLayout(height: number, settings: TicketSettings) {
  const portrait = settings.orientation === 'portrait';
  const cardWidth = portrait ? 380 : 700, pad = portrait ? 23 : 24;
  const stubWidth = !portrait && settings.showStub ? cardWidth * settings.stubShare / 100 : 0;
  const mainX = !portrait && settings.showStub && settings.stubSide === 'start' ? stubWidth : 0;
  const mainWidth = cardWidth - stubWidth;
  const photoWidth = portrait ? mainWidth - pad * 2 : settings.showPhoto ? (mainWidth - pad * 3) * settings.photoShare / 100 : 0;
  const photoHeight = portrait && settings.showPhoto ? 440 * settings.photoShare / 100 : 0;
  const textX = mainX + pad + (!portrait && settings.showPhoto ? photoWidth + pad : 0);
  const textWidth = portrait ? mainWidth - pad * 2 : mainWidth - (textX - mainX) - pad;
  let y = pad + (portrait && settings.showPhoto ? photoHeight + 20 : 0);
  const cells: TicketCell[] = [];
  let pending: TicketField | null = null;
  const fieldHeight = (field: TicketField, lines: number) => (field.label ? 16 : 0) + field.size * 1.35 * lines + 12;
  const addRow = (first: TicketField, second?: TicketField) => {
    const maxLines = first.id === 'event' ? 3 : ['venue', 'note', 'holder'].includes(first.id) ? 2 : 1;
    const approximateLines = first.text.split('\n').reduce((count, line) => count + Math.max(1, Math.ceil(Array.from(line).length * first.size * 0.65 / textWidth)), 0);
    const lines = Math.min(maxLines, approximateLines);
    const rowHeight = Math.max(fieldHeight(first, lines), second ? fieldHeight(second, 1) : 0);
    const width = second ? (textWidth - 16) / 2 : textWidth;
    cells.push({ field: first, x: textX, y, width, height: rowHeight, lines });
    if (second) cells.push({ field: second, x: textX + width + 16, y, width, height: rowHeight, lines: 1 });
    y += rowHeight;
  };
  for (const field of settings.fields.filter(field => field.visible && (field.text || field.label) && field.id !== 'serial' && !(settings.showStub && settings.linkedStub && ['zone', 'row', 'seat'].includes(field.id)))) {
    const full = ['event', 'artist', 'venue', 'note', 'holder'].includes(field.id);
    if (full) { if (pending) { addRow(pending); pending = null; } addRow(field); }
    else if (pending) { addRow(pending, field); pending = null; } else pending = field;
  }
  if (pending) addRow(pending);
  const serial = settings.fields.find(field => field.id === 'serial')!;
  if (!settings.showStub && serial.visible && (serial.text || serial.label)) addRow(serial);
  const shown = (id: TicketFieldId) => settings.fields.some(field => field.id === id && field.visible && field.text);
  const seatCount = (['zone', 'row', 'seat'] as TicketFieldId[]).filter(shown).length;
  const stubContent = settings.linkedStub
    ? (portrait ? (seatCount ? 55 : 0) : (shown('event') ? 82 : 0) + (shown('date') ? 54 : 0) + ((shown('zone') || shown('row')) ? 54 : 0) + (shown('seat') ? 64 : 0))
    : portrait ? 54 : 135;
  const stubMinimum = 30 + (settings.showBadge ? 32 : 0) + stubContent + (settings.showBarcode ? 58 : shown('serial') ? 27 : 10);
  const footer = !settings.showStub && (settings.showBarcode || settings.showBadge) ? 96 : 0;
  const mainHeight = Math.max(portrait ? 180 : settings.showStub ? stubMinimum : 300, y + pad + footer);
  const stubHeight = portrait && settings.showStub ? Math.max(stubMinimum, mainHeight * settings.stubShare / (100 - settings.stubShare)) : 0;
  const cardHeight = mainHeight + stubHeight;
  const mainY = portrait && settings.showStub && settings.stubSide === 'start' ? stubHeight : 0;
  for (const cell of cells) cell.y += mainY;
  const photo: TicketRect = { x: mainX + pad, y: mainY + pad, width: photoWidth, height: portrait ? photoHeight : mainHeight - pad * 2 };
  const seam = portrait ? (settings.stubSide === 'start' ? stubHeight : mainHeight) : (settings.stubSide === 'start' ? stubWidth : mainWidth);
  const stub: TicketRect = portrait ? { x: 0, y: settings.stubSide === 'start' ? 0 : mainHeight, width: cardWidth, height: stubHeight } : { x: settings.stubSide === 'start' ? 0 : mainWidth, y: 0, width: stubWidth, height: cardHeight };
  const angle = settings.rotation * Math.PI / 180;
  const boundWidth = Math.abs(Math.cos(angle)) * cardWidth + Math.abs(Math.sin(angle)) * cardHeight;
  const boundHeight = Math.abs(Math.sin(angle)) * cardWidth + Math.abs(Math.cos(angle)) * cardHeight;
  const scale = Math.min(430 * settings.size / 100 / boundWidth, (height - 240) / boundHeight);
  const centerX = 235;
  const centerY = Math.max(180 + boundHeight * scale / 2, Math.min(height - 60 - boundHeight * scale / 2, height * settings.position / 100 + boundHeight * scale / 2));
  return { portrait, cardWidth, cardHeight, mainX, mainY, mainWidth, mainHeight, photo, cells, stub, seam, angle, scale, centerX, centerY,
    left: centerX + (photo.x - cardWidth / 2) * scale, top: centerY + (photo.y - cardHeight / 2) * scale, width: photo.width * scale, height: photo.height * scale,
    boundLeft: centerX - boundWidth * scale / 2, boundRight: centerX + boundWidth * scale / 2, boundTop: centerY - boundHeight * scale / 2, boundBottom: centerY + boundHeight * scale / 2 };
}
