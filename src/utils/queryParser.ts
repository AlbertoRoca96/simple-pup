import { ParsedQuery } from '../types';

export class QueryParser {
  private static readonly PRICE_PATTERNS = [
    /under\s+\$?(\d+)/gi,
    /less\s+than\s+\$?(\d+)/gi,
    /below\s+\$?(\d+)/gi,
    /\$?(\d+)\s+or\s+less/gi,
    /\$?(\d+)\s+and\s+under/gi,
    /over\s+\$?(\d+)/gi,
    /more\s+than\s+\$?(\d+)/gi,
    /above\s+\$?(\d+)/gi,
    /\$?(\d+)\s+or\s+more/gi,
    /\$?(\d+)\s+and\s+up/gi,
    /between\s+\$(\d+)\s+and\s+\$(\d+)/gi,
    /\$?(\d+)\s*-\s*\$?(\d+)/gi,
    /\$?(\d+)\s+to\s+\$?(\d+)/gi,
  ];

  private static readonly BRAND_PATTERNS = [
    /sony/i, /samsung/i, /apple/i, /microsoft/i, /google/i, /nike/i, /adidas/i,
    /puma/i, /under\s+armour/i, /dell/i, /hp/i, /lenovo/i, /asus/i, /lg/i,
    /panasonic/i, /sharp/i, /toShiba/i, /canon/i, /nikon/i, /fujifilm/i,
    /dyson/i, /samsung/i, /lg/i, /whirlpool/i, /ge/i, /maytag/i, /kitchenaid/i,
    /lego/i, /hasbro/i, /mattel/i, /barbie/i, /hot\s+wheels/i, /nerf/i,
  ];

  private static readonly CATEGORY_PATTERNS = [
    /electronics/i, /tv/i, /television/i, /phone/i, /smartphone/i, /laptop/i,
    /computer/i, /tablet/i, /camera/i, /headphones/i, /speakers/i, /audio/i,
    /gaming/i, /games/i, /video\s+games/i, /consoles?/i, /playstation/i,
    /xbox/i, /nintendo/i, /clothing/i, /shoes/i, /apparel/i, /fashion/i,
    /home/i, /furniture/i, /kitchen/i, /appliances/i, /gardening/i, /tools/i,
    /sports/i, /fitness/i, /outdoor/i, /toys/i, /books/i, /beauty/i, /health/i,
    /food/i, /groceries/i, /pet/i, /automotive/i, /office/i, /school/i,
  ];

  private static readonly SORT_PATTERNS = [
    { pattern: /cheapest|lowest\s+price|under\s+\$/i, sort: 'price_low' },
    { pattern: /most\s+expensive|highest\s+price|over\s+\$/i, sort: 'price_high' },
    { pattern: /best\s+rated|top\s+rated|highest\s+rated/i, sort: 'rating' },
    { pattern: /newest|latest|recent/i, sort: 'newest' },
    { pattern: /popular|trending|hot/i, sort: 'relevance' },
  ];

  static parse(query: string): ParsedQuery {
    const normalizedQuery = query.toLowerCase().trim();
    let confidence = 1.0;
    
    // Extract price ranges
    const priceRange = this.extractPriceRange(normalizedQuery);
    if (priceRange.min || priceRange.max) {
      confidence += 0.2;
    }

    // Extract brand
    const brand = this.extractBrand(normalizedQuery);
    if (brand) {
      confidence += 0.3;
    }

    // Extract category
    const category = this.extractCategory(normalizedQuery);
    if (category) {
      confidence += 0.3;
    }

    // Extract sort preference
    const sortBy = this.extractSortPreference(normalizedQuery);
    if (sortBy) {
      confidence += 0.1;
    }

    // Clean up search term by removing extracted filters
    let searchTerm = this.cleanupSearchTerm(normalizedQuery, { priceRange, brand, category });

    // Extract keywords
    const keywords = this.extractKeywords(searchTerm);
    
    return {
      searchTerm: searchTerm.trim(),
      filters: {
        ...priceRange,
        brand,
        category,
        sortBy,
        keywords: keywords.length > 0 ? keywords : undefined,
      },
      confidence: Math.min(confidence, 1.0),
    };
  }

