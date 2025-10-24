import React from 'react';
import { SearchResult, ParsedQuery } from '../types';
import { Brain, Search, ArrowUpDown, Filter } from 'lucide-react';
import './SearchResultsHeader.css';

interface SearchResultsHeaderProps {
  results: SearchResult;
  query: string;
  parsedQuery: ParsedQuery | null;
}

export function SearchResultsHeader({ results, query, parsedQuery }: SearchResultsHeaderProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSortDisplay = (sort: string) => {
    const sortMap: Record<string, string> = {
      relevance: 'Most Relevant',
      price_low: 'Price: Low to High',
      price_high: 'Price: High to Low',
      rating: 'Highest Rated',
      newest: 'Newest First',
    };
    return sortMap[sort] || sort;
  };

  const getActiveFiltersCount = () => {
    if (!parsedQuery) return 0;
    return Object.values(parsedQuery.filters).filter(Boolean).length;
  };

  return (
    <div className="search-results-header">
      <div className="search-results-header__main">
        <div className="search-results-header__info">
          <h2 className="results-title">
            {formatNumber(results.totalResults)} results for "{query}"
          </h2>
          
          {parsedQuery && parsedQuery.confidence > 1.1 && (
            <div className="ai-indicator">
              <Brain size={16} />
              <span>AI-enhanced search</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${Math.min(parsedQuery.confidence * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="search-results-header__stats">
          <div className="stat-item">
            <span className="stat-label">Showing</span>
            <span className="stat-value">
              {((results.currentPage - 1) * results.pageSize) + 1}-
              {Math.min(results.currentPage * results.pageSize, results.totalResults)}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Page</span>
            <span className="stat-value">{results.currentPage}</span>
          </div>
        </div>
      </div>

      <div className="search-results-header__details">
        {parsedQuery && getActiveFiltersCount() > 0 && (
          <div className="applied-filters">
            <Filter size={14} className="filter-icon" />
            <span className="filters-title">Applied filters:</span>
            <div className="filter-tags">
              {parsedQuery.filters.category && (
                <span className="filter-tag">
                  <strong>Category:</strong> {parsedQuery.filters.category}
                </span>
              )}
              {parsedQuery.filters.brand && (
                <span className="filter-tag">
                  <strong>Brand:</strong> {parsedQuery.filters.brand}
                </span>
              )}
              {(parsedQuery.filters.minPrice || parsedQuery.filters.maxPrice) && (
                <span className="filter-tag">
                  <strong>Price:</strong> 
                  {parsedQuery.filters.minPrice && `$${parsedQuery.filters.minPrice}`}
                  {parsedQuery.filters.minPrice && parsedQuery.filters.maxPrice && ' - '}
                  {parsedQuery.filters.maxPrice && `$${parsedQuery.filters.maxPrice}`}
                </span>
              )}
              {parsedQuery.filters.sortBy && (
                <span className="filter-tag">
                  <strong>Sort:</strong> {getSortDisplay(parsedQuery.filters.sortBy)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="result-quality">
          {parsedQuery && parsedQuery.filters.keywords && parsedQuery.filters.keywords.length > 0 && (
            <div className="keywords-found">
              <Search size={14} />
              <span>
                Found {parsedQuery.filters.keywords.length} relevant keywords
              </span>
            </div>
          )}
        </div>
      </div>

      {results.categories && results.categories.length > 0 && (
        <div className="available-categories">
          <span className="categories-title">Available categories:</span>
          <div className="category-pills">
            {results.categories.slice(0, 6).map((category) => (
              <span key={category} className="category-pill">
                {category}
              </span>
            ))}
            {results.categories.length > 6 && (
              <span className="category-pill more">
                +{results.categories.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}