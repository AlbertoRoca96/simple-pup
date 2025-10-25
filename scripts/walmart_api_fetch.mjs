import fs from 'node:fs/promises';
import path from 'node:path';

const CATALOG = path.resolve('public/data/walmart_products.json');
const CLIENT_ID = process.env.WALMART_CLIENT_ID;
const CLIENT_SECRET = process.env.WALMART_CLIENT_SECRET;
const QUERIES = (process.env.WALMART_QUERIES || 'Electric Bike').split(',').map(s => s.trim()).filter(Boolean);

const TOKEN_URL = 'https://marketplace.walmartapis.com/v3/token';
const SEARCH_URL = 'https://marketplace.walmartapis.com/v3/items/walmart/search';

async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials'
  });
  
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    },
    body
  });
  
  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

function mapWalmartItem(item) {
  const id = String(item.itemId || item.usItemId || item.gtin || item.id || '').trim();
  const name = item.name || item.productName || item.title || '';
  const description = item.shortDescription || item.description || '';
  const priceNum = Number(item.currentItemPrice?.price || item.price || item.currentPrice || 0);
  const url = id ? `https://www.walmart.com/ip/${id}` : '';
  const image = item.imageUrl || item.images?.[0]?.url || '';
  
  return {
    id,
    name,
    price: priceNum,
    description,
    url,
    image
  };
}

async function searchProducts(token, query) {
  const params = new URLSearchParams({
    query,
    numItems: '25', // Limit per request
    sort: 'price_asc'
  });
  
  const response = await fetch(`${SEARCH_URL}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'WM_SVC.NAME': 'Walmart Marketplace',
      'WM_QOS.CORRELATION_ID': Date.now().toString()
    }
  });
  
  if (!response.ok) {
    throw new Error(`Search failed for "${query}": ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : (data.data?.items || []);
  
  return items.map(mapWalmartItem).filter(item => item.id && item.name);
}

async function main() {
  console.log('Starting Walmart catalog refresh...');
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('❌ No WALMART_CLIENT_ID or WALMART_CLIENT_SECRET found. Skipping API fetch.');
    console.log('Set these secrets in GitHub repository Settings > Secrets and variables > Actions');
    return;
  }
  
  // Load existing catalog
  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(CATALOG, 'utf8'));
    console.log(`📖 Loaded ${existing.length} existing items`);
  } catch (error) {
    console.log('🆕 No existing catalog found, starting fresh');
  }
  
  const accessToken = await getAccessToken();
  console.log('🔑 Got access token');
  
  const byId = new Map(existing.map(x => [x.id, x]));
  let totalNew = 0;
  
  for (const query of QUERIES) {
    console.log(`🔍 Searching for: ${query}`);
    try {
      const results = await searchProducts(accessToken, query);
      console.log(`📦 Found ${results.length} products for "${query}"`);
      
      for (const item of results) {
        const existingItem = byId.get(item.id);
        if (existingItem) {
          // Merge with existing item, preserve any additional fields
          byId.set(item.id, { ...existingItem, ...item });
        } else {
          byId.set(item.id, item);
          totalNew++;
        }
      }
      
      // Rate limiting - wait between queries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error searching for "${query}":`, error.message);
    }
  }
  
  const merged = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  
  await fs.mkdir(path.dirname(CATALOG), { recursive: true });
  await fs.writeFile(CATALOG, JSON.stringify(merged, null, 2));
  
  console.log(`✅ Success! Wrote ${merged.length} items to ${CATALOG}`);
  console.log(`🆕 Added ${totalNew} new products`);
  console.log(`🔄 Updated ${merged.length - totalNew} existing products`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});