// src/store/useProductStore.ts
import { create } from "zustand";
import { ProductService, ProductData } from "@/services/product.service";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — ajuste selon ton besoin

interface ProductState {
  products: ProductData[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
  lastFetchedAt: number | null; // timestamp du dernier fetch réussi

  fetchProducts: (opts?: { force?: boolean }) => Promise<void>;
  getProductById: (id: string) => ProductData | undefined;
}

// ─── DÉDUPLICATION ──────────────────────────────────────────────────────────
// Si plusieurs composants appellent fetchProducts() en même temps,
// on ne fait qu'UN seul appel réseau au lieu de N appels simultanés.
let inflightRequest: Promise<void> | null = null;
// ────────────────────────────────────────────────────────────────────────────

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  hasFetched: false,
  error: null,
  lastFetchedAt: null,

  fetchProducts: async ({ force = false } = {}) => {
    const { isLoading, hasFetched, lastFetchedAt } = get();

    // 1. Cache valide → on ne refetch pas
    if (!force && hasFetched && lastFetchedAt) {
      const age = Date.now() - lastFetchedAt;
      if (age < CACHE_TTL_MS) return;
    }

    // 2. Déduplication : si un fetch est déjà en vol, on attend le même
    if (inflightRequest) return inflightRequest;

    // 3. Lancement du fetch
    inflightRequest = (async () => {
      // Ne pas montrer le spinner si on a déjà des données (background refresh)
      if (!hasFetched) set({ isLoading: true });

      try {
        const fetched = await ProductService.fetchInventory();
        set({
          products: fetched,
          isLoading: false,
          hasFetched: true,
          error: null,
          lastFetchedAt: Date.now(),
        });
      } catch (e) {
        set({ error: "Erreur de chargement", isLoading: false, hasFetched: true });
      } finally {
        inflightRequest = null;
      }
    })();

    return inflightRequest;
  },

  getProductById: (id: string) => get().products.find((p) => p.id === id),
}));
