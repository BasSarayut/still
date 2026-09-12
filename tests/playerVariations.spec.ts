import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/'); await expect(page.locator('#template')).toBeEnabled(); await page.locator('#language').selectOption('en');
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext('2d')!, sky = ctx.createLinearGradient(0, 0, 1200, 800);
    sky.addColorStop(0, '#c6aaa1'); sky.addColorStop(0.6, '#8ca6aa'); sky.addColorStop(1, '#3b646b'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1200, 800);
    ctx.fillStyle = '#eee0bc'; ctx.beginPath(); ctx.arc(850, 180, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#52696b'; ctx.beginPath(); ctx.moveTo(0, 670); ctx.lineTo(360, 350); ctx.lineTo(840, 800); ctx.lineTo(0, 800); ctx.fill();
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('#photo-upload').setInputFiles({ name: 'evening.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
}

test('new player presets keep personal content and crop, with working non-square photo positioning', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await setup(page);
  await page.locator('#title').fill('เพลงของเรา / Our song'); await page.locator('#artist').fill('THE EVENING LIGHT');
  await page.locator('#background').fill('#e9e2d7'); await page.locator('#zoom').fill('2');
  await page.getByRole('switch', { name: 'Lock Screen preview', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Lyric Focus', exact: true }).click();
  await page.locator('#player-lyrics').fill('เก็บเพลงนี้ไว้\n君と見た夕暮れ\nA moment to remember');
  await page.locator('#player-extraText').fill('CHIANG MAI · OUR LITTLE PLAYLIST');
  await page.getByRole('button', { name: 'Vinyl Session', exact: true }).click();
  await page.locator('#player-recordLabel').fill('SIDE B · 007');
  for (const name of ['Mini Player', 'Glass Player', 'Lyric Focus', 'Vinyl Session']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#title')).toHaveValue('เพลงของเรา / Our song'); await expect(page.locator('#zoom')).toHaveValue('2');
    await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
    await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath(`${name}.png`) });
  }
  await page.getByRole('button', { name: 'Mini Player', exact: true }).click();
  await page.getByText('Artwork & layout', { exact: true }).click();
  await page.locator('#player-artworkShape').selectOption('portrait'); await page.locator('#player-artworkSide').selectOption('right');
  await page.getByText('Player appearance', { exact: true }).click();
  await page.locator('#player-progressStyle').selectOption('waveform'); await page.locator('#player-progressThumb').selectOption('ring');
  await page.locator('#player-controls').selectOption('full');
  for (const name of ['Show previous track', 'Show next track', 'Show shuffle', 'Show repeat']) await page.getByRole('switch', { name, exact: true }).uncheck();
  const photo = page.locator('.artwork-hit'); await photo.scrollIntoViewIfNeeded();
  const frame = (await photo.boundingBox())!;
  expect(frame.width / frame.height).toBeCloseTo(0.75, 2);
  await page.mouse.move(frame.x + frame.width / 2, frame.y + frame.height / 2); await page.mouse.down();
  await page.mouse.move(frame.x + frame.width / 2 + 16, frame.y + frame.height / 2, { steps: 4 }); await page.mouse.up();
  await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
  const saved = await page.evaluate(async () => { const path = '/src/storage.ts'; return (await import(path)).loadDraft(); });
  expect(saved.crop.x).toBeLessThan(0.5);
  expect(saved.player).toMatchObject({ layout: 'mini', artworkShape: 'portrait', artworkSide: 'right', progressStyle: 'waveform', progressThumb: 'ring', showPrevious: false, showNext: false, showShuffle: false, showRepeat: false, recordLabel: 'SIDE B · 007', lyrics: 'เก็บเพลงนี้ไว้\n君と見た夕暮れ\nA moment to remember', extraText: 'CHIANG MAI · OUR LITTLE PLAYLIST' });
  expect(saved.background).toBe('#e9e2d7');
  await page.reload(); await expect(page.locator('#template')).toBeEnabled();
  await page.getByText('Artwork & layout', { exact: true }).click(); await expect(page.locator('#player-artworkShape')).toHaveValue('portrait'); await expect(page.locator('#player-artworkSide')).toHaveValue('right');
  await page.locator('#player-artworkShape').selectOption('circle');
  const round = await photo.evaluate(element => ({ radius: getComputedStyle(element).borderTopLeftRadius, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }));
  expect(round.radius).toContain('50%'); expect(round.width).toBeCloseTo(round.height, 1);
  await page.getByText('Player appearance', { exact: true }).click();
  await expect(page.getByRole('switch', { name: 'Show next track', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Lyric Focus', exact: true }).click(); await expect(page.locator('#player-lyrics')).toHaveValue(saved.player.lyrics);
  await page.locator('#language').selectOption('ja'); await expect(page.locator('#player-extraText')).toHaveValue(saved.player.extraText);
  await page.locator('#language').selectOption('th'); await expect(page.locator('#title')).toHaveValue(saved.title);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(errors).toEqual([]);
});

test('glass surface, vinyl and decorative progress export correctly without lock-screen guides', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await setup(page);
  await page.getByRole('button', { name: 'Glass Player', exact: true }).click();
  await page.locator('#player-background-mode').selectOption('solid'); await page.locator('#background').fill('#112233');
  await page.getByText('Player panel', { exact: true }).click();
  await page.locator('#player-panel').selectOption('solid'); await page.locator('#player-panelColor').fill('#ffffff');
  await page.getByLabel('Panel opacity', { exact: true }).fill('100'); await expect(page.locator('#foreground')).toHaveValue('#232927');
  await page.getByText('Player appearance', { exact: true }).click();
  for (const style of ['line', 'thick', 'segments', 'waveform']) {
    await page.locator('#player-progressStyle').selectOption(style);
    await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath(`progress-${style}.png`) });
  }
  await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG' }).click(); await download;
  const pixels = await page.evaluate(async () => {
    const storagePath = '/src/storage.ts', layoutPath = '/src/musicPlayer.ts'; const { loadDraft } = await import(storagePath), { playerLayout } = await import(layoutPath);
    const draft = await loadDraft(), image = new Image(); image.src = document.querySelector<HTMLAnchorElement>('.download-result a')!.href; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
    const frame = playerLayout(470 * image.height / image.width, draft.player, draft.showPalette), unit = image.width / 470;
    return { width: image.width, height: image.height, corner: [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3), panel: [...ctx.getImageData(Math.round((frame.panel.left + 8) * unit), Math.round((frame.panel.top + frame.panel.height / 2) * unit), 1, 1).data].slice(0, 3), data: canvas.toDataURL() };
  });
  expect(pixels).toMatchObject({ width: 1179, height: 2556, corner: [17, 34, 51] });
  for (const channel of pixels.panel) expect(channel).toBeGreaterThan(230); // near-white; the artwork's soft drop shadow legitimately tints the panel slightly
  await page.getByRole('switch', { name: 'Lock Screen preview', exact: true }).uncheck();
  const second = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG' }).click(); await second;
  const plain = await page.evaluate(async () => {
    const image = new Image(); image.src = document.querySelector<HTMLAnchorElement>('.download-result a')!.href; await image.decode(); const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; canvas.getContext('2d')!.drawImage(image, 0, 0); return canvas.toDataURL();
  });
  expect(plain).toBe(pixels.data);
  await page.getByRole('button', { name: 'Vinyl Session', exact: true }).click();
  await page.locator('#player-recordColor').fill('#293b42'); await page.locator('#player-recordLabelColor').fill('#f0bf80'); await page.locator('#player-recordLabel').fill('OUR SIDE A');
  await page.getByLabel('Record reveal', { exact: true }).fill('85');
  await expect(page.getByRole('status').first()).toHaveText('Saved on this device');
  await page.locator('.wallpaper').screenshot({ path: testInfo.outputPath('custom-vinyl.png') });
  const record = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG' }).click(); await record;
  const label = await page.evaluate(async () => {
    const storagePath = '/src/storage.ts', layoutPath = '/src/musicPlayer.ts'; const { loadDraft } = await import(storagePath), { playerLayout } = await import(layoutPath);
    const draft = await loadDraft(), image = new Image(); image.src = document.querySelector<HTMLAnchorElement>('.download-result a')!.href; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
    const frame = playerLayout(470 * image.height / image.width, draft.player, draft.showPalette), unit = image.width / 470;
    return [...ctx.getImageData(Math.round((frame.record.x + frame.record.radius * 0.2) * unit), Math.round((frame.record.y + frame.record.radius * 0.12) * unit), 1, 1).data].slice(0, 3);
  });
  expect(label).toEqual([240, 191, 128]);
});
