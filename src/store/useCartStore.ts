// src/store/useCartStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sdk } from "@/lib/sdk"

export interface CartItem {
  id: string // ⚡️ L'ID réel du LineItem dans Medusa
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  unitPrice: number
  thumbnail: string
}

interface CartState {
  cartId: string | null
  items: CartItem[]
  isHydrated: boolean
  isLoading: boolean

  setHydrated: (state: boolean) => void
  initCart: () => Promise<void>
  addToCart: (variantId: string, quantity: number) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  clearCart: () => void

  getCartTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isHydrated: false,
      isLoading: false,

      setHydrated: (state) => set({ isHydrated: state }),

      // 🔄 1. SYNCHRONISATION AVEC MEDUSA
      initCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        try {
          set({ isLoading: true });
          const { cart } = await sdk.store.cart.retrieve(cartId, {
            fields: "+items.*,+items.variant.*,+items.variant.product.*"
          });
          
          // On formate la réponse de Medusa pour que ton UI Front-end lise facilement
          const formattedItems = (cart.items || []).map((i: any) => ({
            id: i.id,
            variantId: i.variant_id,
            title: i.title,
            variantTitle: i.variant?.title || '',
            quantity: i.quantity,
            unitPrice: i.unit_price || 0,
            thumbnail: i.thumbnail || i.variant?.product?.thumbnail || '',
          }));

          set({ items: formattedItems, isLoading: false });
        } catch (error) {
          console.warn("Panier Medusa introuvable ou converti en commande. Réinitialisation.");
          set({ cartId: null, items: [], isLoading: false });
        }
      },

      // 🛒 2. AJOUTER AU PANIER
      addToCart: async (variantId: string, quantity: number) => {
        try {
          set({ isLoading: true });
          let { cartId } = get();

          // Création du panier Medusa si inexistant
          if (!cartId) {
            const { cart } = await sdk.store.cart.create({});
            cartId = cart.id;
            set({ cartId });
          }

          // Ajout directement sur le serveur
          await sdk.store.cart.createLineItem(cartId, {
            variant_id: variantId,
            quantity: quantity,
          });

          // Rafraîchissement automatique
          await get().initCart();
        } catch (error) {
          console.error("Erreur d'ajout au panier:", error);
          set({ isLoading: false });
        }
      },

      // 🔄 3. METTRE À JOUR LA QUANTITÉ
      updateQuantity: async (lineItemId: string, quantity: number) => {
        const { cartId } = get();
        if (!cartId) return;

        try {
          set({ isLoading: true });
          await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity });
          await get().initCart();
        } catch (error) {
          console.error("Erreur de mise à jour:", error);
          set({ isLoading: false });
        }
      },

      // 🗑️ 4. RETIRER DU PANIER
      removeFromCart: async (lineItemId: string) => {
        const { cartId } = get();
        if (!cartId) return;

        try {
          set({ isLoading: true });
          await sdk.store.cart.deleteLineItem(cartId, lineItemId);
          await get().initCart();
        } catch (error) {
          console.error("Erreur de suppression:", error);
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null }),

      getCartTotal: () => get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),

      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "ora-cart-storage",
      partialize: (state) => ({ cartId: state.cartId }), // ⚡️ MAGIE : Seul l'ID est stocké en local !
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          state.initCart(); // Au lancement, on télécharge le panier à jour depuis Medusa
        }
      },
    }
  )
)