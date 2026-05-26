import ArchiveClient from "./ArchiveClient";

interface MedusaProduct {
  id: string;
  title: string;
  year: string;
  origin: string;
  imagePath: string;
  history: string;
}

async function getJerseys() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products: MedusaProduct[] = data.products || [];

    return products.map((product, index) => ({
      id: String(index + 1).padStart(2, '0'),
      realId: product.id,
      name: product.title,
      year: product.year,
      culture: product.origin,
      image: product.imagePath,
      inspiration: product.history
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Page() {
  const jerseys = await getJerseys();

  return <ArchiveClient jerseys={jerseys} />;
}