import { test, expect } from '@playwright/test';

test('should load the main page and the example file', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Audio Trimmer/);

  await page.getByTestId("example-file-btn").click()

  await expect(page.locator('text="Street Fighter EX3 - Strange Sunset (Guile)"')).toBeVisible()
});

