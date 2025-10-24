import axios from 'axios';
import { Product, SearchQuery, SearchResult, ParsedQuery } from '../types';
import { QueryParser } from '../utils/queryParser';

// Mock Walmart API - replace with real API endpoint and credentials
const WALMART_API_BASE = 'https://api.walmart.com/v2';
const API_KEY = process.env.VITE_WALMART_API_KEY || 'demo-key';

// In production, use CORS proxy or backend service to avoid CORS issues
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Mock API for development
  : 'https://walmart-api-proxy.herokuapp.com'; // Production proxy

class WalmartApiService {
  private axios = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  async searchProducts(query: SearchQuery): Promise<SearchResult> {
    try {
      // Parse the query to extract filters
      const parsedQuery = QueryParser.parse(query.q);
      
      // Build API request parameters
      const params = this.buildSearchParams(query, parsedQuery);
      
      // For demo purposes, return mock data
      if (import.meta.env.DEV || !API_KEY) {
        return this.getMockSearchResults(params);
      }

      const response = await this.axios.get('/search', { params });
      
      return {
        items: response.data.items || [],
        totalResults: response.data.totalResults || 0,
        currentPage: query.page || 1,
        pageSize: query.pageSize || 20,
        hasMore: (response.data.items?.length || 0) >= (query.pageSize || 20),
        categories: response.data.categories || [],
        brands: response.data.brands || [],
        priceRange: response.data.priceRange || { min: 0, max: 1000 },
      };
    } catch (error) {
      console.error('Search error:', error);
      // Return mock data as fallback
      return this.getMockSearchResults(this.buildSearchParams(query));
    }
  }

  private buildSearchParams(query: SearchQuery, parsedQuery?: ParsedQuery): Record<string, any> {
    const params: Record<string, any> = {
      q: query.q,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      format: 'json',
    };

    // Apply parsed query filters if available
    if (parsedQuery) {
      if (parsedQuery.filters.category) {
        params.category = parsedQuery.filters.category;
      }
      if (parsedQuery.filters.brand) {
        params.brand = parsedQuery.filters.brand;
      }
      if (parsedQuery.filters.minPrice) {
        params.minPrice = parsedQuery.filters.minPrice;
      }
      if (parsedQuery.filters.maxPrice) {
        params.maxPrice = parsedQuery.filters.maxPrice;
      }
      if (parsedQuery.filters.sortBy) {
        params.sort = parsedQuery.filters.sortBy;
      }
    }

    // Override with explicit filters from query
    if (query.category) params.category = query.category;
    if (query.brand) params.brand = query.brand;
    if (query.minPrice) params.minPrice = query.minPrice;
    if (query.maxPrice) params.maxPrice = query.maxPrice;
    if (query.sort) params.sort = query.sort;

    return params;
  }

  async getProductDetails(itemId: string): Promise<Product> {
    try {
      if (import.meta.env.DEV || !API_KEY) {
        return this.getMockProductDetails(itemId);
      }

      const response = await this.axios.get(`/products/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Product details error:', error);
      return this.getMockProductDetails(itemId);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      if (import.meta.env.DEV || !API_KEY) {
        return this.getMockCategories();
      }

      const response = await this.axios.get('/categories');
      return response.data.categories || [];
    } catch (error) {
      console.error('Categories error:', error);
      return this.getMockCategories();
    }
  }

  async getBrands(category?: string): Promise<string[]> {
    try {
      if (import.meta.env.DEV || !API_KEY) {
        return this.getMockBrands(category);
      }

      const params = category ? { category } : {};
      const response = await this.axios.get('/brands', { params });
      return response.data.brands || [];
    } catch (error) {
      console.error('Brands error:', error);
      return this.getMockBrands(category);
    }
  }

  // Mock data methods for development/testing
  private getMockSearchResults(params: Record<string, any>): SearchResult {
    const mockProducts = this.generateMockProducts(params.q || '', params.pageSize || 20);
    
    return {
      items: mockProducts,
      totalResults: 1000,
      currentPage: params.page || 1,
      pageSize: params.pageSize || 20,
      hasMore: true,
      categories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Toys'],
      brands: ['Sony', 'Samsung', 'Apple', 'Nike', 'Adidas'],
      priceRange: { min: 10, max: 1000 },
    };
  }

  private getMockProductDetails(itemId: string): Product {
    return {
      itemId,
      name: `Product ${itemId}`,
      price: Math.floor(Math.random() * 500) + 20,
      currency: 'USD',
      brand: 'Sony',
      category: 'Electronics',
      description: 'High quality product with great features.',
      imageUrl: `https://picsum.photos/400/300?random=${itemId}`,
      availability: true,
      rating: 4.2,
      reviewCount: 156,
      freeShipping: Math.random() > 0.5,
    };
  }

  private getMockCategories(): string[] {
    return [
      'Electronics',
      'TV & Video',
      'Computers',
      'Cell Phones',
      'Audio',
      'Cameras',
      'Clothing, Shoes & Jewelry',
      'Home & Garden',
      'Kitchen & Dining',
      'Furniture',
      'Sports & Outdoors',
      'Toys & Games',
      'Beauty',
      'Health',
      'Food',
      'Automotive',
    ];
  }

  private getMockBrands(category?: string): string[] {
    const allBrands = [
      'Sony', 'Samsung', 'Apple', 'LG', 'Panasonic', 'Sharp', 'Toshiba',
      'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', 'Google', 'Amazon',
      'Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance',
      'Whirlpool', 'GE', 'Maytag', 'KitchenAid', 'Dyson',
      'Lego', 'Hasbro', 'Mattel', 'Nintendo', 'PlayStation', 'Xbox',
    ];
    
    // Filter brands based on category (mock logic)
    if (category?.toLowerCase().includes('electronic')) {
      return allBrands.filter(brand => 
        ['Sony', 'Samsung', 'Apple', 'LG', 'Panasonic', 'Dell', 'HP', 'Lenovo', 'Asus'].includes(brand)
      );
    }
    
    return allBrands.slice(0, 20);
  }

  private generateMockProducts(searchTerm: string, count: number): Product[] {
    const products: Product[] = [];
    const words = searchTerm.split(/\s+/).filter(w => w.length > 2);
    
    for (let i = 0; i < count; i++) {
      const price = Math.floor(Math.random() * 500) + 20;
      const rating = (Math.random() * 2 + 3).toFixed(1);
      
      products.push({
        itemId: `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: `${words.length > 0 ? words[i % words.length] : 'Premium'} Product ${i + 1} - High Quality`,
        price,
        currency: 'USD',
        brand: ['Sony', 'Samsung', 'Apple', 'Nike', 'Adidas'][i % 5],
        category: ['Electronics', 'Clothing', 'Home', 'Sports', 'Toys'][i % 5],
        description: 'Excellent product with amazing features and great value.',
        imageUrl: `https://picsum.photos/400/300?random=${i}`,
        availability: Math.random() > 0.1,
        rating: parseFloat(rating),
        reviewCount: Math.floor(Math.random() * 500) + 10,
        freeShipping: price > 35 || Math.random() > 0.7,
        seller: ['Walmart', 'Third Party'][Math.floor(Math.random() * 2)],
      });
    }
    
    return products;
  }
}

export const walmartApi = new WalmartApiService();