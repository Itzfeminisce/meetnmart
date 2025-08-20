# Sitemap Generator for MeetNMart

This document explains how to use the sitemap generator system for SEO optimization.

## Overview

The sitemap generator automatically creates XML sitemaps and robots.txt files for your React application. It supports both static and dynamic routes, with intelligent caching and SEO optimization.

## Features

- ✅ **Automatic static route extraction** from React Router configuration
- ✅ **Dynamic route generation** from database content
- ✅ **Intelligent caching** to improve performance
- ✅ **SEO metadata components** for React pages
- ✅ **Robots.txt generation** with proper crawl directives
- ✅ **Build-time integration** with Vite
- ✅ **Manual generation scripts** for development

## Quick Start

### 1. Environment Setup

Add your base URL to your environment variables:

```bash
# .env
VITE_BASE_URL=https://yourdomain.com
```

### 2. Build Integration

The sitemap is automatically generated during the build process:

```bash
npm run build
```

This will create:
- `dist/sitemap.xml` - Main sitemap file
- `dist/robots.txt` - Robots file
- `dist/sitemap-index.xml` - Sitemap index (if multiple sitemaps)

### 3. Manual Generation

For development and testing:

```bash
# Generate for production
npm run sitemap

# Generate for development
npm run sitemap:dev
```

## Configuration

### Vite Configuration

The sitemap plugin is configured in `vite.config.ts`:

```typescript
sitemapPlugin({
  baseUrl: env.VITE_BASE_URL || 'https://yourdomain.com',
  outDir: 'dist',
  staticRoutes: [
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0
    },
    // ... more routes
  ]
})
```

### Dynamic Routes

Dynamic routes are automatically generated from your database. The system supports:

- **Feeds**: `/feeds/{id}` - Daily updates, high priority
- **Markets**: `/markets/{name}` - Weekly updates, medium priority  
- **Sellers**: `/sellers/{id}` - Weekly updates, medium priority
- **Categories**: `/categories/{name}` - Monthly updates, lower priority

### Excluded Routes

The following routes are automatically excluded from the sitemap:

- `/settings/*` - User settings
- `/messages/*` - Private messages
- `/calls/*` - Private calls
- `/transactions/*` - Private transactions
- `/activity/*` - User activity
- `/recent-visits/*` - Recent visits
- `/recent-calls/*` - Recent calls
- `/withdrawals/*` - Withdrawal pages
- `/edit-seller-profile/*` - Profile editing
- `/edit-buyer-profile/*` - Profile editing
- `/seller-dashboard/*` - Seller dashboard
- `/buyer-dashboard/*` - Buyer dashboard
- `/catalog/*` - Private catalog
- `/role-selection/*` - Role selection
- `/interest-selection/*` - Interest selection
- `/getting-started/*` - Onboarding

## SEO Components

### Basic Usage

Add SEO metadata to your React components:

```tsx
import { SitemapMeta } from '@/components/SEO/SitemapMeta';

function MyPage() {
  return (
    <div>
      <SitemapMeta
        url="/my-page"
        changefreq="weekly"
        priority={0.8}
        title="My Page - MeetNMart"
        description="Description of my page"
      />
      {/* Your page content */}
    </div>
  );
}
```

### Predefined Components

Use predefined components for common pages:

```tsx
import { HomePageMeta, FeedMeta, MarketMeta } from '@/components/SEO/SitemapMeta';

// Home page
function HomePage() {
  return (
    <div>
      <HomePageMeta />
      {/* Content */}
    </div>
  );
}

// Feed page
function FeedPage({ feedId, title, description }) {
  return (
    <div>
      <FeedMeta feedId={feedId} title={title} description={description} />
      {/* Content */}
    </div>
  );
}

// Market page
function MarketPage({ marketName, description }) {
  return (
    <div>
      <MarketMeta marketName={marketName} description={description} />
      {/* Content */}
    </div>
  );
}
```

## Database Integration

### Supabase Tables

The sitemap service expects the following table structure:

