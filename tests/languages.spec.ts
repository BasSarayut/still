import { expect, test } from '@playwright/test';

test('switches all three UI languages, remembers selection and preserves wallpaper content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#title')).toBeEnabled();
  await page.locator('#title').fill('เพลงของเรา / Our song / 私たちの歌');
  await page.locator('#artist').fill('My artist');
  await page.locator('#credit').fill('@my_name');
  await page.locator('#language').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Edit wallpaper', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeVisible();
  await page.getByRole('button', { name: 'How to use' }).click();
  await expect(page.getByText('Choose your iPhone model and upload a photo.')).toBeVisible();
  await page.getByRole('button', { name: 'Close help' }).click();
  await page.locator('#photo-upload').setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('broken') });
  await expect(page.getByRole('alert')).toContainText('Could not open this image');
  await page.locator('#language').selectOption('ja');
  await expect(page.getByRole('alert')).toContainText('この画像を開けません');
  await expect(page.getByRole('heading', { name: '壁紙を編集', exact: true })).toBeVisible();
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
  await page.locator('#language').selectOption('th');
  await expect(page.getByRole('heading', { name: 'แต่งวอลเปเปอร์', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
});

test('unsupported saved language falls back to Thai', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('still-language', 'unsupported'));
  await page.goto('/');
  await expect(page.locator('#language')).toHaveValue('th');
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
});
