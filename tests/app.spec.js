import { expect, test } from '@playwright/test';

test('the store requests, caches, and updates a record', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page.locator('#status')).toHaveText('ok');
  await expect(page.locator('#title')).toHaveText('Hello from WarpDrive');
  await expect(page.locator('#updated-title')).toHaveText('Updated through the cache');
  await expect(page.locator('#debug')).toHaveText(testInfo.project.metadata.debug);
  expect(errors).toEqual([]);
});
