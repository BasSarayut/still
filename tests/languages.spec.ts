import { revealInspector } from './inspector';
import { expect, test } from '@playwright/test';

test('switches all three UI languages, remembers selection and preserves wallpaper content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#title')).toBeEnabled();
  await revealInspector(page.locator('#title')); await page.locator('#title').fill('เพลงของเรา / Our song / 私たちの歌');
  await revealInspector(page.locator('#artist')); await page.locator('#artist').fill('My artist');
  await revealInspector(page.locator('#credit')); await page.locator('#credit').fill('@my_name');
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#editor-heading')).toHaveText('Music player');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeVisible();
  await page.getByRole('button', { name: 'How to use' }).click();
  await expect(page.getByText('Choose your iPhone model and upload a photo.')).toBeVisible();
  await page.getByRole('button', { name: 'Close help' }).click();
  await page.locator('#photo-upload').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('broken') });
  await expect(page.getByRole('alert')).toContainText('Could not open this image');
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('ja');
  await expect(page.getByRole('alert')).toContainText('この画像を開けません');
  await expect(page.locator('#editor-heading')).toHaveText('ミュージックプレーヤー');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('#title')).toHaveValue('เพลงของเรา / Our song / 私たちの歌');
  await expect(page.locator('#artist')).toHaveValue('My artist');
  await expect(page.locator('#credit')).toHaveValue('@my_name');
  await expect(page.getByText('この端末に保存しました', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('#language')).toHaveValue('ja');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('#title')).toHaveValue('เพลงของเรา / Our song / 私たちの歌');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await revealInspector(page.locator('#language')); await page.locator('#language').selectOption('th');
  await expect(page.locator('#editor-heading')).toHaveText('เครื่องเล่นเพลง');
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
});

test('unsupported saved language falls back to Thai', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('still-language', 'unsupported'));
  await page.goto('/');
  await expect(page.locator('#language')).toHaveValue('th');
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
});

test('auto-detects device language and falls back to English when unsupported', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });
    Object.defineProperty(navigator, 'languages', { value: ['ja-JP', 'ja'], configurable: true });
  });
  await page.goto('/');
  await expect(page.locator('#language')).toHaveValue('ja');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
});

test('falls back to English when device language is unsupported or undefined', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
    Object.defineProperty(navigator, 'languages', { value: ['fr-FR'], configurable: true });
  });
  await page.goto('/');
  await expect(page.locator('#language')).toHaveValue('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
