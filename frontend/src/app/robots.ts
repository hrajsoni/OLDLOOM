import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXTAUTH_URL || 'https://oldloom.in';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/account', '/checkout', '/order-success'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
