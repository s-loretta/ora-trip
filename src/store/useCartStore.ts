import { create } from "zustand";
import { persist } from "zustand/middleware";
import { medusaClient } from "@/lib/medusa/client"; 

export interface CartItem {
  id: string; 
  medusaLineItemId?: string; 
  productId: string;
  variantId: string;
  title: string;
  format: string;
  price: number;
  quantity: number;
  maxStock: number;
  imagePath: string;
}

interface CartState {
  items: CartItem[];
  cartId: string | null; 
  isHydrated: boolean;
  isLoading: boolean; 

  setHydrated: () => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;

  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      isHydrated: false,
      isLoading: false,

      setHydrated: () => set({ isHydrated: true }),

      // ---------------------------------------------------------
      // 1. AJOUTER AU PANIER (Mise à jour Optimiste)
      // ---------------------------------------------------------
      addToCart: async (newItem) => {
        // A. SAUVEGARDE L'ÉTAT PRÉCÉDENT (en cas d'erreur)
        const previousItems = get().items;
        
        // B. MISE À JOUR VISUELLE INSTANTANÉE (Optimistic UI)
        const existingItemIndex = previousItems.findIndex((item) => item.id === newItem.id);
        let updatedItems = [...previousItems];

        if (existingItemIndex !== -1) {
           updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
           updatedItems = [...updatedItems, newItem];
        }

        // Boom. L'interface affiche l'article sans attendre le backend.
        set({ items: updatedItems, isLoading: true });

        // C. LOGIQUE MEDUSA EN ARRIÈRE-PLAN
        try {
          let currentCartId = get().cartId;

          if (!currentCartId) {
            const { cart } = await medusaClient.carts.create();
            currentCartId = cart.id;
            set({ cartId: currentCartId });
          }

          if (existingItemIndex !== -1) {
             const lineItemId = previousItems[existingItemIndex].medusaLineItemId;
             if(lineItemId) {
                await medusaClient.carts.lineItems.update(currentCartId, lineItemId, {
                    quantity: updatedItems[existingItemIndex].quantity
                });
             }
          } else {
             const { cart } = await medusaClient.carts.lineItems.create(currentCartId, {
                variant_id: newItem.variantId,
                quantity: newItem.quantity,
             });
             
             // On met à jour l'ID Medusa de manière invisible dans le store
             const newlyAddedItem = cart.items.find(i => i.variant_id === newItem.variantId);
             if(newlyAddedItem) {
                 set((state) => ({
                   items: state.items.map(item => 
                     item.id === newItem.id ? { ...item, medusaLineItemId: newlyAddedItem.id } : item
                   )
                 }));
             }
          }
          set({ isLoading: false });

        } catch (error) {
          console.error("Erreur serveur, annulation de l'ajout :", error);
          // D. ROLLBACK : Si Medusa plante, on remet le panier comme avant
          set({ items: previousItems, isLoading: false });
        }
      },

      // ---------------------------------------------------------
      // 2. RETIRER DU PANIER (Mise à jour Optimiste)
      // ---------------------------------------------------------
      removeFromCart: async (id) => {
        const previousItems = get().items;
        const itemToRemove = previousItems.find(i => i.id === id);
        
        // Suppression visuelle instantanée
        set({
          items: previousItems.filter((item) => item.id !== id),
          isLoading: true
        });

        try {
          const currentCartId = get().cartId;
          if (currentCartId && itemToRemove?.medusaLineItemId) {
            await medusaClient.carts.lineItems.delete(currentCartId, itemToRemove.medusaLineItemId);
          }
          set({ isLoading: false });
        } catch (error) {
           console.error("Erreur serveur, annulation de la suppression.");
           set({ items: previousItems, isLoading: false }); // Rollback
        }
      },

      // ---------------------------------------------------------
      // 3. METTRE À JOUR LA QUANTITÉ (Mise à jour Optimiste)
      // ---------------------------------------------------------
      updateQuantity: async (id, quantity) => {
        const previousItems = get().items;
        const targetItem = previousItems.find(i => i.id === id);
        if(!targetItem) return;

        const newQuantity = Math.min(Math.max(1, quantity), targetItem.maxStock);

        // Modification visuelle instantanée
        set({
          items: previousItems.map((item) => 
              item.id === id ? { ...item, quantity: newQuantity } : item
          ),
          isLoading: true
        });

        try {
          const currentCartId = get().cartId;
          if (currentCartId && targetItem.medusaLineItemId) {
             await medusaClient.carts.lineItems.update(currentCartId, targetItem.medusaLineItemId, {
                quantity: newQuantity
             });
          }
          set({ isLoading: false });
        } catch (error) {
           console.error("Erreur serveur, annulation de la modification.");
           set({ items: previousItems, isLoading: false }); // Rollback
        }
      },

      clearCart: () => set({ items: [], cartId: null }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ora-cart-storage", 
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);