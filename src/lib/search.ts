import type { Product, ParsedQuery, PriceFilter } from '../types';
function safeLower(s: unknown): string { return (s ?? '').toString().toLowerCase(); }
export function parseQuery(qRaw: string): ParsedQuery {
 const q = qRaw.trim(); const out: ParsedQuery = { terms: [] }; if (!q) return out;
 const idMatch = q.match(/(?:^|\s)id:\s*([A-Za-z0-9-]+)/i); if (idMatch) out.id = idMatch[1];
 const priceDirect = q.match(/price:\s*(<=|>=|<|>|=)?\s*\$?(\d+(?:\.\d{1,2})?)\s*(?:-\s*\$?(\d+(?:\.\d{1,2})?))?/i);
 const rangeOnly = q.match(/\$?\s*(\d+(?:\.\d{1,2})?)\s*-\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
 const compOnly = q.match(/(<=|>=|<|>|=)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
 let price: PriceFilter | undefined;
 if (priceDirect) { const [, op, a, b] = priceDirect; price = b ? { op: 'range', min: Number(a), max: Number(b) } : { op: (op as any) || '=', value: Number(a) }; }
 else if (rangeOnly) { const [, a, b] = rangeOnly; price = { op: 'range', min: Number(a), max: Number(b) }; }
 else if (compOnly) { const [, op, a] = compOnly; price = { op: op as any, value: Number(a) }; }
 if (price) out.price = price;
 let residual = q.replace(idMatch?.[0] ?? '', ' ').replace(priceDirect?.[0] ?? '', ' ').replace(rangeOnly?.[0] ?? '', ' ').replace(compOnly?.[0] ?? '', ' ').replace(/\s+/g, ' ').trim();
 out.terms = residual ? residual.split(/\s+/).map(safeLower) : []; return out;
}
function matchScore(product: Product, parsed: ParsedQuery): number {
 let score = 0; const name = safeLower(product.name); const desc = safeLower(product.description); const id = String(product.id);
 if (parsed.id) { if (id === parsed.id) score += 1000; else if (id.includes(parsed.id)) score += 500; else return -1; }
 if (parsed.price && typeof product.price === 'number') {
 const v = product.price; const pf = parsed.price as any;
 if (pf.op === 'range') { if (!(v >= pf.min && v <= pf.max)) return -1; }
 else if (pf.op === '<' && !(v < pf.value)) return -1;
 else if (pf.op === '>' && !(v > pf.value)) return -1;
 else if (pf.op === '<=' && !(v <= pf.value)) return -1;
 else if (pf.op === '>=' && !(v >= pf.value)) return -1;
 else if (pf.op === '=' && !(v === pf.value)) return -1;
 } else if (parsed.price) { return -1; }
 if (parsed.terms.length) { for (const t of parsed.terms) { const inName = name.includes(t); const inDesc = desc.includes(t); if (!inName && !inDesc) return -1; if (inName) score += 5; if (inDesc) score += 3; } }
 return score;
}
export function filterAndScoreProducts(products: Product[], parsed: ParsedQuery): Product[] {
 const scored: (Product & { _score: number })[] = []; for (const p of products) { const s = matchScore(p, parsed); if (s >= 0) scored.push({ ...p, _score: s }); }
 return scored.sort((a,b)=>{ if (b._score!==a._score) return b._score-a._score; if (typeof a.price==='number' && typeof b.price==='number') return a.price-b.price; if (typeof a.price==='number') return -1; if (typeof b.price==='number') return 1; return a.name.localeCompare(b.name); }).map(({ _score, ...rest }) => rest);
}