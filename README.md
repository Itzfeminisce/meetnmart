# MeetNMart

MeetNMart is a public, TypeScript-based marketplace and communication platform designed to connect buyers and sellers in real-time. It features live audio/video calls, chat, deep linking, and robust moderation tools, all optimized for both SEO and user experience.

## Features

- **LiveKit Integration**: Real-time audio/video calls with advanced participant tracking and moderation.
- **Marketplace Structure**: Dynamic feeds, markets, sellers, and categories, integrated via Supabase.
- **SEO Optimization**: Automatic sitemap and robots.txt generation, with support for static and dynamic routes, and SEO metadata components for React pages.
- **Deep Linking**: Seamless navigation and route parameter extraction for modern web apps.
- **Caching**: Intelligent, per-entity caching with manual and selective refresh support.
- **Content Moderation**: AI-powered moderation for audio/video streams, with configurable actions (mute, ban, etc.).
- **Build-Time Integration**: Works with Vite for optimized builds and deployment.
- **Manual Generation Scripts**: For development and troubleshooting.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Itzfeminisce/meetnmart.git
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Update environment variables as needed.
   - Configure Supabase tables (see below).
4. **Run the app**
   ```bash
   npm run dev
   ```

## Database Integration

MeetNMart expects the following Supabase tables:

```sql
-- Feeds
CREATE TABLE feeds (
  id UUID PRIMARY KEY,
  slug TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Markets
CREATE TABLE markets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Sellers (Profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  role TEXT CHECK (role IN ('buyer', 'seller')),
  is_verified BOOLEAN DEFAULT false
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  is_active BOOLEAN DEFAULT true
);
```

## Configuration

- **Vite Plugin**: Configure sitemap generation in `vite.config.ts` using the included plugin.
- **Dynamic Routes**: Supported for feeds, markets, sellers, and categories.
- **Excluded Routes**: Sensitive or private routes are automatically omitted from the sitemap.

## Caching

- **Duration**: 24 hours per cache key.
- **Entities**: Separate caches for feeds, markets, sellers, and categories.
- **Manual Refresh**: Use `sitemapService.clearCache()` or `sitemapService.clearCacheFor('feeds')` as needed.

## API Reference

- `getFeeds()`, `getMarkets()`, `getSellers()`, `getCategories()`, `getAllDynamicRoutes()`
- `clearCache()`, `clearCacheFor(key)`

## SEO Components

- Supports Open Graph tags, lastmod, changefreq, priority, page description, and more.

## Usage Examples

- **Starting a Call**
  - Call the `startCall` method with media options.
- **Deep Linking**
  - Use `DeepLinkManager.navigateTo(path, options)`.

## Support

For issues and questions:
1. Check the troubleshooting section.
2. Review the database schema.
3. Validate your configuration.
4. Check the console logs for errors.

## License

*This repository is currently private and has no public license specified.*

## Author

[Itzfeminisce](https://github.com/Itzfeminisce)  
Homepage: [meetnmart.com](https://www.meetnmart.com)
