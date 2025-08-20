import React from 'react';
import { Helmet } from 'react-helmet';

interface SitemapMetaProps {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

export const SitemapMeta: React.FC<SitemapMetaProps> = ({
  url,
  lastmod,
  changefreq,
  priority,
  title,
  description,
  image,
  type = 'website'
}) => {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      
      {/* Open Graph tags */}
      <meta property="og:url" content={fullUrl} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content={type} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Sitemap hints for crawlers */}
      {lastmod && <meta name="lastmod" content={lastmod} />}
      {changefreq && <meta name="changefreq" content={changefreq} />}
      {priority && <meta name="priority" content={priority.toString()} />}
    </Helmet>
  );
};

// Hook for easy sitemap metadata
export const useSitemapMeta = (props: SitemapMetaProps) => {
  return <SitemapMeta {...props} />;
};

// Predefined meta components for common pages
export const HomePageMeta: React.FC = () => (
  <SitemapMeta
    url="/"
    changefreq="daily"
    priority={1.0}
    title="MeetNMart - Connect with Local Sellers"
    description="Discover and connect with local sellers in your area. Buy and sell products through live video calls."
    type="website"
  />
);

export const PrivacyPolicyMeta: React.FC = () => (
  <SitemapMeta
    url="/privacy-policy"
    changefreq="monthly"
    priority={0.3}
    title="Privacy Policy - MeetNMart"
    description="Learn about how MeetNMart collects, uses, and protects your personal information."
    type="website"
  />
);

export const TermsOfServiceMeta: React.FC = () => (
  <SitemapMeta
    url="/terms-of-service"
    changefreq="monthly"
    priority={0.3}
    title="Terms of Service - MeetNMart"
    description="Read our terms of service and user agreement for using MeetNMart platform."
    type="website"
  />
);

export const FeedMeta: React.FC<{ feedId: string; title?: string; description?: string }> = ({
  feedId,
  title,
  description
}) => (
  <SitemapMeta
    url={`/feeds/${feedId}`}
    changefreq="daily"
    priority={0.9}
    title={title || `Feed ${feedId} - MeetNMart`}
    description={description || `View feed ${feedId} on MeetNMart`}
    type="article"
  />
);

export const MarketMeta: React.FC<{ marketName: string; description?: string }> = ({
  marketName,
  description
}) => (
  <SitemapMeta
    url={`/markets/${marketName}`}
    changefreq="weekly"
    priority={0.8}
    title={`${marketName} Market - MeetNMart`}
    description={description || `Explore ${marketName} market on MeetNMart`}
    type="website"
  />
);

export const SellerMeta: React.FC<{ sellerId: string; sellerName: string; description?: string }> = ({
  sellerId,
  sellerName,
  description
}) => (
  <SitemapMeta
    url={`/sellers/${sellerId}`}
    changefreq="weekly"
    priority={0.7}
    title={`${sellerName} - MeetNMart Seller`}
    description={description || `Connect with ${sellerName} on MeetNMart`}
    type="website"
  />
); 