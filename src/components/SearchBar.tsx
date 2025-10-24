import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  loading: boolean;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onClear, loading, placeholder }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="search-bar" data-testid="search-bar">
      <div className={`search-bar__container ${focused ? 'focused' : ''} ${value ? 'has-value' : ''}`} data-testid="search-container">
        <div className="search-bar__icon">
          {loading ? (
            <div className="search-bar__spinner" />
          ) : (
            <Search size={20} />
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="search-bar__form">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder || 'Search millions of products...'}
            className="search-bar__input"
            data-testid="search-input"
            autoFocus
          />
        </form>
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar__clear"
            data-testid="clear-search"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
        
        <div className="search-bar__ai-indicator">
          <Sparkles size={16} />
          <span>AI-Powered</span>
        </div>
      </div>
      
      <div className="search-bar__examples">
        <h4>Try smart searches like:</h4>
        <ul>
          <li>"Sony TV under $300 best rated"</li>
          <li>"Nike shoes between $50-$100"</li>
          <li>"Apple laptop for gaming under $1200"</li>
          <li>"Samsung headphones wireless under $100"</li>
        </ul>
      </div>
    </div>
  );
}