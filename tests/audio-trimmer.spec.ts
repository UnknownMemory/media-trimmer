import { test, expect } from '@playwright/test';

test('should load the main and the example file', async ({ page }) => {
  await page.goto('/');


  await expect(page).toHaveTitle(/Audio Trimmer/);

  await page.getByTestId("example-file-btn").click()

  await expect(page.locator('text="DJ YARI - EVERYTHING IS BUSINES PT.2"')).toBeVisible()
});

