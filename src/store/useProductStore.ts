import { create } from "zustand";
import { ProductService, ProductData } from "@/services/product.service";

// --- TYPAGE STRICT DE L'ÉTAT GLOBAL ---
interface ProductState {
  products: ProductData[];
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => ProductData | undefined;
}

// --- CRÉATION DU STORE ZUSTAND ---
export const useProductStore = create<ProductState>((set, get) => ({
  // État initial
  products: [],
  isLoading: false,
  error: null,

  // Méthode asynchrone pour hydrater le store depuis MedusaJS
  fetchProducts: async () => {
    const { products, isLoading } = get();

    // Si on charge déjà ou qu'on a déjà les produits, on ne fait rien (optimisation)
    if (isLoading || products.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const fetchedProducts = await ProductService.fetchInventory();
      set({ products: fetchedProducts, isLoading: false });
    } catch (error) {
      console.error("Zustand: Échec de l'hydratation des produits.", error);
      set({ 
        error: "Impossible de charger les produits. Veuillez réessayer.", 
        isLoading: false 
      });
    }
  },

  // Sélecteur utilitaire pour la page Produit (PDP)
  getProductById: (id: string) => {
    const { products } = get();
    return products.find((product) => product.id === id);
  },
}));