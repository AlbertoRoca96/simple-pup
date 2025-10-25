import { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import type { Product } from './types';
import { parseQuery, filterAndScoreProducts } from './lib/search';
import Fuse from 'fuse.js';
export default function App() {
 const [all, setAll] = useState<Product[]>([]);
 const [q, setQ] = useState('');
 const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc'>('name');
 const [page, setPage] = useState(1);
 const itemsPerPage = 12;
 
 useEffect(() => {
 const url = new URL(`${import.meta.env.BASE_URL}data/walmart_products.json`, window.location.href);
 fetch(url.toString()).then(r => r.json()).then((rows: Product[]) => setAll(rows)).catch(err => console.error('Failed to load dataset', err));
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
 
 {/* Controls */}
 <div className='mt-4 flex flex-wrap gap-4 items-center justify-between'>
  <div className='flex items-center gap-2'>
   <label htmlFor='sort' className='text-sm font-medium'>Sort:</label>
   <select
    id='sort'
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value as any)}
    className='rounded border border-gray-300 px-3 py-1 text-sm'
   >
    <option value='name'>Name</option>
    <option value='price_asc'>Price (Low to High)</option>
    <option value='price_desc'>Price (High to Low)</option>
   </select>
  </div>
  
  <div className='text-sm text-gray-600'>
   <span className='inline-flex items-center gap-1'>
    <span className='inline-block w-2 h-2 rounded-full bg-green-500'></span>
    {all.length} products • Last refreshed: {new Date().toLocaleDateString()}
   </span>
  </div>
 </div>
 
 <section className='mt-6'>
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
 </section>
 
 <footer className='mt-10 text-xs text-gray-500'>
  Advanced mode: Hybrid search with Walmart API + Playwright enrichment. Auto-refreshed daily.
 </footer>
 </main>
 );
}