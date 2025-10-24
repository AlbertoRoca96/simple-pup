import { test, expect } from '@playwright/test';

test('search by name, id and price', async ({ page }) => {
 await page.goto('/');
 await page.getByTestId('product-card').first().waitFor();
 await page.getByTestId('search-input').fill('Vivi');
 expect(await page.getByTestId('product-card').count()).toBeGreaterThan(0);
 await page.getByTestId('search-input').fill('id:15102669883');
 await expect(page.getByTestId('product-card')).toHaveCount(1);
 await page.getByTestId('search-input').fill('price:>=500');
 const cards = await page.getByTestId('product-card').all();
 for (const card of cards) {
 const priceText = await card.locator('text=$').first().textContent();
 const value = Number(priceText?.replace(/[^0-9.]/g, ''));
 expect(value).toBeGreaterThanOrEqual(500);
 }
});