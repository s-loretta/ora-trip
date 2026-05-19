// src/store/useCartStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sdk } from "@/lib/sdk"

export interface CartItem {
  id: string 
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

// ⚡️ HELPER : Accepte 'undefined' en toute sécurité
const formatCartItems = (cartItems: any[] | undefined): CartItem[] => {
  return (cartItems || []).map((i: any) => ({
    id: i.id,
    variantId: i.variant_id,
    title: i.title,
    variantTitle: i.variant?.title || '',
    quantity: i.quantity,
    unitPrice: i.unit_price || 0,
    thumbnail: i.thumbnail || i.variant?.product?.thumbnail || '',
  }));
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isHydrated: false,
      isLoading: false,

      setHydrated: (state) => set({ isHydrated: state }),

      // 🔄 1. INITIALISATION
      initCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        try {
          const { cart } = await sdk.store.cart.retrieve(cartId, {
            fields: "+items.*,+items.variant.*,+items.variant.product.*"
          });
          set({ items: formatCartItems(cart.items), isLoading: false });
        } catch (error) {
          console.warn("Panier introuvable. Réinitialisation.");
          set({ cartId: null, items: [], isLoading: false });
        }
      },

      // 🛒 2. AJOUTER (Suppression du Double Fetch)
      addToCart: async (variantId: string, quantity: number) => {
        try {
          set({ isLoading: true });
          let { cartId } = get();

          if (!cartId) {
            const { cart } = await sdk.store.cart.create({});
            cartId = cart.id;
            set({ cartId });
          }

          // On récupère la réponse DIRECTEMENT, plus besoin de refaire initCart() !
          const { cart } = await sdk.store.cart.createLineItem(cartId, {
            variant_id: variantId,
            quantity: quantity,
          }, {
            fields: "+items.*,+items.variant.*,+items.variant.product.*"
          });

          set({ items: formatCartItems(cart.items), isLoading: false });
        } catch (error) {
          console.error("Erreur d'ajout au panier:", error);
          set({ isLoading: false });
        }
      },

      // 🔄 3. MISE À JOUR (Optimistic UI 100% Fluide)
      updateQuantity: async (lineItemId: string, quantity: number) => {
        const { cartId, items } = get();
        if (!cartId) return;

        const previousItems = [...items];

        // A. Mise à jour IMMÉDIATE de l'UI (0 latence ressentie)
        set({
          items: items.map(item => 
            item.id === lineItemId ? { ...item, quantity } : item
          )
        });

        // B. Envoi silencieux au serveur
        try {
           await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity });
          // ⚡️ ON SUPPRIME la ligne qui écrasait le state avec la réponse du serveur !
          // C'est elle qui causait le bug si le client cliquait très vite.
        } catch (error) {
          console.error("Erreur serveur, annulation de la quantité.");
          set({ items: previousItems }); // Rollback uniquement en cas de vraie erreur
        }
      },

      // 🗑️ 4. RETIRER DU PANIER (Optimistic UI)
      removeFromCart: async (lineItemId: string) => {
        const { cartId, items } = get();
        if (!cartId) return;

        const previousItems = [...items];

        // Suppression immédiate à l'écran (0 latence)
        set({ items: items.filter(item => item.id !== lineItemId) });

        try {
          // Envoi de l'ordre au serveur (Medusa ne renvoie pas le 'cart' ici, juste une confirmation)
          await sdk.store.cart.deleteLineItem(cartId, lineItemId);
          
        } catch (error) {
          console.error("Erreur serveur, restauration de l'article.");
          set({ items: previousItems }); // Rollback si le réseau coupe
        }
      },

      clearCart: () => set({ items: [], cartId: null }),
      getCartTotal: () => get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "ora-cart-storage",
      partialize: (state) => ({ cartId: state.cartId }), 
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          state.initCart();
        }
      },
    }
  )
)