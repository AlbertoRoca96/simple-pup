import type { Product } from '../types';
export default function ProductCard({ p }: { p: Product }) {
 return (
 <a data-testid='product-card' href={p.url} target='_blank' rel='noreferrer noopener' className='block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow'>
 <div className='flex gap-4'>
 <div className='h-24 w-24 flex-shrink-0 rounded-xl bg-gray-100 grid place-items-center text-xs text-gray-500'><span>{p.image ? '' : 'No image'}</span></div>
 <div className='min-w-0'>
 <div className='flex items-baseline gap-2'>
 <h3 className='truncate text-lg font-semibold' title={p.name}>{p.name}</h3>
 <span className='text-xs text-gray-500'>ID: {p.id}</span>
 </div>
 <p className='mt-1 text-sm text-gray-600 line-clamp-3'>{p.description}</p>
 <p className='mt-2 text-blue-700 font-semibold'>${p.price.toFixed(2)}</p>
 </div>
 </div>
 </a>
 );
}