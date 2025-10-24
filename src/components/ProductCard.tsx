import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Truck, Package } from 'lucide-react';
import { Product } from '../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const renderRating = (rating?: number, reviewCount?: number) => {
    if (!rating) return null;

    return (
      <div className="product-card__rating">
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={`star ${star <= Math.floor(rating!) ? 'filled' : 'empty'}`}
              fill={star <= Math.floor(rating!) ? '#ffc107' : 'none'}
              stroke="#ffc107"
            />
          ))}
        </div>
        <span className="rating-text">
          {rating.toFixed(1)}
          {reviewCount && ` (${reviewCount.toLocaleString()})`}
        </span>
      </div>
    );
  };

  return (
    <div className="product-card" data-testid="product-card">
      <div className="product-card__header">
        <div className="product-card__image-container">
          {!imageError && product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-card__image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="product-card__image-placeholder">
              <Package size={48} className="placeholder-icon" />
            </div>
          )}
          
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            data-testid="favorite-button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={isFavorite ? '#e74c3c' : 'none'} />
          </button>
          
          {product.availability === false && (
            <div className="out-of-stock-badge">Out of Stock</div>
          )}
        </div>
      </div>

      <div className="product-card__content">
        <div className="product-card__brand" data-testid="product-brand">{product.brand}</div>
        
        <h3 className="product-card__title" data-testid="product-title">{product.name}</h3>
        
        <div className="product-card__meta">
          <span className="category-badge">{product.category}</span>
          {product.freeShipping && (
            <div className="free-shipping-badge">
              <Truck size={12} />
              <span>Free Shipping</span>
            </div>
          )}
        </div>
        
        {product.description && (
          <p className="product-card__description">
            {product.description.length > 120
              ? `${product.description.substring(0, 120)}...`
              : product.description}
          </p>
        )}
        
        <div className="product-card__price-section">
          <div className="price-main">
            <span className="price-current" data-testid="product-price">{formatPrice(product.price, product.currency)}</span>
          </div>
          
          {renderRating(product.rating, product.reviewCount)}
        </div>
        
        <div className="product-card__actions">
          <button
            className="add-to-cart-button"
            data-testid="add-to-cart-button"
            disabled={product.availability === false}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={16} />
            <span>
              {product.availability === false ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </button>
        </div>
        
        {product.seller && product.seller !== 'Walmart' && (
          <div className="seller-info">
            <span className="seller-label">Sold by</span>
            <span className="seller-name">{product.seller}</span>
          </div>
        )}
      </div>
    </div>
  );
}