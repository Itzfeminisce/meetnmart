#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { generateSitemap, generateRobotsTxt } from '../src/utils/sitemap';

async function generateSitemapManually() {
  const baseUrl = process.env.VITE_BASE_URL || 'https://yourdomain.com';
  const outputDir = process.env.SITEMAP_OUTPUT_DIR || 'public';
  
  console.log('🚀 Generating sitemap...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output directory: ${outputDir}`);
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate sitemap
    const sitemapContent = await generateSitemap({
      baseUrl,
      staticRoutes: [
        {
          url: '/',
          changefreq: 'daily',
          priority: 1.0
        },
        {
          url: '/privacy-policy',
          changefreq: 'monthly',
          priority: 0.3
        },
        {
          url: '/terms-of-service',
          changefreq: 'monthly',
          priority: 0.3
        },
        {
          url: '/returns-policy',
          changefreq: 'monthly',
          priority: 0.3
        },
        {
          url: '/cookie-policy',
          changefreq: 'monthly',
          priority: 0.3
        }
      ],
      excludePatterns: [
        '/settings/*',
        '/messages/*',
        '/calls/*',
        '/transactions/*',
        '/activity/*',
        '/recent-visits/*',
        '/recent-calls/*',
        '/withdrawals/*',
        '/edit-seller-profile/*',
        '/edit-buyer-profile/*',
        '/seller-dashboard/*',
        '/buyer-dashboard/*',
        '/catalog/*',
        '/role-selection/*',
        '/interest-selection/*',
        '/getting-started/*'
      ]
    });
    
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
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemapManually();
}

export { generateSitemapManually }; 