#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Generate sitemap XML content
function generateSitemapXML(entries: SitemapEntry[]): string {
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
function generateRobotsTxt(baseUrl: string, sitemapUrl?: string): string {
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

async function generateSitemapSimple() {
  const baseUrl = process.env.VITE_BASE_URL || 'https://yourdomain.com';
  const outputDir = process.env.SITEMAP_OUTPUT_DIR || 'public';
  
  console.log('🚀 Generating simple sitemap...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('Environment variables:', { VITE_BASE_URL: process.env.VITE_BASE_URL, SITEMAP_OUTPUT_DIR: process.env.SITEMAP_OUTPUT_DIR });
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Define static routes
    const staticRoutes: SitemapEntry[] = [
      {
        url: `${baseUrl}/`,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/privacy-policy`,
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/terms-of-service`,
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/returns-policy`,
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/cookie-policy`,
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${baseUrl}/feeds`,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/markets`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/categories`,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/search`,
        changefreq: 'weekly',
        priority: 0.6
      }
    ];
    
    // Add some example dynamic routes for development
    const exampleDynamicRoutes: SitemapEntry[] = [
      {
        url: `${baseUrl}/feeds/example-feed-1`,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/feeds/example-feed-2`,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/markets/electronics`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/markets/fashion`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${baseUrl}/sellers/example-seller-1`,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/sellers/example-seller-2`,
        changefreq: 'weekly',
        priority: 0.7
      }
    ];
    
    const allRoutes = [...staticRoutes, ...exampleDynamicRoutes];
    
    // Generate sitemap
    const sitemapContent = generateSitemapXML(allRoutes);
    
    // Write sitemap
    const sitemapPath = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('✅ Sitemap generated:', sitemapPath);
    
    // Generate robots.txt
    const robotsContent = generateRobotsTxt(baseUrl, `${baseUrl}/sitemap.xml`);
    const robotsPath = path.join(outputDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('✅ Robots.txt generated:', robotsPath);
    
    // Log statistics
    const urlCount = (sitemapContent.match(/<url>/g) || []).length;
    console.log(`📊 Generated ${urlCount} URLs in sitemap`);
    console.log('🎉 Sitemap generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
generateSitemapSimple();

export { generateSitemapSimple }; 