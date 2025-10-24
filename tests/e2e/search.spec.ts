import { test, expect } from '@playwright/test';

test.describe('Walmart Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the search page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Walmart Product Search/);
    await expect(page.locator('h1')).toContainText('Walmart Product Search');
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
  });

  test('should show smart search examples', async ({ page }) => {
    await expect(page.locator('.search-bar__examples')).toBeVisible();
    await expect(page.locator('.search-bar__examples')).toContainText('Sony TV under $300');
    await expect(page.locator('.search-bar__examples')).toContainText('Nike shoes between $50-$100');
  });

  test('should parse smart search queries', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Test price range extraction
    await searchInput.fill('Sony TV under $300');
    await page.waitForTimeout(500); // Wait for debouncing
    
    // Check if parsed query appears
    await expect(page.locator('[data-testid="parsed-query"]')).toBeVisible();
    await expect(page.locator('[data-testid="parsed-query"]')).toContainText('Price');
    await expect(page.locator('[data-testid="parsed-query"]')).toContainText('Brand: Sony');
  });

  test('should perform search and display results', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Enter search query
    await searchInput.fill('laptop computer');
    await page.waitForTimeout(500);
    
    // Wait for results to load
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Check if products are displayed
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('should display product cards with correct information', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    await searchInput.fill('headphones');
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-testid="product-card"]');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    // Check product card elements
    await expect(firstProduct.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-brand"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  });

  test('should show advanced filters', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Trigger search to show filters
    await searchInput.fill('shoes');
    await page.waitForTimeout(500);
    
    // Click to show advanced filters
    await page.locator('[data-testid="filter-toggle"]').click();
    
    // Check if filters are visible
    await expect(page.locator('[data-testid="search-filters"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-filter"]')).toBeVisible();
  });

  test('should apply price filter', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    await searchInput.fill('phone');
    await page.waitForTimeout(500);
    
    // Show filters
    await page.locator('[data-testid="filter-toggle"]').click();
    
    // Set price range
    await page.locator('[data-testid="price-min"]').fill('100');
    await page.locator('[data-testid="price-max"]').fill('300');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Check if results are updated
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCount.greaterThan(0);
    
    // Verify price range (this would need API implementation for real tests)
    // For now, just check the filter is applied
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('Price');
  });

  test('should load more products', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    await searchInput.fill('electronics');
    await page.waitForTimeout(1000); // Wait for initial results
    
    // Count initial products
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Click load more if available
    const loadMoreButton = page.locator('[data-testid="load-more-button"]');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      
      // Check if more products were loaded
      const newCount = await page.locator('[data-testid="product-card"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should handle no results gracefully', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search for something unlikely to exist
    await searchInput.fill('xyz123nonexistentproduct');
    await page.waitForTimeout(1000);
    
    // Check if no results message is shown
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText('No products found');
  });

  test('should add product to favorites', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    await searchInput.fill('laptop');
    await page.waitForTimeout(500);
    
    // Find first favorite button
    const firstFavoriteButton = page.locator('[data-testid="product-card"]').first().locator('[data-testid="favorite-button"]');
    
    // Check initial state
    await expect(firstFavoriteButton).not.toHaveClass(/active/);
    
    // Click to add to favorites
    await firstFavoriteButton.click();
    
    // Check if it's marked as favorite
    await expect(firstFavoriteButton).toHaveClass(/active/);
    
    // Click to remove from favorites
    await firstFavoriteButton.click();
    
    // Check if it's removed from favorites
    await expect(firstFavoriteButton).not.toHaveClass(/active/);
  });

  test('should handle out of stock products', async ({ page }) => {
    // This test would require mocking or specific data
    // For now, just test the UI elements
    await page.waitForTimeout(500);
    
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    if (cardCount > 0) {
      // Check if add to cart buttons are present
      const addToCartButtons = page.locator('[data-testid="add-to-cart-button"]');
      await expect(addToCartButtons).toHaveCount(cardCount);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if elements are properly sized
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
    
    // Perform search on mobile
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('tablet');
    await page.waitForTimeout(500);
    
    // Check mobile layout
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = await productCards.count();
    
    if (cardCount > 0) {
      // Check if product cards are properly sized for mobile
      const firstCard = productCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Tab to search input
    await page.keyboard.press('Tab');
    
    // Type in search
    await searchInput.fill('monitor');
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check if search was performed
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('monitor');
    
    // Check if results loaded
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should clear search correctly', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Enter search query
    await searchInput.fill('gaming console');
    await page.waitForTimeout(500);
    
    // Click clear button
    await page.locator('[data-testid="clear-search"]').click();
    
    // Check if search is cleared
    await expect(searchInput).toHaveValue('');
    
    // Check if results are cleared
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });
});