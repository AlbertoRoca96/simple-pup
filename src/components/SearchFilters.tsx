import React, { useState } from 'react';
import { DollarSign, Tag, Store, Star, X, ChevronDown } from 'lucide-react';
import { FilterState } from '../types';
import './SearchFilters.css';

interface SearchFiltersProps {
  filters: FilterState;
  categories: string[];
  brands: string[];
  categoriesLoading: boolean;
  brandsLoading: boolean;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  priceRange?: { min: number; max: number };
}

export function SearchFilters({
  filters,
  categories,
  brands,
  categoriesLoading,
  brandsLoading,
  onFiltersChange,
  onClearFilters,
  priceRange,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['price']));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    const newRange = [...filters.priceRange] as [number, number];
    if (type === 'min') {
      newRange[0] = value;
    } else {
      newRange[1] = value;
    }
    onFiltersChange({ priceRange: newRange });
  };

  const hasActiveFilters = 
    filters.selectedCategory ||
    filters.selectedBrand ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1000 ||
    filters.freeShipping ||
    filters.inStock ||
    filters.sortBy !== 'relevance';

  return (
    <div className="search-filters">
      {hasActiveFilters && (
        <div className="search-filters__active-header">
          <div className="active-filters__count">
            {[
              filters.selectedCategory && 1,
              filters.selectedBrand && 1,
              (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && 1,
              filters.freeShipping && 1,
              filters.inStock && 1,
              filters.sortBy !== 'relevance' && 1,
            ].filter(Boolean).length} filters active
          </div>
          <button
            className="active-filters__clear"
            onClick={onClearFilters}
          >
            <X size={14} />
            Clear all
          </button>
        </div>
      )}

      <div className="search-filters__section">
        <button
          className={`filter-section__header ${expandedSections.has('sort') ? 'expanded' : ''}`}
          onClick={() => toggleSection('sort')}
        >
          <Star size={16} />
          <span>Sort By</span>
          <ChevronDown size={14} className={`chevron ${expandedSections.has('sort') ? 'expanded' : ''}`} />
        </button>
        
        {expandedSections.has('sort') && (
          <div className="filter-section__content">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
              className="filter-select"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        )}
      </div>

      <div className="search-filters__section">
        <button
          className={`filter-section__header ${expandedSections.has('price') ? 'expanded' : ''}`}
          onClick={() => toggleSection('price')}
        >
          <DollarSign size={16} />
          <span>Price Range</span>
          <ChevronDown size={14} className={`chevron ${expandedSections.has('price') ? 'expanded' : ''}`} />
        </button>
        
        {expandedSections.has('price') && (
          <div className="filter-section__content">
            <div className="price-range__inputs">
              <div className="price-input">
                <label>Min</label>
                <input
                  type="number"
                  min="0"
                  max={filters.priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="price-separator">-</div>
              <div className="price-input">
                <label>Max</label>
                <input
                  type="number"
                  min={filters.priceRange[0]}
                  max={priceRange?.max || 1000}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value) || 1000)}
                  placeholder={priceRange?.max?.toString() || '1000'}
                />
              </div>
            </div>
            
            <input
              type="range"
              min={priceRange?.min || 0}
              max={priceRange?.max || 1000}
              value={filters.priceRange[1]}
              className="price-slider"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handlePriceRangeChange('max', value);
              }}
            />
          </div>
        )}
      </div>

      <div className="search-filters__section">
        <button
          className={`filter-section__header ${expandedSections.has('category') ? 'expanded' : ''}`}
          onClick={() => toggleSection('category')}
        >
          <Tag size={16} />
          <span>Category</span>
          <ChevronDown size={14} className={`chevron ${expandedSections.has('category') ? 'expanded' : ''}`} />
        </button>
        
        {expandedSections.has('category') && (
          <div className="filter-section__content">
            {categoriesLoading ? (
              <div className="filter-loading">Loading categories...</div>
            ) : (
              <select
                value={filters.selectedCategory}
                onChange={(e) => onFiltersChange({ selectedCategory: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="search-filters__section">
        <button
          className={`filter-section__header ${expandedSections.has('brand') ? 'expanded' : ''}`}
          onClick={() => toggleSection('brand')}
        >
          <Store size={16} />
          <span>Brand</span>
          <ChevronDown size={14} className={`chevron ${expandedSections.has('brand') ? 'expanded' : ''}`} />
        </button>
        
        {expandedSections.has('brand') && (
          <div className="filter-section__content">
            {brandsLoading ? (
              <div className="filter-loading">Loading brands...</div>
            ) : (
              <select
                value={filters.selectedBrand}
                onChange={(e) => onFiltersChange({ selectedBrand: e.target.value })}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="search-filters__section">
        <button
          className={`filter-section__header ${expandedSections.has('shipping') ? 'expanded' : ''}`}
          onClick={() => toggleSection('shipping')}
        >
          <DollarSign size={16} />
          <span>Shipping & Availability</span>
          <ChevronDown size={14} className={`chevron ${expandedSections.has('shipping') ? 'expanded' : ''}`} />
        </button>
        
        {expandedSections.has('shipping') && (
          <div className="filter-section__content">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.freeShipping}
                onChange={(e) => onFiltersChange({ freeShipping: e.target.checked })}
              />
              <span className="checkmark"></span>
              Free Shipping
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFiltersChange({ inStock: e.target.checked })}
              />
              <span className="checkmark"></span>
              In Stock Only
            </label>
          </div>
        )}
      </div>
    </div>
  );
}