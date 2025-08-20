// Import supabase client with error handling for missing env vars
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabase: supabaseClient } = require('../integrations/supabase/client');
  supabase = supabaseClient;
} catch (error) {
  console.warn('⚠️ Supabase client not available, using mock data for sitemap generation');
  // Mock supabase for development/testing
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    })
  };
}

export interface DynamicRouteData {
  feeds?: string[];
  markets?: string[];
  sellers?: string[];
  categories?: string[];
}

export class SitemapService {
  private static instance: SitemapService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): SitemapService {
    if (!SitemapService.instance) {
      SitemapService.instance = new SitemapService();
    }
    return SitemapService.instance;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  async getFeeds(): Promise<string[]> {
    const cacheKey = 'feeds';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Fetch feeds from your database
      const { data: feeds, error } = await supabase
        .from('feeds')
        .select('id, slug, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1000); // Adjust based on your needs

      if (error) {
        console.error('Error fetching feeds for sitemap:', error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feedUrls = feeds?.map((feed: any) => 
        feed.slug ? `feeds/${feed.slug}` : `feeds/${feed.id}`
      ) || [];

      this.setCache(cacheKey, feedUrls);
      return feedUrls;
    } catch (error) {
      console.error('Error fetching feeds for sitemap:', error);
      return [];
    }
  }

  async getMarkets(): Promise<string[]> {
    const cacheKey = 'markets';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Fetch markets from your database
      const { data: markets, error } = await supabase
        .from('markets')
        .select('name, slug, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching markets for sitemap:', error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marketUrls = markets?.map((market: any) => 
        market.slug ? `markets/${market.slug}` : `markets/${market.name.toLowerCase().replace(/\s+/g, '-')}`
      ) || [];

      this.setCache(cacheKey, marketUrls);
      return marketUrls;
    } catch (error) {
      console.error('Error fetching markets for sitemap:', error);
      return [];
    }
  }

  async getSellers(): Promise<string[]> {
    const cacheKey = 'sellers';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Fetch sellers from your database
      const { data: sellers, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, is_verified')
        .eq('role', 'seller')
        .eq('is_verified', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching sellers for sitemap:', error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sellerUrls = sellers?.map((seller: any) => 
        seller.username ? `sellers/${seller.username}` : `sellers/${seller.id}`
      ) || [];

      this.setCache(cacheKey, sellerUrls);
      return sellerUrls;
    } catch (error) {
      console.error('Error fetching sellers for sitemap:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    const cacheKey = 'categories';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Fetch categories from your database
      const { data: categories, error } = await supabase
        .from('categories')
        .select('name, slug, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories for sitemap:', error);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categoryUrls = categories?.map((category: any) => 
        category.slug ? `categories/${category.slug}` : `categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`
      ) || [];

      this.setCache(cacheKey, categoryUrls);
      return categoryUrls;
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error);
      return [];
    }
  }

  async getAllDynamicRoutes(): Promise<DynamicRouteData> {
    const [feeds, markets, sellers, categories] = await Promise.all([
      this.getFeeds(),
      this.getMarkets(),
      this.getSellers(),
      this.getCategories()
    ]);

    return {
      feeds,
      markets,
      sellers,
      categories
    };
  }

  // Method to manually refresh cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Method to refresh specific cache
  clearCacheFor(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
}

// Export singleton instance
export const sitemapService = SitemapService.getInstance(); 