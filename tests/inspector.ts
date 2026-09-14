import type { Locator, Page } from '@playwright/test';

export async function revealInspector(control: Locator) {
  await control.waitFor({ state: 'attached' });
  const panel = await control.evaluate(element => element.closest('[role="tabpanel"]')?.getAttribute('aria-labelledby'));
  if (panel) {
    const tab = control.page().locator(`#${panel}`);
    if (await tab.getAttribute('aria-selected') !== 'true') await tab.click();
  }
  for (const details of await control.locator('xpath=ancestor::details').all()) {
    if (await details.getAttribute('open') === null) await details.locator(':scope > summary').click();
  }
}

export async function expandInspector(page: Page, label: string) {
  const summary = page.locator('summary').filter({ hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });
  await revealInspector(summary);
  if (await summary.locator('..').getAttribute('open') === null) await summary.click();
}
