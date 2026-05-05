import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // ID unique généré (ex: productId_format)
  productId: string;
  title: string;
  format: string;
  price: number;
  quantity: number;
  maxStock: number;
  imagePath: string;
  // maxStock: number; // Optionnel : utile pour bloquer l'incrémentation dans le panier
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean; // Crucial pour éviter les erreurs d'hydratation Next.js
  
  // Actions
  setHydrated: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Getters
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      addToCart: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingItemIndex !== -1) {
            // L'article existe déjà (même produit, même format), on met à jour la quantité
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          // Nouvel article
          return { items: [...state.items, newItem] };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
  set((state) => ({
    items: state.items.map((item) => {
      if (item.id === id) {
        // On bride entre 1 et le stock maximum disponible
        const newQuantity = Math.min(Math.max(1, quantity), item.maxStock);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }),
  }));
},

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ora-cart-storage", // Nom de la clé dans le Local Storage
      onRehydrateStorage: () => (state) => {
        // Cette fonction est appelée quand Zustand a fini de charger le Local Storage
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);