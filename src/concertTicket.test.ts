import { describe, expect, it } from 'vitest';
import { applyTicketPreset, createTicketSettings, restoreTicketSettings, ticketLayout, type TicketPreset } from './concertTicket';
import { devices } from './devices';
import { initialDraft, restoreDraft } from './model';

describe('Concert Ticket', () => {
  it('keeps old drafts and restores independent ticket content including leading zeros', () => {
    const image = new Blob(['photo']);
    const old = restoreDraft({ version: 1, templateId: 'polaroid', image, title: 'old song', crop: { zoom: 2, x: 0.2, y: 0.7 } });
    expect(old).toMatchObject({ templateId: 'polaroid', image, title: 'old song', crop: { zoom: 2, x: 0.2, y: 0.7 }, concertTicket: createTicketSettings() });
    const ticket = createTicketSettings('midnight');
    ticket.fields.find(field => field.id === 'seat')!.text = '007';
    ticket.fields.find(field => field.id === 'event')!.text = 'คืนที่เราร้องเพลงด้วยกัน / 思い出';
    const restored = restoreDraft({ ...initialDraft, templateId: 'concertTicket', concertTicket: ticket });
    expect(restored.concertTicket).toEqual(ticket);
    expect(restored.title).toBe(initialDraft.title);
  });

  it('preserves labels, values, visibility, order and custom stub text across presets', () => {
    const settings = createTicketSettings();
    settings.fields.reverse();
    Object.assign(settings.fields.find(field => field.id === 'seat')!, { label: 'STANDING', text: 'ZONE A', font: 'serif' });
    settings.fields.find(field => field.id === 'venue')!.visible = false;
    settings.stubText = 'Our first concert'; settings.linkedStub = false; settings.badge = 'VIP';
    for (const preset of ['photo', 'classic', 'midnight'] as TicketPreset[]) {
      const next = applyTicketPreset(settings, preset);
      expect(next.fields.map(({ id, label, text, visible }) => ({ id, label, text, visible }))).toEqual(settings.fields.map(({ id, label, text, visible }) => ({ id, label, text, visible })));
      expect(next).toMatchObject({ stubText: settings.stubText, linkedStub: false, badge: 'VIP' });
    }
  });

  it('sanitizes corrupt storage, unknown or duplicate fields and unsafe dimensions', () => {
    const ticket = restoreTicketSettings({ orientation: 'wrong', size: Infinity, rotation: 99, holeGap: -2, paper: 'red', textureAmount: NaN, fields: [null, 'oops', { id: 'unknown' }, { id: 'seat', text: '007', label: 'x'.repeat(99), font: '__proto__', size: -10, color: 'red', weight: 9999 }, { id: 'seat', text: 'bad' }] });
    expect(ticket).toMatchObject({ orientation: 'portrait', size: 92, rotation: 10, holeGap: 5, paper: '#fffaf0', textureAmount: 20 });
    expect(ticket.fields).toHaveLength(12);
    expect(ticket.fields[0]).toMatchObject({ id: 'seat', text: '007', font: 'mono', size: 12, color: null, weight: 900 });
    expect(ticket.fields[0].label).toHaveLength(40);
  });

  it('keeps rotated tickets and every text cell within paper across devices and extreme settings', () => {
    for (const device of devices) for (const preset of ['photo', 'classic', 'midnight'] as TicketPreset[]) for (const extreme of [false, true]) for (const stubSide of ['start', 'end'] as const) {
      const settings = createTicketSettings(preset); settings.stubSide = stubSide;
      if (extreme) { settings.fields.forEach(field => { field.visible = true; field.size = field.id === 'event' ? 38 : 24; }); Object.assign(settings, { rotation: -10, size: 100, position: 65, photoShare: 55, stubShare: 18 }); }
      const height = 470 * device.height / device.width, layout = ticketLayout(height, settings);
      expect(layout.boundLeft).toBeGreaterThanOrEqual(19.99); expect(layout.boundRight).toBeLessThanOrEqual(450.01);
      expect(layout.boundTop).toBeGreaterThanOrEqual(179.99); expect(layout.boundBottom).toBeLessThanOrEqual(height - 59.99);
      for (const cell of layout.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(layout.mainX); expect(cell.x + cell.width).toBeLessThanOrEqual(layout.mainX + layout.mainWidth);
        expect(cell.y).toBeGreaterThanOrEqual(layout.mainY); expect(cell.y + cell.height).toBeLessThanOrEqual(layout.mainY + layout.mainHeight);
      }
      expect(layout.photo.width).toBeGreaterThan(0); expect(layout.photo.height).toBeGreaterThan(0);
    }
  });

  it('reflows hidden fields, moves seats back to the body without a linked stub and keeps the crop ratio', () => {
    const settings = createTicketSettings();
    const before = ticketLayout(1020, settings);
    settings.fields.find(field => field.id === 'venue')!.visible = false;
    const after = ticketLayout(1020, settings);
    expect(after.mainHeight).toBeLessThan(before.mainHeight);
    expect(after.cells.some(cell => cell.field.id === 'seat')).toBe(false);
    settings.showStub = false;
    expect(ticketLayout(1020, settings).cells.some(cell => cell.field.id === 'seat')).toBe(true);
    for (const orientation of ['portrait', 'landscape'] as const) {
      settings.orientation = orientation;
      const layout = ticketLayout(1020, settings);
      expect(layout.width / layout.height).toBeCloseTo(layout.photo.width / layout.photo.height);
    }
  });
});
