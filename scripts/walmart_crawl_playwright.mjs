import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const CATALOG = path.resolve('public/data/walmart_products.json');
const MAX = Number(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '100');
const DRY = !process.argv.includes('--dryRun=false');

// Walmart known sitemaps for product discovery
const SITEMAPS = [
  'https://www.walmart.com/sitemap_rp_01.xml',
  'https://www.walmart.com/sitemap_rp_02.xml'
];

/**
 * Simple approach: use existing catalog URLs
 * In production, you'd parse sitemaps respecting robots.txt
 */
async function discoverProductUrls() {
  try {
    const catalog = JSON.parse(await fs.readFile(CATALOG, 'utf8'));
    const urls = catalog
      .map(x => x.url)
      .filter(Boolean)
      .slice(0, MAX);
    
    console.log(`📋 Using ${urls.length} URLs from existing catalog`);
    return urls;
  } catch (error) {
    console.log('❌ Could not load catalog for URL discovery');
    return [];
  }
}

/**
 * Extract product images from Walmart product pages
 */
async function extractProductData(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; SimplePupBot/1.0; +https://github.com/AlbertoRoca96/simple-pup)'
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 45000
    });
    
    const productData = await page.evaluate(() => {
      // Try structured data first
      const structuredData = [...document.querySelectorAll('script[type="application\/ld+json"]')]
        .map(s => {
          try {
            return JSON.parse(s.textContent || '{}');
          } catch {
            return {};
          }
        })
        .find(doc => doc['@type']?.includes('Product'));
      
      const image = 
        document.querySelector('meta[property="og:image"]')?.content ||
        structuredData?.image ||
        document.querySelector('[data-testid="product-image"] img')?.src ||
        document.querySelector('.hero-image img')?.src ||
        '';
      
      const name = 
        document.querySelector('meta[property="og:title"]')?.content ||
        structuredData?.name ||
        document.querySelector('h1')?.textContent?.trim() ||
        document.title;
      
      const price = 
        document.querySelector('[data-testid="price-current"]')?.textContent ||
        document.querySelector('.price-main')?.textContent ||
        structuredData?.offers?.price ||
        '';
      
      // Clean up image URL
      if (image && !image.startsWith('http')) {
        return { image: new URL(image, window.location.origin).href, name, price };
      }
      
      return { image, name, price };
    });
    
    await page.waitForTimeout(1000); // Rate limiting
    return { url, ...productData };
    
  } catch (error) {
    console.log(`⚠️  Failed to process ${url}: ${error.message}`);
    return { url, image: '', name: '', price: '' };
  } finally {
    await browser.close();
  }
}

/**
 * Enrich products with missing images and data
 */
async function enrichProducts() {
  const urls = await discoverProductUrls();
  if (urls.length === 0) {
    console.log('❌ No URLs to process');
    return;
  }
  
  console.log(`🔍 Enriching ${urls.length} products (dry run: ${DRY})`);
  
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`📸 Processing ${i + 1}/${urls.length}: ${url.substring(url.lastIndexOf('/') + 1)}`);
    
    const data = await extractProductData(url);
    results.push(data);
  }
  
  if (DRY) {
    console.log('\n🔍 DRY RUN RESULTS:');
    results.forEach(r => {
      console.log(`${r.url}: ${r.image ? '✅ Image' : '❌ No image'}, ${r.name ? '✅ Name' : '❌ No name'}`);
    });
    return;
  }
  
  // Merge with existing catalog
  const catalog = JSON.parse(await fs.readFile(CATALOG, 'utf8'));
  const byUrl = new Map(catalog.map(p => [p.url, p]));
  
  let updated = 0;
  for (const enrichment of results) {
    const existing = byUrl.get(enrichment.url);
    if (existing) {
      const updatedItem = {
        ...existing,
        image: existing.image || enrichment.image,
        name: existing.name || enrichment.name
      };
      byUrl.set(enrichment.url, updatedItem);
      
      if (enrichment.image && !existing.image) updated++;
    }
  }
  
  const merged = Array.from(byUrl.values()).sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(CATALOG, JSON.stringify(merged, null, 2));
  
  console.log(`✅ Enrichment complete! Updated ${updated} items with images`);
}

async function main() {
  console.log('🕷️  Starting Playwright enrichment...');
  await enrichProducts();
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});