// FRONTEND NEXT.JS
// Chemin : src/services/product.service.ts
//
// Appelle la route personnalisée /store/custom
// qui retourne les produits avec le stock réel injecté.

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export interface ProductData {
  id: string;
  title: string;
  year: string;
  origin: string;
  material: string;
  history: string;
  value: string;
  imagePath: string;
  formats: { name: string; stock: number }[];
  maxAllocation: number;
}

async function medusaFetch(path: string): Promise<any> {
  const url = `${BACKEND_URL}/store/${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa ${res.status}: ${body}`);
  }

  return res.json();
}

export const ProductService = {
  async fetchInventory(): Promise<ProductData[]> {
    try {
      // On appelle notre route personnalisée qui inclut le stock réel
      const data = await medusaFetch("custom");
      return (data.products || []).map((p: any) => this.mapMedusaToOra(p));
    } catch (error) {
      console.error("Erreur inventaire:", error);
      return [];
    }
  },

  async fetchPiece(handle: string): Promise<ProductData | null> {
    try {
      const data = await medusaFetch(`custom?handle=${handle}`);
      const products = data.products || [];
      if (products.length === 0) return null;
      return this.mapMedusaToOra(products[0]);
    } catch (error) {
      console.error(`Erreur pièce ${handle}:`, error);
      return null;
    }
  },

  mapMedusaToOra(product: any): ProductData {
    const variants = product.variants || [];

    const formats = variants.map((v: any) => ({
      name: v.title || "Unique",
      // inventory_quantity est maintenant injecté par notre route backend
      stock: typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0,
    }));

    const totalStock = formats.reduce(
      (acc: number, f: { stock: number }) => acc + f.stock,
      0
    );

    // Prix en centimes → euros
    const firstVariant = variants[0];
    let priceAmount = 0;
    if (firstVariant?.prices?.length) {
      const eurPrice = firstVariant.prices.find(
        (p: any) => p.currency_code === "eur"
      );
      priceAmount = eurPrice?.amount ?? firstVariant.prices[0]?.amount ?? 0;
    }

    const priceFormatted =
  priceAmount > 0
    ? `${priceAmount.toFixed(2).replace(".", ",")} €`
    : "Prix sur demande"

    return {
      id: product.handle || product.id,
      title: (product.title || "Anonyme").toUpperCase(),
      year: (product.metadata?.year as string) || "Archive",
      origin: (product.metadata?.origin as string) || "Studio ORA",
      material: product.material || "Non spécifié",
      history: product.description || "Aucune histoire rédigée.",
      value: priceFormatted,
      imagePath:
        product.thumbnail ||
        product.images?.[0]?.url ||
        "/placeholder-maillot.png",
      formats,
      maxAllocation: totalStock,
    };
  },
};