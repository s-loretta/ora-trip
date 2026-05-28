import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/checkout/',
        '/compte/',
        '/connexion/',
        '/inscription/',
        '/mot-de-passe-oublie/',
      ],
    },
    sitemap: 'https://oratrip.fr/sitemap.xml',
  };
}