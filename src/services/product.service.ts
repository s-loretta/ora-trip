// src/services/product.service.ts
//
// OPTIMISATIONS :
// - cache: "force-cache" + revalidate ISR (30s) sur fetchInventory
//   → Next.js met en cache la réponse sur le serveur, Railway n'est appelé qu'une fois toutes les 30s max
// - cache: "no-store" uniquement sur fetchPiece (stock temps-réel obligatoire)
// - Pas de try/catch qui avalent les erreurs silencieusement sur les paths critiques

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
  images: string[];
  formats: { id: string; name: string; stock: number }[];
  maxAllocation: number;
}

// ─── FETCH DE BASE ────────────────────────────────────────────────────────────
async function medusaFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${BACKEND_URL}/store/${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa ${res.status}: ${body}`);
  }

  return res.json();
}
// ─────────────────────────────────────────────────────────────────────────────

export const ProductService = {
  // ✅ CACHE ISR : Next.js met en cache cette réponse 30 secondes côté serveur.
  // Railway reçoit au maximum 1 requête par tranche de 30s, peu importe le nombre de visiteurs.
  // Augmente `revalidate` si tes stocks changent rarement (ex: 300 pour 5 minutes).
  async fetchInventory(): Promise<ProductData[]> {
    try {
      const data = await medusaFetch("custom", {
        next: { revalidate: 30 }, // ISR Next.js — à ajuster selon la fréquence de tes MAJ de stock
      } as any);
      return (data.products || []).map((p: any) => this.mapMedusaToOra(p));
    } catch (error) {
      console.error("Erreur inventaire:", error);
      return [];
    }
  },

  // ✅ Fiche produit : stock temps-réel requis → pas de cache
  // Mais on cible uniquement ce qui est nécessaire via les fields Medusa
  async fetchPiece(handle: string): Promise<ProductData | null> {
    try {
      const data = await medusaFetch(`custom?handle=${handle}`, {
        cache: "no-store",
      });
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
      id: v.id,
      name: v.title || "Unique",
      stock:
        typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0,
    }));

    const totalStock = formats.reduce(
      (acc: number, f: { stock: number }) => acc + f.stock,
      0
    );

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
        : "Prix sur demande";

    const productImages: string[] =
      product.images?.map((img: any) => img.url) || [];

    if (productImages.length === 0 && product.thumbnail) {
      productImages.push(product.thumbnail);
    }
    if (productImages.length === 0) {
      productImages.push("/placeholder-maillot.png");
    }

    return {
      id: product.handle || product.id,
      title: (product.title || "Undefined").toUpperCase(),
      year: (product.metadata?.year as string) || "Undefined",
      origin: (product.metadata?.origin as string) || "ORA TRIP",
      material: product.material || "Undefined",
      history: product.description || "Undefined",
      value: priceFormatted,
      imagePath: productImages[0],
      images: productImages,
      formats,
      maxAllocation: totalStock,
    };
  },
};