  private static extractPriceRange(query: string): { minPrice?: number; maxPrice?: number } {
    const result: { minPrice?: number; maxPrice?: number } = {};

    for (const pattern of this.PRICE_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        if (match[1] && match[2]) {
          // Range pattern (between X and Y, X-Y, X to Y)
          result.minPrice = parseInt(match[1]);
          result.maxPrice = parseInt(match[2]);
          
          // Ensure min is actually less than max
          if (result.minPrice > result.maxPrice) {
            [result.minPrice, result.maxPrice] = [result.maxPrice, result.minPrice];
          }
          break;
        } else if (match[1]) {
          // Single value pattern
          const value = parseInt(match[1]);
          const lowerQuery = pattern.source.toLowerCase();
          
          if (lowerQuery.includes('under') || lowerQuery.includes('less') || 
              lowerQuery.includes('below') || lowerQuery.includes('or less')) {
            result.maxPrice = value;
          } else if (lowerQuery.includes('over') || lowerQuery.includes('more') || 
                     lowerQuery.includes('above') || lowerQuery.includes('or more') || 
                     lowerQuery.includes('and up')) {
            result.minPrice = value;
          }
          break;
        }
      }
    }

    return result;
  }

  private static extractBrand(query: string): string | undefined {
    for (const brandPattern of this.BRAND_PATTERNS) {
      if (brandPattern.test(query)) {
        return brandPattern.source.replace(/[\\\\+\\\\/\\\\[\\\\]\\\\{\\\\}\\\\(\\\\)\\\\(\\\\)?\\\\\\\\\\\\.\\\\*\\\\^\\\\$]/g, '').replace(/i/g, '').trim();
      }
    }
    return undefined;
  }

  private static extractCategory(query: string): string | undefined {
    for (const categoryPattern of this.CATEGORY_PATTERNS) {
      if (categoryPattern.test(query)) {
        return categoryPattern.source.replace(/[\\\\+\\\\/\\\\[\\\\]\\\\{\\\\}\\\\(\\\\)\\\\(\\\\)?\\\\\\\\\\\\.\\\\*\\\\^\\\\$]/g, '').replace(/i/g, '').trim();
      }
    }
    return undefined;
  }

  private static extractSortPreference(query: string): string | undefined {
    for (const { pattern, sort } of this.SORT_PATTERNS) {
      if (pattern.test(query)) {
        return sort;
      }
    }
    return undefined;
  }

  private static extractKeywords(query: string): string[] {
    // Remove stop words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'i', 'want',
      'need', 'looking', 'search', 'find', 'show', 'get', 'buy', 'cheap',
      'best', 'good', 'great', 'nice', 'new', 'used', 'like'
    ]);

    return query
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Limit to top 5 keywords
  }

  private static cleanupSearchTerm(
    query: string,
    extracted: { priceRange: any; brand?: string; category?: string }
  ): string {
    let cleaned = query;

    // Remove price-related patterns
    for (const pattern of this.PRICE_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Remove brand name if it was extracted
    if (extracted.brand) {
      cleaned = cleaned.replace(new RegExp(extracted.brand, 'gi'), '');
    }

    // Remove category if it was extracted
    if (extracted.category) {
      cleaned = cleaned.replace(new RegExp(extracted.category, 'gi'), '');
    }

    // Remove sort-related patterns
    for (const { pattern } of this.SORT_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Clean up extra spaces and common fillers
    cleaned = cleaned
      .replace(/\b(for|in|with|looking|want|need)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  }

  static formatQuery(parsed: ParsedQuery): string {
    const parts = [parsed.searchTerm];
    
    if (parsed.filters.brand) {
      parts.push(`brand:${parsed.filters.brand}`);
    }
    
    if (parsed.filters.category) {
      parts.push(`category:${parsed.filters.category}`);
    }
    
    if (parsed.filters.minPrice || parsed.filters.maxPrice) {
      if (parsed.filters.minPrice && parsed.filters.maxPrice) {
        parts.push(`price:${parsed.filters.minPrice}-${parsed.filters.maxPrice}`);
      } else if (parsed.filters.minPrice) {
        parts.push(`price:>${parsed.filters.minPrice}`);
      } else {
        parts.push(`price:<${parsed.filters.maxPrice}`);
      }
    }
    
    if (parsed.filters.sortBy) {
      parts.push(`sort:${parsed.filters.sortBy}`);
    }
    
    return parts.join(' ');
  }
}