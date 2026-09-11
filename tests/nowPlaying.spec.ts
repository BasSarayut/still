import { expect, test } from '@playwright/test';

test('Now Playing template hides manual colors, renders a dark computed background, and restores custom colors on switch back', async ({ page }) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://localhost:5173') && !request.url().startsWith('blob:') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByLabel('รุ่น iPhone', { exact: true })).toBeEnabled();

  const imageData = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 600;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#e8e4da'; context.fillRect(0, 0, 600, 600);
    context.fillStyle = '#cfd8d6'; context.fillRect(600, 0, 600, 600);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#photo-upload').setInputFiles({ name: 'two-colors.png', mimeType: 'image/png', buffer: Buffer.from(imageData, 'base64') });
  await expect(page.getByRole('button', { name: 'ดาวน์โหลด PNG' })).toBeEnabled();

  await expect(page.locator('#background')).toBeVisible();
  await expect(page.locator('.swatches')).toBeVisible();
  const backgroundBefore = await page.locator('#background').inputValue();

  await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('nowPlaying');
  await expect(page.locator('#background')).toHaveCount(0);
  await expect(page.locator('.swatches')).toHaveCount(0);
  await expect(page.getByText('พื้นหลังและสีข้อความคำนวณอัตโนมัติจากรูปสำหรับเทมเพลตนี้')).toBeVisible();
  await expect(page.getByText('02 / Now Playing (ธีมมืด)')).toBeVisible();

  const firstDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ดาวน์โหลด PNG' }).click();
  await firstDownload;
  const corner = await page.evaluate(async () => {
    const anchor = document.querySelector<HTMLAnchorElement>('.download-result a')!;
    const image = new Image(); image.src = anchor.href; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    return [...context.getImageData(4, 4, 1, 1).data];
  });
  expect(corner[0] + corner[1] + corner[2]).toBeLessThan(200);

  await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('custom');
  await expect(page.locator('#background')).toBeVisible();
  await expect(page.locator('#background')).toHaveValue(backgroundBefore);
  await expect(page.getByText('01 / เครื่องเล่นเพลง')).toBeVisible();

  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});
