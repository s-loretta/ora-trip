import { MetadataRoute } from 'next';

interface MedusaProduct {
  id: string;
  updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://oratrip.fr';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products`, {
      next: { revalidate: 3600 }
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
    }
  } catch (error) {
    console.error(error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}