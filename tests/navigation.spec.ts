import { expect, test } from '@playwright/test';

test('section shortcuts keep tools reachable and mobile preview returns to the current edit', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('still-language', 'en'));
  await page.goto('/');
  await expect(page.locator('#template')).toBeEnabled();
  const mobileLayout = (page.viewportSize()?.width ?? 1440) < 960;

  if (mobileLayout) {
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Preview', exact: true })).toBeVisible();
  }

  const navigation = page.getByRole('navigation', { name: 'Jump to editing section' });
  await navigation.getByRole('link', { name: 'Text', exact: true }).click();
  await expect(page.locator('#section-04')).toBeFocused();
  const heading = await page.locator('#section-04').boundingBox();
  const menu = await navigation.boundingBox();
  expect(heading!.y).toBeGreaterThanOrEqual(menu!.y + menu!.height);
  await page.locator('#title').fill('A moment worth keeping');

  if (mobileLayout) {
    const editPosition = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeVisible();
    await expect(page.locator('.preview-stage')).toBeInViewport();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.locator('#title')).toBeFocused();
    expect(Math.abs(await page.evaluate(() => window.scrollY) - editPosition)).toBeLessThan(2);
  } else {
    await expect(page.locator('.preview-stage')).toBeInViewport();
    await expect(page.locator('.jump-preview')).toBeHidden();
  }

  await expect(page.locator('#title')).toHaveValue('A moment worth keeping');
  await navigation.getByRole('link', { name: 'Photo', exact: true }).click();
  await expect(page.locator('#section-03')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.upload-zone')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
