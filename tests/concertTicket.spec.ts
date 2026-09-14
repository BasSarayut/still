import { revealInspector, expandInspector } from './inspector';
import { expect, test } from '@playwright/test';

test('concert tickets preserve personal fields, crop, paper and exported artwork', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#template')).toBeEnabled();
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('en');
  await revealInspector(page.locator('#elapsed')); await page.locator('#elapsed').fill('bad');
  await revealInspector(page.locator('#template')); await page.locator('#template').selectOption('concertTicket');
  await expect(page.locator('#elapsed')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  const data = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 900;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 1200, 900); gradient.addColorStop(0, '#c8a3c0'); gradient.addColorStop(0.5, '#2b4559'); gradient.addColorStop(1, '#d5b781');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 900);
    ctx.fillStyle = '#f1d4a0'; ctx.beginPath(); ctx.arc(720, 190, 85, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c2834'; ctx.fillRect(0, 670, 1200, 230);
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('#photo-upload').setInputFiles({ name: 'concert.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
  await revealInspector(page.locator('#ticket-value')); await page.locator('#ticket-value').fill('คืนที่เราร้องเพลง\n思い出の夜');
  await revealInspector(page.locator('#ticket-field')); await page.locator('#ticket-field').selectOption('seat');
  await revealInspector(page.locator('#ticket-label')); await page.locator('#ticket-label').fill('STANDING'); await revealInspector(page.locator('#ticket-value')); await page.locator('#ticket-value').fill('007');
  await revealInspector(page.locator('#zoom')); await page.locator('#zoom').fill('2'); await revealInspector(page.locator('#background')); await page.locator('#background').fill('#c7ced4');
  await page.getByRole('switch', { includeHidden: true, name: 'Lock Screen preview', exact: true }).uncheck();
  for (const name of ['Photo Pass', 'Classic Stub', 'Midnight Live']) {
    await page.getByRole('button', { name: new RegExp(`^${name} `) }).click();
    await expect(page.locator('#ticket-label')).toHaveValue('STANDING'); await expect(page.locator('#ticket-value')).toHaveValue('007');
    await expect(page.locator('#zoom')).toHaveValue('2'); await expect(page.locator('#background')).toHaveValue('#c7ced4');
    await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
    await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath(`${name}.png`) });
  }
  await page.getByRole('button', { name: /^Photo Pass / }).click();
  await expandInspector(page, 'Ticket layout');
  await revealInspector(page.getByLabel('Ticket rotation', { exact: true })); await page.getByLabel('Ticket rotation', { exact: true }).fill('8');
  const art = page.locator('.artwork-hit'); await art.scrollIntoViewIfNeeded();
  const rect = (await art.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2); await page.mouse.down();
  await page.mouse.move(rect.x + rect.width / 2 + 25, rect.y + rect.height / 2 + 3.5, { steps: 4 }); await page.mouse.up();
  await expandInspector(page, 'Stub & perforation');
  await revealInspector(page.locator('#ticket-stub-side')); await page.locator('#ticket-stub-side').selectOption('start'); await revealInspector(page.locator('#ticket-perforation')); await page.locator('#ticket-perforation').selectOption('dash');
  await expandInspector(page, 'Ticket colors & paper');
  await revealInspector(page.locator('#ticket-paper')); await page.locator('#ticket-paper').fill('#f4d4ba'); await revealInspector(page.locator('#ticket-stubPaper')); await page.locator('#ticket-stubPaper').fill('#abc1b2');
  await revealInspector(page.locator('#ticket-texture')); await page.locator('#ticket-texture').selectOption('fiber');
  await revealInspector(page.getByLabel('Texture strength', { exact: true })); await page.getByLabel('Texture strength', { exact: true }).fill('45');
  await page.getByRole('status').first().waitFor();
  await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
  const saved = await page.evaluate(async () => { const path = '/src/storage.ts'; return (await import(path)).loadDraft(); });
  expect(saved.crop.x).toBeLessThan(0.5); expect(saved.crop.y).toBeCloseTo(0.5, 1);
  await page.reload();
  await expect(page.locator('#template')).toHaveValue('concertTicket');
  await revealInspector(page.locator('#ticket-field')); await page.locator('#ticket-field').selectOption('seat'); await expect(page.locator('#ticket-value')).toHaveValue('007');
  await expandInspector(page, 'Ticket layout');
  await expect(page.getByLabel('Ticket rotation', { exact: true })).toHaveValue('8');
  await expandInspector(page, 'Ticket colors & paper'); await expect(page.locator('#ticket-paper')).toHaveValue('#f4d4ba');
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('ja'); await expect(page.locator('#ticket-value')).toHaveValue('007');
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('th'); await expect(page.locator('#ticket-label')).toHaveValue('STANDING');
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('en');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG' }).click(); await download;
  await expect(page.locator('.download-result a')).toBeVisible();
  const exported = await page.evaluate(async () => {
    const storagePath = '/src/storage.ts', rendererPath = '/src/renderer.ts', imagesPath = '/src/images.ts', devicePath = '/src/devices.ts';
    const { loadDraft } = await import(storagePath), { renderWallpaper, prepareFonts } = await import(rendererPath), { decodeImage } = await import(imagesPath), { getDevice } = await import(devicePath);
    const draft = await loadDraft(); await prepareFonts(draft); const photo = await decodeImage(draft.image);
    const exported = new Image(); exported.src = document.querySelector<HTMLAnchorElement>('.download-result a')!.href; await exported.decode();
    const result = document.createElement('canvas'); result.width = exported.width; result.height = exported.height; result.getContext('2d')!.drawImage(exported, 0, 0);
    const expected = document.createElement('canvas'); renderWallpaper(expected, draft, photo, getDevice(draft.device), exported.width);
    const before = result.toDataURL() === expected.toDataURL();
    renderWallpaper(expected, { ...draft, showGuides: !draft.showGuides }, photo, getDevice(draft.device), exported.width);
    return { width: exported.width, height: exported.height, matchesRenderer: before, ignoresGuides: result.toDataURL() === expected.toDataURL() };
  });
  expect(exported).toEqual({ width: 1179, height: 2556, matchesRenderer: true, ignoresGuides: true });
  await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath('custom-ticket.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('text-only tickets export without an image and stub controls reflow both orientations', async ({ page }, testInfo) => {
  await page.goto('/'); await expect(page.locator('#template')).toBeEnabled();
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('en'); await revealInspector(page.locator('#template')); await page.locator('#template').selectOption('concertTicket');
  await expandInspector(page, 'Ticket layout');
  await page.getByRole('switch', { includeHidden: true, name: 'Show photo', exact: true }).uncheck();
  await expect(page.locator('.artwork-hit')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  await expandInspector(page, 'Stub & perforation');
  await page.getByRole('switch', { includeHidden: true, name: 'Use concert details on stub', exact: true }).uncheck();
  await revealInspector(page.locator('#ticket-stub-text')); await page.locator('#ticket-stub-text').fill('THE NIGHT WE SANG TOGETHER');
  for (const orientation of ['portrait', 'landscape']) {
    await revealInspector(page.locator('#ticket-orientation')); await page.locator('#ticket-orientation').selectOption(orientation);
    for (const side of ['start', 'end']) {
      await revealInspector(page.locator('#ticket-stub-side')); await page.locator('#ticket-stub-side').selectOption(side);
      await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath(`${orientation}-${side}.png`) });
    }
  }
  await page.getByRole('switch', { includeHidden: true, name: 'Show ticket stub', exact: true }).uncheck();
  await expect(page.locator('#ticket-stub-text')).toHaveCount(0);
  await page.getByRole('switch', { includeHidden: true, name: 'Lock Screen preview', exact: true }).uncheck();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG' }).click(); await download;
  await expect(page.locator('.download-result a')).toBeVisible();
  await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath('text-only-no-stub.png') });
  await revealInspector(page.locator('#template')); await page.locator('#template').selectOption('custom'); await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
});

