import { expect, test } from '@playwright/test';

test('inspector tabs preserve edits and support keyboard navigation', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#template')).toBeEnabled();
  await page.locator('#language').selectOption('en');
  const tab = (name: string) => page.getByRole('tab', { name, exact: true });
  await expect(tab('Photo')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.locator('#title')).toBeHidden();
  await tab('Text').click();
  await page.locator('#title').fill('A moment worth keeping');
  await page.locator('#player-title-font').selectOption('mali');
  await tab('Style').click();
  await page.locator('#background').fill('#ede5d4');
  await expect(page.locator('#title')).toBeHidden();
  await expect(page.locator('#player-controls')).toBeHidden();
  await page.getByText('Advanced settings', { exact: true }).click();
  await page.locator('summary').filter({ hasText: /^Player appearance$/ }).click();
  await page.locator('#player-controls').selectOption('compact');
  await tab('Text').click();
  await expect(page.locator('#title')).toHaveValue('A moment worth keeping');
  await expect(page.locator('#player-title-font')).toHaveValue('mali');
  await tab('Text').focus(); await tab('Text').press('ArrowRight');
  await expect(tab('Style')).toBeFocused();
  await expect(page.locator('#player-controls')).toHaveValue('compact');
  await tab('Style').press('End'); await expect(tab('Size')).toBeFocused();
  await expect(page.locator('#device')).toBeVisible();
  await tab('Size').press('ArrowRight'); await expect(tab('Photo')).toBeFocused();
  await expect(page.locator('.export-button')).toBeDisabled();
  await expect(page.locator('#export-hint')).toHaveText('Add a photo to get started');
  await expect(page.locator('.export-metadata')).toContainText('1179 × 2556');
  await page.locator('.inspector').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('inspector-photo.png') });
  await tab('Text').click();
  await page.screenshot({ path: testInfo.outputPath('inspector-text.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('all templates expose their own tools and preserve content across tabs', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#template')).toBeEnabled();
  await page.locator('#language').selectOption('en');
  for (const [template, content] of [['custom', '#title'], ['polaroid', '#title'], ['albumCover', '#cover-text'], ['concertTicket', '#ticket-value']]) {
    await page.locator('#template').selectOption(template);
    await expect(page.getByRole('tab', { name: 'Photo', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Text', exact: true }).click();
    await page.locator(content).fill('Keep this text');
    await page.getByRole('tab', { name: 'Style', exact: true }).click();
    await expect(page.locator('#background')).toBeVisible();
    await page.getByRole('tab', { name: 'Size', exact: true }).click();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await page.getByRole('tab', { name: 'Text', exact: true }).click();
    await expect(page.locator(content)).toHaveValue('Keep this text');
  }
  await page.locator('#template').selectOption('albumCover');
  await page.locator('.cover-text-hit').first().click();
  await expect(page.getByRole('tab', { name: 'Text', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Horizontal (%)', { exact: true })).toBeHidden();
  await page.getByRole('tabpanel').getByText('Advanced settings', { exact: true }).click();
  await expect(page.getByLabel('Horizontal (%)', { exact: true })).toBeVisible();
  await page.locator('#language').selectOption('th');
  await expect(page.getByRole('tab', { name: 'ข้อความ', exact: true })).toHaveAttribute('aria-selected', 'true');
});
