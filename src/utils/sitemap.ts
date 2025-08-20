// Import routes without React components to avoid Node.js context issues
import { RouteObject } from 'react-router-dom';

// Define routes structure without React components
const appRoutes: RouteObject[] = [
  // Guest Routes
  { path: "/logo" },
  { path: "/" },
  { path: "/getting-started" },
  { path: "/read-more/location-usage" },
  { path: "/feeds/:feedId" },

  // Legals
  { path: "/privacy-policy" },
  { path: "/terms-of-service" },
  { path: "/returns-policy" },
  { path: "/cookie-policy" },

  // Protected Routes
  {
    children: [
      { path: "/messages" },
      { path: "/messages/:conversationId" },
      { path: "/feeds" },
      { path: "/markets/:marketOrCategoryName?" },
      { path: "/categories" },
      { path: "/search" },
      { path: "/activity" },
      { path: "/calls/:callId?" },
      { path: "/recent-visits" },
      { path: "/transactions/:tx_id?" },
      { path: "/recent-calls" },
      { path: "/interest-selection" },
      {
        path: "/settings/:role",
        children: [
          { path: "basic-information", index: true },
          { path: "interests" },
          { path: "help" }
        ]
      },
      // Seller specific routes
      {
        children: [
          { path: "/seller-dashboard" },
          { path: "/edit-seller-profile" },
          { path: "/catalog" },
          { path: "/withdrawals" },
        ]
      },
      // Buyer specific routes
      {
        children: [
          { path: "/sellers/:market_name" },
          { path: "/rating" },
          { path: "/buyer-dashboard" },
          { path: "/edit-buyer-profile" },
        ]
      },
      // Role Selection Route
      {
        children: [
          { path: "/role-selection" }
        ]
      },
    ]
  },
  // All Catch Route
  { path: "*" },
];

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  staticRoutes?: SitemapEntry[];
  dynamicRoutes?: {
    pattern: string;
    generateUrls: () => Promise<string[]>;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }[];
  excludePatterns?: string[];
}

// Extract static routes from your app routes
export function extractStaticRoutes(): string[] {
  const staticRoutes: string[] = [];
  
  function extractRoutes(routes: RouteObject[], parentPath = '') {
    routes.forEach(route => {
      if (route.path && route.path !== '*') {
        const fullPath = parentPath + route.path;
        // Skip dynamic routes (those with :params)
        if (!fullPath.includes(':')) {
          staticRoutes.push(fullPath);
        }
      }
      
      if (route.children) {
        extractRoutes(route.children, parentPath + (route.path || ''));
      }
    });
  }
  
  extractRoutes(appRoutes);
  return staticRoutes;
}

// Generate sitemap XML content
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetHeader = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetFooter = '</urlset>';
  
  const urlEntries = entries.map(entry => {
    const url = `<url>
  <loc>${entry.url}</loc>
  ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
  ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
  ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
</url>`;
    return url;
  }).join('\n');
  
  return `${xmlHeader}
${urlsetHeader}
${urlEntries}
${urlsetFooter}`;
}

// Generate robots.txt content
export function generateRobotsTxt(baseUrl: string, sitemapUrl?: string): string {
  const robots = `User-agent: *
Allow: /

# Disallow admin and private routes
Disallow: /settings/
Disallow: /messages/
Disallow: /calls/
Disallow: /transactions/
Disallow: /activity/
Disallow: /recent-visits/
Disallow: /recent-calls/
Disallow: /withdrawals/
Disallow: /edit-seller-profile/
Disallow: /edit-buyer-profile/
Disallow: /seller-dashboard/
Disallow: /buyer-dashboard/
Disallow: /catalog/
Disallow: /role-selection/
Disallow: /interest-selection/
Disallow: /getting-started/

# Allow important pages
Allow: /feeds/
Allow: /markets/
Allow: /categories/
Allow: /search/
Allow: /sellers/
Allow: /rating/

# Sitemap
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;

  return robots;
}

// Main sitemap generator function
export async function generateSitemap(config: SitemapConfig): Promise<string> {
  const entries: SitemapEntry[] = [];
  
  // Add static routes
  const staticRoutes = extractStaticRoutes();
  const staticEntries: SitemapEntry[] = staticRoutes
    .filter(route => {
      // Filter out excluded patterns
      if (config.excludePatterns) {
        return !config.excludePatterns.some(pattern => 
          route.includes(pattern.replace('*', ''))
        );
      }
      return true;
    })
    .map(route => ({
      url: `${config.baseUrl}${route}`,
      changefreq: 'weekly' as const,
      priority: 0.8
    }));
  
  entries.push(...staticEntries);
  
  // Add custom static routes
  if (config.staticRoutes) {
    entries.push(...config.staticRoutes);
  }
  
  // Add dynamic routes
  if (config.dynamicRoutes) {
    for (const dynamicRoute of config.dynamicRoutes) {
      try {
        const urls = await dynamicRoute.generateUrls();
        const dynamicEntries: SitemapEntry[] = urls.map(url => ({
          url: `${config.baseUrl}${dynamicRoute.pattern.replace('*', url)}`,
          changefreq: dynamicRoute.changefreq || 'weekly',
          priority: dynamicRoute.priority || 0.6
        }));
        entries.push(...dynamicEntries);
      } catch (error) {
        console.error(`Error generating dynamic routes for pattern ${dynamicRoute.pattern}:`, error);
      }
    }
  }
  
  return generateSitemapXML(entries);
}

// Example usage for dynamic routes
export async function generateDynamicRoutes() {
  // Import the service dynamically to avoid circular dependencies
  const { sitemapService } = await import('../services/sitemapService');
  
  // Generate dynamic routes for feeds
  const generateFeedUrls = async (): Promise<string[]> => {
    return await sitemapService.getFeeds();
  };
  
  // Generate dynamic routes for markets
  const generateMarketUrls = async (): Promise<string[]> => {
    return await sitemapService.getMarkets();
  };
  
  // Generate dynamic routes for sellers
  const generateSellerUrls = async (): Promise<string[]> => {
    return await sitemapService.getSellers();
  };
  
  // Generate dynamic routes for categories
  const generateCategoryUrls = async (): Promise<string[]> => {
    return await sitemapService.getCategories();
  };
  
  return [
    {
      pattern: 'feeds/*',
      generateUrls: generateFeedUrls,
      changefreq: 'daily' as const,
      priority: 0.9
    },
    {
      pattern: 'markets/*',
      generateUrls: generateMarketUrls,
      changefreq: 'weekly' as const,
      priority: 0.8
    },
    {
      pattern: 'sellers/*',
      generateUrls: generateSellerUrls,
      changefreq: 'weekly' as const,
      priority: 0.7
    },
    {
      pattern: 'categories/*',
      generateUrls: generateCategoryUrls,
      changefreq: 'monthly' as const,
      priority: 0.6
    }
  ];
} 