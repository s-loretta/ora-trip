import { MetadataRoute } from 'next';

interface MedusaProduct {
  id: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://oratrip.fr';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/galerie`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/histoire`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/retours`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/cgv`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/confidentialité`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/mention-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch('https://app.oratrip.fr/store/products', {
      next: { revalidate: 3600 },
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      }
    });

    if (res.ok) {
      const data = await res.json();
      const products: MedusaProduct[] = data.products || [];

      dynamicRoutes = products.map((product) => ({
        url: `${baseUrl}/shop/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    } else {
      console.error(res.status);
    }
  } catch (error) {
    console.error(error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}