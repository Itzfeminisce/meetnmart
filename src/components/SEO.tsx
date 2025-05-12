import { Helmet } from 'react-helmet';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
};

export default function SEO({
  title = "MeetnMart - Local Marketplace",
  description = "Instant buying and selling in your community",
  image = "/logo.png"
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}