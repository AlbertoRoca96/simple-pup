import { useState, useCallback, useEffect } from 'react';
import { SearchState, SearchQuery, FilterState, SearchResult } from '../types';
import { walmartApi } from '../services/walmartApi';
import { QueryParser } from '../utils/queryParser';

const initialState: SearchState = {
  query: '',
  results: null,
  loading: false,
  error: null,
  parsedQuery: null,
};

const initialFilters: FilterState = {
  selectedCategory: '',
  selectedBrand: '',
  priceRange: [0, 1000],
  sortBy: 'relevance',
  freeShipping: false,
  inStock: false,
};

export function useWalmartSearch() {
  const [searchState, setSearchState] = useState<SearchState>(initialState);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.query]);

  // Parse query when it changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const parsed = QueryParser.parse(debouncedQuery);
      setSearchState(prev => ({ ...prev, parsedQuery: parsed }));
      
      // Auto-update filters based on parsed query
      const filterUpdates: Partial<FilterState> = {};
      
      if (parsed.filters.category && !filters.selectedCategory) {
        filterUpdates.selectedCategory = parsed.filters.category;
      }
      
      if (parsed.filters.brand && !filters.selectedBrand) {
        filterUpdates.selectedBrand = parsed.filters.brand;
      }
      
      if (parsed.filters.minPrice || parsed.filters.maxPrice) {
        filterUpdates.priceRange = [
          parsed.filters.minPrice || filters.priceRange[0],
          parsed.filters.maxPrice || filters.priceRange[1],
        ];
      }
      
      if (parsed.filters.sortBy && filters.sortBy === 'relevance') {
        filterUpdates.sortBy = parsed.filters.sortBy;
      }
      
      if (Object.keys(filterUpdates).length > 0) {
        setFilters(prev => ({ ...prev, ...filterUpdates }));
      }
    }
  }, [debouncedQuery]);

  const search = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!debouncedQuery.trim()) {
      setSearchState(prev => ({ ...prev, results: null, error: null }));
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchQuery: SearchQuery = {
        q: debouncedQuery,
        page,
        pageSize: 20,
        category: filters.selectedCategory || undefined,
        brand: filters.selectedBrand || undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
        sort: filters.sortBy as any,
      };

      const results = await walmartApi.searchProducts(searchQuery);
      
      setSearchState(prev => ({
        ...prev,
        results: append && prev.results 
          ? {
              ...results,
              items: [...prev.results.items, ...results.items],
            }
          : results,
        loading: false,
      }));
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, [debouncedQuery, filters]);

  // Auto-search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(1, false);
    }
  }, [debouncedQuery, search]);

  const loadMore = useCallback(() => {
    if (searchState.results?.hasMore && !searchState.loading) {
      const nextPage = (searchState.results.currentPage || 1) + 1;
      search(nextPage, true);
    }
  }, [searchState.results, searchState.loading, search]);

  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState(initialState);
    setFilters(initialFilters);
    setDebouncedQuery('');
  }, []);

  return {
    // State
    searchState,
    filters,
    debouncedQuery,
    
    // Actions
    search,
    loadMore,
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await walmartApi.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
}

export function useBrands(category?: string) {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBrands = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await walmartApi.getBrands(category);
        setBrands(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load brands');
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, [category]);

  return { brands, loading, error };
}