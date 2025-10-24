interface Props { value: string; onChange: (v: string) => void; onClear: () => void; }
export default function SearchBar({ value, onChange, onClear }: Props) {
 return (
 <div className='grid gap-3'>
 <div>
 <label className='block text-sm font-medium text-gray-700'>Search</label>
 <input data-testid='search-input' type='text' value={value} onChange={(e) => onChange(e.target.value)} placeholder='Try: id:15102669883 price:500-800 "folding"' className=' mt-1 w-full rounded-2xl border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
 </div>
 <div className='flex gap-2'>
 {value && (<button className='rounded-xl border px-3 py-2' onClick={onClear}>Clear</button>)}
 <details className='rounded-xl border px-3 py-2'><summary className='cursor-pointer select-none'>Syntax</summary>
 <div className='mt-2 text-sm text-gray-600'>
 <div><b>ID</b>: <code>id:15102669883</code></div>
 <div><b>Price</b>: <code>price:500-800</code>, <code>price:&lt;700</code>, <code>price:&gt;=650</code>, <code>$500-$800</code>, <code>&lt;700</code></div>
 <div><b>Keywords</b>: looked up in Name & Description</div>
 <div>Combine: <code>folding price:&lt;600</code></div>
 </div>
 </details>
 </div>
 </div>
 );
}