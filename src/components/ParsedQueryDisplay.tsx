import React from 'react';
import { Check, Brain, Filter } from 'lucide-react';
import { ParsedQuery } from '../types';
import './ParsedQueryDisplay.css';

interface ParsedQueryDisplayProps {
  parsed: ParsedQuery;
}

export function ParsedQueryDisplay({ parsed }: ParsedQueryDisplayProps) {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 1.5) return { label: 'High', color: '#28a745' };
    if (confidence >= 1.3) return { label: 'Medium', color: '#ffc107' };
    return { label: 'Low', color: '#6c757d' };
  };

  const confidence = getConfidenceLevel(parsed.confidence);
  
  const activeFilters = [
    parsed.filters.category && `Category: ${parsed.filters.category}`,
    parsed.filters.brand && `Brand: ${parsed.filters.brand}`,
    (parsed.filters.minPrice && parsed.filters.maxPrice) && 
      `Price: $${parsed.filters.minPrice}-${parsed.filters.maxPrice}`,
    parsed.filters.minPrice && !parsed.filters.maxPrice && 
      `Price: >$${parsed.filters.minPrice}`,
    !parsed.filters.minPrice && parsed.filters.maxPrice && 
      `Price: <$${parsed.filters.maxPrice}`,
    parsed.filters.sortBy && `Sort: ${parsed.filters.sortBy}`,
  ].filter(Boolean) as string[];

  return (
    <div className="parsed-query" data-testid="parsed-query">
      <div className="parsed-query__header">
        <div className="parsed-query__title">
          <Brain size={16} />
          <span>AI Query Analysis</span>
        </div>
        <div className="parsed-query__confidence">
          <span 
            className="confidence-badge" 
            style={{ '--confidence-color': confidence.color } as React.CSSProperties}
          >
            {confidence.label} Confidence
          </span>
        </div>
      </div>
      
      <div className="parsed-query__content">
        <div className="parsed-query__search-term">
          <div className="search-term-label">Search Term:</div>
          <div className="search-term-value">"{parsed.searchTerm}"</div>
        </div>
        
        {activeFilters.length > 0 && (
          <div className="parsed-query__filters">
            <div className="filters-label">
              <Filter size={14} />
              <span>Detected Filters:</span>
            </div>
            <div className="filters-list">
              {activeFilters.map((filter, index) => (
                <div key={index} className="filter-item">
                  <Check size={12} />
                  <span>{filter}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {parsed.filters.keywords && parsed.filters.keywords.length > 0 && (
          <div className="parsed-query__keywords">
            <div className="keywords-label">Keywords:</div>
            <div className="keywords-list">
              {parsed.filters.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}