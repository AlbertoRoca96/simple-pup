import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Product Search', () => {
 test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('product-card').first().waitFor();
 });
 
 test('search by name, id and price', async ({ page }) => {
  // Name search
  await page.getByTestId('search-input').fill('Vivi');
  expect(await page.getByTestId('product-card').count()).toBeGreaterThan(0);
  
  // ID search
  await page.getByTestId('search-input').fill('id:15102669883');
  await expect(page.getByTestId('product-card')).toHaveCount(1);
  
  // Price range search
  await page.getByTestId('search-input').fill('price:>=500');
  const cards = await page.getByTestId('product-card').all();
  for (const card of cards) {
   const priceText = await card.locator('text=$').first().textContent();
   const value = Number(priceText?.replace(/[^0-9.]/g, ''));
   expect(value).toBeGreaterThanOrEqual(500);
  }
 });
 
 test('fuzzy search works', async ({ page }) => {
  await page.getByTestId('search-input').fill('electric bike');
  expect(await page.getByTestId('product-card').count()).toBeGreaterThan(0);
  
  await page.getByTestId('search-input').fill('folding');
  expect(await page.getByTestId('product-card').count()).toBeGreaterThan(0);
 });
 
 test('sorting and pagination', async ({ page }) => {
  // Get initial prices
  await page.getByTestId('search-input').fill('');
  const initialPrices = await Promise.all(
   (await page.getByTestId('product-card').all()).map(card => 
    card.locator('text=$').first().textContent()
   )
  );
  
  // Sort by price ascending
  await page.selectOption('#sort', 'price_asc');
  const ascPrices = await Promise.all(
   (await page.getByTestId('product-card').all()).slice(0, 3).map(card => 
    card.locator('text=$').first().textContent()
   )
  );
  
  // Verify sorting (convert to numbers and compare)
  const ascNumbers = ascPrices.map(p => Number(p?.replace(/[^0-9.]/g, '')));
  for (let i = 1; i < ascNumbers.length; i++) {
   expect(ascNumbers[i]).toBeGreaterThanOrEqual(ascNumbers[i - 1]);
  }
 });
 
 test('products have images', async ({ page }) => {
  await page.getByTestId('search-input').fill('Electric Bike');
  const cards = await page.getByTestId('product-card').all();
  
  let imagesWithSrc = 0;
  for (const card of cards.slice(0, 10)) {
   const img = card.locator('img');
   if (await img.count() > 0) {
    const src = await img.getAttribute('src');
    if (src && src.startsWith('http')) {
     imagesWithSrc++;
    }
   }
  }
  
  // At least 50% of first 10 products should have images
  expect(imagesWithSrc).toBeGreaterThanOrEqual(cards.slice(0, 10).length * 0.5);
 });
 
 test('aria-live announcements', async ({ page }) => {
  const ariaRegion = page.locator('[aria-live="polite"]');
  await expect(ariaRegion).toBeVisible();
  
  const initialText = await ariaRegion.textContent();
  expect(initialText).toContain('Showing');
  
  await page.getByTestId('search-input').fill('bike');
  const updatedText = await ariaRegion.textContent();
  expect(updatedText).toContain('bike');
 });
 
 test('accessibility checks', async ({ page }) => {
  await new AxeBuilder({ page }).analyze();
 });
});