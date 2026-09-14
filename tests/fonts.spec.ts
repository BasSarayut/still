import { expect, test } from '@playwright/test';

test('new fonts load locally and persist in every template', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!/^(http:\/\/localhost:5173|blob:|data:)/.test(request.url())) external.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('#template')).toBeEnabled();
  await page.locator('#language').selectOption('en');
  for (const [template, selector, font] of [
    ['custom', '#player-title-font', 'spaceGrotesk'],
    ['polaroid', '#polaroid-title-font', 'mali'],
    ['albumCover', '#cover-font', 'thaiSerif'],
    ['concertTicket', '#ticket-field-font', 'oswald'],
  ]) {
    await page.locator('#template').selectOption(template);
    if (template !== 'albumCover') await page.getByText('Fonts & text colors', { exact: true }).click();
    const picker = page.locator(selector);
    await expect(picker.locator('option')).toHaveCount(16);
    await expect(picker.locator('optgroup').first()).toHaveAttribute('label', /Recommended/);
    await picker.selectOption(font);
    await expect(picker).toHaveValue(font);
    await expect(page.getByRole('status').first()).toContainText('Saved on this device');
    await page.reload();
    await expect(picker).toHaveValue(font);
  }
  const loaded = await page.evaluate(async () => {
    const { coverFonts } = await import('/src/albumCover.ts');
    const names = ['anuphan', 'thaiSerif', 'kanit', 'mali', 'dmSans', 'spaceGrotesk', 'playfair', 'cormorant', 'oswald', 'robotoMono'];
    return Promise.all(names.map(async name => {
      const family = coverFonts[name].split(',')[0];
      const faces = await document.fonts.load(`400 24px ${family}`, 'ความทรงจำ Memories');
      return { name, loaded: faces.length > 0 && faces.every(face => face.status === 'loaded') };
    }));
  });
  expect(loaded.every(font => font.loaded)).toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
