import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Cegah Google masuk ke halaman admin atau API
    },
    sitemap: 'https://smpyapialhusaeni.sch.id/sitemap.xml',
  };
}