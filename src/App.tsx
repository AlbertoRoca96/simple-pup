import { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import type { Product } from './types';
import { parseQuery, filterAndScoreProducts } from './lib/search';
import Fuse from 'fuse.js';
interface CatalogIndex {
 totalItems: number;
 lastRefreshed: string;
 files: string[];
}

export default function App() {
 const [all, setAll] = useState<Product[]>([]);
 const [q, setQ] = useState('');
 const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'id'>('name');
 const [page, setPage] = useState(1);
 const [catalogIndex, setCatalogIndex] = useState<CatalogIndex | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const itemsPerPage = 12;
 
 useEffect(() => {
 setIsLoading(true);
 
 async function loadCatalog() {
   try {
     // Try to load index.json first
     const indexUrl = new URL(`${import.meta.env.BASE_URL}data/index.json`, window.location.href);
     let data: Product[] = [];
     let indexInfo: CatalogIndex | null = null;
     
     try {
       const indexResponse = await fetch(indexUrl.toString());
       indexInfo = await indexResponse.json();
       setCatalogIndex(indexInfo);
       
       // Load catalog based on index
       if (indexInfo && indexInfo.files.length === 1 && indexInfo.files[0] === 'walmart_products.json') {
         // Single file case
         const dataUrl = new URL(`${import.meta.env.BASE_URL}data/walmart_products.json`, window.location.href);
         const dataResponse = await fetch(dataUrl.toString());
         data = await dataResponse.json();
       } else if (indexInfo) {
         // Chunked case - load all chunks
         const allChunks = await Promise.all(
           indexInfo.files.map(async (filename) => {
             const chunkUrl = new URL(`${import.meta.env.BASE_URL}data/${filename}`, window.location.href);
             const response = await fetch(chunkUrl.toString());
             return response.json();
           })
         );
         data = allChunks.flat();
       }
     } catch (indexError) {
       // Fallback to single file if index.json doesn't exist
       console.log('Index.json not found, falling back to single file');
       const dataUrl = new URL(`${import.meta.env.BASE_URL}data/walmart_products.json`, window.location.href);
       const dataResponse = await fetch(dataUrl.toString());
       data = await dataResponse.json();
       
       // Create synthetic index for backward compatibility
       const syntheticIndex: CatalogIndex = {
         totalItems: data.length,
         lastRefreshed: new Date().toISOString(),
         files: ['walmart_products.json']
       };
       setCatalogIndex(syntheticIndex);
     }
     
     setAll(data);
   } catch (error) {
     console.error('Failed to load dataset', error);
   } finally {
     setIsLoading(false);
   }
 }
 
 loadCatalog();
 }, []);
 
 // Initialize Fuse.js for fuzzy search
 const fuse = useMemo(() => {
  if (!all.length) return null;
  return new Fuse(all, {
   keys: ['name', 'description'],
   threshold: 0.4,
   includeScore: true
  });
 }, [all]);
 
 const parsed = useMemo(() => parseQuery(q), [q]);
 
 // Filter using exact matching first
 const exactResults = useMemo(() => filterAndScoreProducts(all, parsed), [all, parsed]);
 
 // Add fuzzy search for keyword searches
 const fuzzyResults = useMemo(() => {
  if (!fuse || !parsed.terms || parsed.terms.length === 0) return [];
  const fused = fuse.search(parsed.terms.join(' '));
  return fused.map(result => ({ ...result.item, fuzzyScore: result.score || 1 }));
 }, [fuse, parsed.terms]);
 
 // Combine and deduplicate results
 const combinedResults = useMemo(() => {
  const seen = new Set();
  const result = [];
  
  // Add exact matches first
  for (const item of exactResults) {
   if (!seen.has(item.id)) {
    result.push(item);
    seen.add(item.id);
   }
  }
  
  // Add fuzzy matches that weren't already included
  for (const item of fuzzyResults) {
   if (!seen.has(item.id)) {
    result.push(item);
    seen.add(item.id);
   }
  }
  
  return result;
 }, [exactResults, fuzzyResults]);
 
 // Sort results
 const sortedResults = useMemo(() => {
  const sorted = [...combinedResults];
  switch (sortBy) {
   case 'name':
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
   case 'price_asc':
    return sorted.sort((a, b) => a.price - b.price);
   case 'price_desc':
    return sorted.sort((a, b) => b.price - a.price);
   case 'id':
    return sorted.sort((a, b) => a.id.localeCompare(b.id));
   default:
    return sorted;
  }
 }, [combinedResults, sortBy]);
 
 // Pagination
 const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
 const paginatedResults = useMemo(() => {
  const start = (page - 1) * itemsPerPage;
  return sortedResults.slice(start, start + itemsPerPage);
 }, [sortedResults, page]);
 
 // Reset page when query or sort changes
 useEffect(() => {
  setPage(1);
 }, [q, sortBy]);
 return (
 <main className='mx-auto max-w-5xl p-6'>
 <header className='mb-6'>
 <h1 className='text-2xl font-bold'>Walmart Product Search</h1>
 <p className='text-gray-600'>Search by <b>Price</b>, <b>Name</b>, <b>ID</b>, and <b>Description</b>. Advanced mode with live Walmart data!</p>
 </header>
 
 <SearchBar value={q} onChange={setQ} onClear={() => setQ('')} />
 
 {/* Status Badge */}
 <div className='mt-4 flex items-center justify-between flex-wrap gap-2'>
  {catalogIndex && (
   <div className='inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-800'>
    <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
    <span className='font-medium'>{catalogIndex.totalItems.toLocaleString()} products</span>
    <span className='text-green-600'>•</span>
    <span>Last refreshed: {new Date(catalogIndex.lastRefreshed).toLocaleDateString()}</span>
   </div>
  )}
  
  {isLoading && (
   <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-800'>
    <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></span>
    Loading catalog...
   </div>
  )}
 </div>
 
 {/* Sorting Controls */}
 <div className='mt-4 flex items-center gap-2'>
  <label htmlFor='sort' className='text-sm font-medium text-gray-700'>Sort by:</label>
  <select
   id='sort'
   value={sortBy}
   onChange={(e) => setSortBy(e.target.value as any)}
   className='rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  >
   <option value='name'>Name</option>
   <option value='price_asc'>Price ↑</option>
   <option value='price_desc'>Price ↓</option>
   <option value='id'>Item ID</option>
  </select>
 </div>
 
 <section className='mt-6'>
  {/* Loading state */}
  {isLoading ? (
   <div className='rounded-xl border bg-white p-12 text-center'>
    <div className='inline-flex items-center gap-3 text-gray-600'>
     <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
     <span>Loading Walmart catalog...</span>
    </div>
   </div>
  ) : (
   <>
    {/* Results status with aria-live */}
    <div className='mb-4 text-sm text-gray-600' aria-live='polite' aria-atomic='true'>
     Showing <b>{paginatedResults.length}</b> of <b>{sortedResults.length}</b> results 
     {q && ` for "${q}"`}
     {totalPages > 1 && ` (page ${page} of ${totalPages})`}
    </div>
    
    {paginatedResults.length === 0 ? (
     <div className='rounded-xl border bg-white p-6 text-gray-600'>
      No products match. Try <code>price:500-800</code>, <code>id:15102669883</code>, or <code>electric bike</code>.
     </div>
    ) : (
     <>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
       {paginatedResults.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
       <div className='mt-6 flex justify-center gap-2'>
        <button
         onClick={() => setPage(p => Math.max(1, p - 1))}
         disabled={page === 1}
         className='rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50'
        >
         Previous
        </button>
        
        <span className='px-3 py-1 text-sm'>
         Page {page} of {totalPages}
        </span>
        
        <button
         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
         disabled={page === totalPages}
         className='rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50'
        >
         Next
        </button>
       </div>
      )}
     </>
    )}
   </>
  )}
 </section>
 
 <footer className='mt-10 text-xs text-gray-500'>
  Advanced mode: Hybrid search with Walmart API + Playwright enrichment. Auto-refreshed daily.
 </footer>
 </main>
 );
}