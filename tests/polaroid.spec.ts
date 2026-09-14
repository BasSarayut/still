import { revealInspector } from './inspector';
import { expect, test } from '@playwright/test';

test('Polaroid keeps wall colors independent from the default paper and fits the smallest-margin device', async ({ page }) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://localhost:5173') && !request.url().startsWith('blob:') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByLabel('รุ่น iPhone', { exact: true })).toBeEnabled();

  const imageData = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 1200;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#7c9a92'; context.fillRect(0, 0, 1200, 1200);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#photo-upload').setInputFiles({ name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(imageData, 'base64') });
  await expect(page.getByRole('button', { name: 'ดาวน์โหลด PNG' })).toBeEnabled();

  await revealInspector(page.getByLabel('เลือกรูปแบบเทมเพลต')); await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('polaroid');
  await expect(page.getByText('02 / โพลารอยด์')).toBeVisible();
  // Unlike Now Playing, colors stay manually editable — the customization the Polaroid template adds.
  await revealInspector(page.locator('#background'));
  await expect(page.locator('#background')).toBeVisible();
  await expect(page.locator('.swatches')).toBeVisible();
  await expect(page.getByText('สีส่วนนี้ใช้กับพื้นหลังและข้อความนอกการ์ด', { exact: false })).toBeVisible();

  // Smallest vertical margin in the device lineup — confirms the card + caption fit without overflow.
  await revealInspector(page.getByLabel('รุ่น iPhone', { exact: true })); await page.getByLabel('รุ่น iPhone', { exact: true }).selectOption('iPhone 12 mini');
  await revealInspector(page.locator('#background')); await page.locator('#background').fill('#2c2a26');

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
  // The wall fills the full canvas edge-to-edge, so the corner pixel matches the chosen background exactly.
  expect(corner.slice(0, 3)).toEqual([0x2c, 0x2a, 0x26]);

  await revealInspector(page.getByLabel('เลือกรูปแบบเทมเพลต')); await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('custom');
  await expect(page.locator('#background')).toHaveValue('#2c2a26');
  await expect(page.getByText('01 / เครื่องเล่นเพลง')).toBeVisible();

  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('Polaroid progress bar and pause icon are on by default and can be toggled off independently', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByLabel('รุ่น iPhone', { exact: true })).toBeEnabled();

  // The player has its own progress setting inside a collapsed appearance group.
  await expect(page.getByRole('switch', { name: 'แสดงแถบเวลาเพลง' })).toHaveCount(0);
  await expect(page.getByText('แสดงไอคอนเล่น/หยุด')).toHaveCount(0);

  await revealInspector(page.getByLabel('เลือกรูปแบบเทมเพลต')); await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('polaroid');
  const progressToggle = page.getByRole('switch', { includeHidden: true, name: 'แสดงแถบเวลาเพลง' });
  const pauseToggle = page.getByRole('switch', { includeHidden: true, name: 'แสดงไอคอนเล่น/หยุด' });
  await expect(progressToggle).toBeChecked();
  await expect(pauseToggle).toBeChecked();

  await revealInspector(progressToggle); await progressToggle.click();
  await revealInspector(pauseToggle); await pauseToggle.click();
  await expect(progressToggle).not.toBeChecked();
  await expect(pauseToggle).not.toBeChecked();

  // Switching away and back preserves the choice, same as every other draft field.
  await revealInspector(page.getByLabel('เลือกรูปแบบเทมเพลต')); await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('custom');
  await revealInspector(page.getByLabel('เลือกรูปแบบเทมเพลต')); await page.getByLabel('เลือกรูปแบบเทมเพลต').selectOption('polaroid');
  await expect(progressToggle).not.toBeChecked();
  await expect(pauseToggle).not.toBeChecked();

  expect(errors).toEqual([]);
});
