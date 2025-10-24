export interface Product { id: string; name: string; price: number; description: string; url: string; image?: string; }
export type PriceFilter = { op: 'range'; min: number; max: number } | { op: '<' | '>' | '<=' | '>=' | '='; value: number };
export interface ParsedQuery { id?: string; price?: PriceFilter; terms: string[]; }