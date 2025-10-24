export interface Product {
  itemId: string;
  name: string;
  price: number;
  currency: string;
  brand: string;
  category: string;
  description?: string;
  imageUrl?: string;
  availability?: boolean;
  rating?: number;
  reviewCount?: number;
  freeShipping?: boolean;
  seller?: string;
}

export interface SearchQuery {
  q: string;
  sort?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: Product[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ParsedQuery {
  searchTerm: string;
  filters: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    keywords?: string[];
  };
  confidence: number;
}

export interface SearchState {
  query: string;
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  parsedQuery: ParsedQuery | null;
}

export interface FilterState {
  selectedCategory: string;
  selectedBrand: string;
  priceRange: [number, number];
  sortBy: string;
  freeShipping: boolean;
  inStock: boolean;
}