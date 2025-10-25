import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('public/data');
const SINGLE_FILE = path.join(OUT_DIR, 'walmart_products.json');
const INDEX_FILE = path.join(OUT_DIR, 'index.json');
const LIMIT_MB = 5;

const CLIENT_ID = process.env.WALMART_CLIENT_ID;
const CLIENT_SECRET = process.env.WALMART_CLIENT_SECRET;
const QUERIES = (process.env.WALMART_QUERIES || 'Electric Bike').split(',').map(s => s.trim()).filter(Boolean);

const TOKEN_URL = 'https://marketplace.walmartapis.com/v3/token';
const SEARCH_URL = 'https://marketplace.walmartapis.com/v3/items/walmart/search';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log('No WALMART_* secrets; skipping refresh.');
  process.exit(0);
}

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
  if (!id) return null;
  
  const name = item.name || item.productName || item.title || 'Unknown Item';
  const description = (item.shortDescription || item.description || '').toString().slice(0, 300);
  const priceRaw = item.currentItemPrice?.price ?? item.currentPrice ?? item.price ?? null;
  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw) || 0;
  const url = `https://www.walmart.com/ip/${id}`;
  const image = item.imageUrl || (Array.isArray(item.images) && item.images[0]?.url) || '';
  const category = 'Electric Bike';
  
  return {
    id,
    name,
    price,
    currency: 'USD',
    description,
    url,
    image,
    category,
    priceValidAt: new Date().toISOString().slice(0, 10),
    source: 'walmart-api',
    lastSeen: new Date().toISOString()
  };
}

async function fetchProductsByQuery(token, query) {
  const params = new URLSearchParams({
    query,
    numItems: '25',
    sort: 'relevance_desc'
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
  
  return items.map(mapWalmartItem).filter(Boolean);
}

async function loadExistingData() {
  try {
    const content = await fs.readFile(SINGLE_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    // Try to load from chunks if single file doesn't exist
    try {
      const indexContent = await fs.readFile(INDEX_FILE, 'utf8');
      const index = JSON.parse(indexContent);
      
      // Load all chunks
      const allItems = [];
      for (const filename of index.files) {
        const chunkPath = path.join(OUT_DIR, filename);
        const chunkContent = await fs.readFile(chunkPath, 'utf8');
        allItems.push(...JSON.parse(chunkContent));
      }
      return allItems;
    } catch {
      return [];
    }
  }
}

function getSizeInMB(data) {
  return Buffer.byteLength(JSON.stringify(data)) / 1024 / 1024;
}

async function writeSingleOrChunked(items) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  
  const lastRefreshed = new Date().toISOString();
  
  if (getSizeInMB(items) <= LIMIT_MB) {
    // Single file approach
    await fs.writeFile(SINGLE_FILE, JSON.stringify(items, null, 2));
    await fs.writeFile(INDEX_FILE, JSON.stringify({
      totalItems: items.length,
      lastRefreshed,
      files: ['walmart_products.json']
    }, null, 2));
    console.log('✅ Wrote single file with', items.length, 'items');
  } else {
    // Chunked approach
    const files = [];
    const CHUNK_SIZE = 2000;
    
    for (let offset = 0; offset < items.length; offset += CHUNK_SIZE) {
      const chunk = items.slice(offset, offset + CHUNK_SIZE);
      const filename = `catalog-${String(files.length).padStart(3, '0')}.json`;
      const filepath = path.join(OUT_DIR, filename);
      
      await fs.writeFile(filepath, JSON.stringify(chunk));
      files.push(filename);
      console.log(`✅ Wrote chunk ${filename} with ${chunk.length} items`);
    }
    
    await fs.writeFile(INDEX_FILE, JSON.stringify({
      totalItems: items.length,
      lastRefreshed,
      files
    }, null, 2));
    
    console.log(`✅ Wrote ${files.length} chunks totaling ${items.length} items`);
  }
}

async function main() {
  console.log('🚀 Starting Walmart catalog refresh...');
  console.log('🔍 Queries:', QUERIES.join(', '));
  
  try {
    const token = await getAccessToken();
    console.log('✅ Got access token');
    
    const existingData = await loadExistingData();
    console.log(`📖 Loaded ${existingData.length} existing items`);
    
    const byId = new Map(existingData.map(item => [item.id, item]));
    
    for (const query of QUERIES) {
      console.log(`🔍 Searching: ${query}`);
      try {
        const results = await fetchProductsByQuery(token, query);
        console.log(`📦 Found ${results.length} products for "${query}"`);
        
        // Merge with existing data
        for (const item of results) {
          const existing = byId.get(item.id);
          byId.set(item.id, {
            ...existing,
            ...item,
            lastSeen: new Date().toISOString()
          });
        }
        
        // Rate limiting between queries
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to search "${query}":`, error.message);
      }
    }
    
    const mergedItems = Array.from(byId.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    
    await writeSingleOrChunked(mergedItems);
    
    console.log(`🎉 Success! Processed ${mergedItems.length} total items`);
    console.log(`📁 Files written to public/data/`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();