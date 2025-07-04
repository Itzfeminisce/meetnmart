import { Helmet } from 'react-helmet';
import React from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  author?: string;
  canonical?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  twitterSite?: string;
  twitterCreator?: string;
  themeColor?: string;
  structuredData?: string; // JSON-LD string
  children?: React.ReactNode;
};

export default function SEO({
  title = "MeetnMart - Your Local Marketplace",
  description = "Discover, buy, and sell products instantly with trusted people nearby. Join MeetnMart, your local marketplace for seamless transactions and community connections.",
  image = "/logo.png",
  keywords = "marketplace, local shopping, buy and sell, community commerce, instant meetups, nearby seller, online marketplace, local business, peer-to-peer commerce, neighborhood shopping, real-time video calls, live shopping, local vendors, community marketplace, instant delivery, trusted sellers, local market, video commerce, social commerce, mobile marketplace, local economy, small business, artisan products, fresh produce, local goods, community-driven commerce, secure transactions, verified sellers, local shopping app, marketplace platform, community connections, local trade",
  author = "MeetnMart Team",
  canonical = "https://meetnmart.com",
  ogType = "website",
  ogUrl = "https://meetnmart.com",
  ogSiteName = "MeetnMart",
  ogImageWidth = "1200",
  ogImageHeight = "630",
  twitterSite = "@MeetnMart",
  twitterCreator = "@MeetnMart",
  themeColor = "#4f46e5",
  structuredData,
  children
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      <meta name="theme-color" content={themeColor} />
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:image:width" content={ogImageWidth} />
      <meta property="og:image:height" content={ogImageHeight} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">{structuredData}</script>
      )}
      {children}
    </Helmet>
  );
}