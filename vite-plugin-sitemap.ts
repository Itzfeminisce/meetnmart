import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { generateSitemap, generateRobotsTxt, generateDynamicRoutes, SitemapConfig } from './src/utils/sitemap';

interface SitemapPluginOptions {
  baseUrl: string;
  outDir?: string;
  excludePatterns?: string[];
  staticRoutes?: Array<{
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>;
  dynamicRoutes?: Array<{
    pattern: string;
    generateUrls: () => Promise<string[]>;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>;
}

export default function sitemapPlugin(options: SitemapPluginOptions): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    
    async closeBundle() {
      try {
        const outDir = options.outDir || 'dist';
        
        // Check if we can access the database (for dynamic routes)
        let dynamicRoutes;
        try {
          dynamicRoutes = options.dynamicRoutes || await generateDynamicRoutes();
        } catch (error) {
          console.warn('⚠️ Could not generate dynamic routes, using static routes only');
          dynamicRoutes = [];
        }
        
        const sitemapConfig: SitemapConfig = {
          baseUrl: options.baseUrl,
          staticRoutes: options.staticRoutes,
          dynamicRoutes,
          excludePatterns: options.excludePatterns || []
        };

        // Generate sitemap
        const sitemapContent = await generateSitemap(sitemapConfig);
        const sitemapPath = path.join(outDir, 'sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemapContent);
        console.log('✅ Sitemap generated:', sitemapPath);

        // Generate robots.txt
        const robotsContent = generateRobotsTxt(options.baseUrl, `${options.baseUrl}/sitemap.xml`);
        const robotsPath = path.join(outDir, 'robots.txt');
        fs.writeFileSync(robotsPath, robotsContent);
        console.log('✅ Robots.txt generated:', robotsPath);

        // Generate sitemap index if there are multiple sitemaps
        if (options.dynamicRoutes && options.dynamicRoutes.length > 0) {
          const sitemapIndexContent = generateSitemapIndex(options.baseUrl);
          const sitemapIndexPath = path.join(outDir, 'sitemap-index.xml');
          fs.writeFileSync(sitemapIndexPath, sitemapIndexContent);
          console.log('✅ Sitemap index generated:', sitemapIndexPath);
        }

      } catch (error) {
        console.error('❌ Error generating sitemap:', error);
      }
    }
  };
}

function generateSitemapIndex(baseUrl: string): string {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
} 