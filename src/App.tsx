import { useEffect, useMemo, useState } from 'react';
import SearchBar from './components/SearchBar';
import ProductCard from './components/ProductCard';
import type { Product } from './types';
import { parseQuery, filterAndScoreProducts } from './lib/search';
export default function App() {
 const [all, setAll] = useState<Product[]>([]);
 const [q, setQ] = useState('');
 useEffect(() => {
 const url = new URL(`${import.meta.env.BASE_URL}data/walmart_products.json`, window.location.href);
 fetch(url.toString()).then(r => r.json()).then((rows: Product[]) => setAll(rows)).catch(err => console.error('Failed to load dataset', err));
 }, []);
 const parsed = useMemo(() => parseQuery(q), [q]);
 const results = useMemo(() => filterAndScoreProducts(all, parsed), [all, parsed]);
 return (
 <main className='mx-auto max-w-5xl p-6'>
 <header className='mb-6'>
 <h1 className='text-2xl font-bold'>Walmart Product Search</h1>
 <p className='text-gray-600'>(Assignment) Build a simple product search React app using Walmart.com products (e.g., Electric Bike). Search by <b>Price</b>, <b>Name</b>, <b>ID</b>, and <b>Description</b>.</p>
 </header>
 <SearchBar value={q} onChange={setQ} onClear={() => setQ('')} />
 <section className='mt-6'>
 <div className='mb-2 text-sm text-gray-600'>Showing <b>{results.length}</b> of {all.length} products</div>
 {results.length === 0 ? (
 <div className='rounded-xl border bg-white p-6 text-gray-600'>No products match. Try <code>price:500-800</code> or <code>id:15102669883</code>.</div>
 ) : (
 <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>{results.map(p => <ProductCard key={p.id} p={p} />)}</div>
 )}
 </section>
 <footer className='mt-10 text-xs text-gray-500'>Dataset: Walmart item URLs (snapshot). For demo only.</footer>
 </main>
 );
}