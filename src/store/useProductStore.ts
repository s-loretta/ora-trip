import { create } from "zustand";
import { ProductService, ProductData } from "@/services/product.service";

interface ProductState {
  products: ProductData[];
  isLoading: boolean;
  hasFetched: boolean; // ← garde mémoire que le fetch est terminé
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => ProductData | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchProducts: async () => {
    // On skip si déjà en cours OU déjà terminé
    if (get().isLoading || get().hasFetched) return;
    set({ isLoading: true });
    try {
      const fetched = await ProductService.fetchInventory();
      set({ products: fetched, isLoading: false, hasFetched: true });
    } catch (e) {
      set({ error: "Erreur de chargement", isLoading: false, hasFetched: true });
    }
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),
}));