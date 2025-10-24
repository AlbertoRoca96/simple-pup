import React from 'react';
import { SearchState } from '../types';
import { ProductCard } from './ProductCard';
import { Loader } from './Loader';
import { SearchResultsHeader } from './SearchResultsHeader';
import './ProductGrid.css';

interface ProductGridProps {
  searchState: SearchState;
  onLoadMore: () => void;
}

export function ProductGrid({ searchState, onLoadMore }: ProductGridProps) {
  const { results, loading, error, query, parsedQuery } = searchState;

  if (error) {
    return (
      <div className="product-grid__error">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!results && !loading) {
    return (
      <div className="product-grid__empty">
        <div className="empty-state">
          <h3>Start searching for products</h3>
          <p>Try searching for "Sony TV under $300" or "Nike shoes best rated"</p>
        </div>
      </div>
    );
  }

  if (!results && loading) {
    return <Loader message="Searching for products..." />;
  }

  if (results && results.items.length === 0) {
    return (
      <div className="product-grid__no-results" data-testid="no-results">
        <h3>No products found</h3>
        <p>Try adjusting your search terms or filters</p>
        {parsedQuery && parsedQuery.filters.keywords && (
          <div className="search-suggestions">
            <h4>Try searching for:</h4>
            <ul>
              {parsedQuery.filters.keywords.map((keyword, index) => (
                <li key={index}>{keyword}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="product-grid" data-testid="product-grid">
      <SearchResultsHeader 
        results={results!}
        query={query}
        parsedQuery={parsedQuery}
      />
      
      <div className="product-grid__items">
        {results!.items.map((product) => (
          <ProductCard key={product.itemId} product={product} />
        ))}
      </div>
      
      <div className="product-grid__actions">
        {loading && <Loader message="Loading more products..." />}
        
        {!loading && results!.hasMore && (
          <button 
            onClick={onLoadMore}
            className="load-more-button"
            data-testid="load-more-button"
            disabled={loading}
          >
            Load More Products
          </button>
        )}
        
        {!loading && !results!.hasMore && results!.items.length > 0 && (
          <div className="end-of-results">
            <p>You've reached the end of the results</p>
            <span>Showing {results!.items.length} of {results!.totalResults} products</span>
          </div>
        )}
      </div>
    </div>
  );
}