test('ticket cutouts reveal the background and paper never protrudes beyond the edge', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#template')).toBeEnabled();
  const samples = await page.evaluate(async () => {
    const modelPath = '/src/model.ts', ticketPath = '/src/concertTicket.ts', renderPath = '/src/renderer.ts', devicePath = '/src/devices.ts';
    const { initialDraft } = await import(modelPath), { createTicketSettings, ticketLayout } = await import(ticketPath), { renderWallpaper } = await import(renderPath), { getDevice } = await import(devicePath);
    const device = getDevice(initialDraft.device), results: number[][] = [];
    for (const orientation of ['portrait', 'landscape']) for (const stubSide of ['start', 'end']) {
      const settings = { ...createTicketSettings(), orientation, stubSide, shadow: 0, showPhoto: false, texture: 'smooth', paper: '#f0e0d0', stubPaper: '#d0b090', perforation: 'none' };
      const canvas = document.createElement('canvas'); renderWallpaper(canvas, { ...initialDraft, templateId: 'concertTicket', background: '#8393a3', concertTicket: settings }, null, device, 940);
      const ctx = canvas.getContext('2d')!, layout = ticketLayout(canvas.height / 2, settings);
      const sample = (x: number, y: number) => [...ctx.getImageData(Math.round((layout.centerX + (x - layout.cardWidth / 2) * layout.scale) * 2), Math.round((layout.centerY + (y - layout.cardHeight / 2) * layout.scale) * 2), 1, 1).data].slice(0, 3);
      results.push(orientation === 'portrait' ? sample(4, layout.seam) : sample(layout.seam, 4));
      results.push(orientation === 'portrait' ? sample(-4, layout.seam) : sample(layout.seam, -4));
    }
    return results;
  });
  expect(samples).toHaveLength(8);
  for (const sample of samples) expect(sample).toEqual([131, 147, 163]);
});
