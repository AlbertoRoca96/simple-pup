import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { ProductGrid } from './ProductGrid';
import { ParsedQueryDisplay } from './ParsedQueryDisplay';
import { useWalmartSearch, useCategories, useBrands } from '../hooks/useWalmartSearch';
import './SearchPage.css';

export function SearchPage() {
  const {
    searchState,
    filters,
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    loadMore,
  } = useWalmartSearch();

  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands(filters.selectedCategory);
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="search-page">
      <header className="search-page__header">
        <div className="search-page__container">
          <h1 className="search-page__title">Walmart Product Search</h1>
          <p className="search-page__subtitle">
            Search millions of products with smart filtering and commercial-grade query parsing
          </p>
        </div>
      </header>

      <div className="search-page__content">
        <div className="search-page__primary-section">
          <div className="search-page__search-section">
            <SearchBar
              value={searchState.query}
              onChange={updateQuery}
              onClear={clearSearch}
              loading={searchState.loading}
              placeholder="Try: 'Sony TV under $300 best rated' or 'Nike shoes between $50-$100'"
            />
            
            {searchState.parsedQuery && searchState.parsedQuery.confidence > 1.1 && (
              <ParsedQueryDisplay parsed={searchState.parsedQuery} />
            )}
          </div>

          {(searchState.results || searchState.query) && (
            <div className="search-page__layout">
              <aside className="search-page__sidebar">
                <div className="search-page__filter-toggle">
                  <button
                    className="filter-toggle__button"
                    data-testid="filter-toggle"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <span className="filter-toggle__text">
                      {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                    </span>
                    <span className={`filter-toggle__icon ${showAdvancedFilters ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
                
                {showAdvancedFilters && (
                  <SearchFilters
                    filters={filters}
                    categories={categories}
                    brands={brands}
                    categoriesLoading={categoriesLoading}
                    brandsLoading={brandsLoading}
                    onFiltersChange={updateFilters}
                    onClearFilters={clearFilters}
                    priceRange={searchState.results?.priceRange}
                  />
                )}
              </aside>

              <main className="search-page__results">
                <ProductGrid
                  searchState={searchState}
                  onLoadMore={loadMore}
                  data-testid="search-results"
                />
              </main>
            </div>
          )}
        </div>
      </div>

      <footer className="search-page__footer">
        <div className="search-page__container">
          <p>
            © 2024 Walmart Product Search. Powered by advanced query parsing and AI-powered filtering.
          </p>
        </div>
      </footer>
    </div>
  );
}