```sql
-- Feeds table
CREATE TABLE feeds (
  id UUID PRIMARY KEY,
  slug TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Markets table  
CREATE TABLE markets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Profiles table (for sellers)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  role TEXT CHECK (role IN ('buyer', 'seller')),
  is_verified BOOLEAN DEFAULT false
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### Custom Dynamic Routes

To add custom dynamic routes, modify `src/services/sitemapService.ts`:

```typescript
async getCustomRoutes(): Promise<string[]> {
  const { data, error } = await supabase
    .from('your_table')
    .select('id, slug')
    .eq('is_active', true);
    
  return data?.map(item => 
    item.slug ? `custom/${item.slug}` : `custom/${item.id}`
  ) || [];
}
```

Then add to the dynamic routes configuration in `src/utils/sitemap.ts`:

```typescript
{
  pattern: 'custom/*',
  generateUrls: () => sitemapService.getCustomRoutes(),
  changefreq: 'weekly' as const,
  priority: 0.6
}
```

## Caching

The sitemap service includes intelligent caching:

- **Cache Duration**: 24 hours
- **Cache Keys**: Separate caches for feeds, markets, sellers, categories
- **Manual Refresh**: Use `sitemapService.clearCache()` to refresh all caches
- **Selective Refresh**: Use `sitemapService.clearCacheFor('feeds')` to refresh specific caches

## Performance Optimization

### Large Sites

For sites with many URLs (>50,000), consider:

1. **Sitemap Indexing**: The system automatically creates sitemap indexes
2. **Pagination**: Modify the service to handle pagination
3. **CDN Caching**: Serve sitemaps through a CDN
4. **Background Generation**: Generate sitemaps in background jobs

### Example: Paginated Sitemap

```typescript
async getFeedsPaginated(page: number = 1, limit: number = 1000): Promise<string[]> {
  const offset = (page - 1) * limit;
  
  const { data: feeds, error } = await supabase
    .from('feeds')
    .select('id, slug')
    .eq('is_published', true)
    .range(offset, offset + limit - 1);
    
  return feeds?.map(feed => 
    feed.slug ? `feeds/${feed.slug}` : `feeds/${feed.id}`
  ) || [];
}
```

## Monitoring and Analytics

### Google Search Console

1. Submit your sitemap URL: `https://yourdomain.com/sitemap.xml`
2. Monitor indexing status
3. Check for crawl errors

### Sitemap Validation

Validate your sitemap using online tools:
- [Google Search Console](https://search.google.com/search-console)
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

## Troubleshooting

### Common Issues

1. **Sitemap not generating**: Check your database connections and table structure
2. **Missing dynamic routes**: Verify your Supabase queries and table permissions
3. **Build errors**: Ensure all dependencies are installed (`npm install`)
4. **Caching issues**: Clear cache with `sitemapService.clearCache()`

### Debug Mode

Enable debug logging:

```typescript
// In your sitemap service
console.log('Fetching feeds:', feeds);
console.log('Generated URLs:', feedUrls);
```

### Manual Testing

Test the sitemap generation manually:

```bash
# Test with sample data
npm run sitemap:dev

# Check generated files
cat public/sitemap.xml
cat public/robots.txt
```

## Best Practices

1. **Regular Updates**: Generate sitemaps regularly (daily/weekly)
2. **Monitor Performance**: Track sitemap generation time
3. **Validate URLs**: Ensure all URLs are accessible
4. **SEO Optimization**: Use descriptive titles and meta descriptions
5. **Mobile Optimization**: Ensure mobile-friendly URLs
6. **Security**: Don't expose sensitive routes in sitemaps

## API Reference

### SitemapService Methods

- `getFeeds()`: Get feed URLs
- `getMarkets()`: Get market URLs  
- `getSellers()`: Get seller URLs
- `getCategories()`: Get category URLs
- `getAllDynamicRoutes()`: Get all dynamic routes
- `clearCache()`: Clear all caches
- `clearCacheFor(key)`: Clear specific cache

### SitemapMeta Props

- `url`: Page URL
- `lastmod`: Last modification date
- `changefreq`: Change frequency
- `priority`: Page priority (0.0-1.0)
- `title`: Page title
- `description`: Page description
- `image`: Open Graph image
- `type`: Content type

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the database schema
3. Validate your configuration
4. Check the console logs for errors 