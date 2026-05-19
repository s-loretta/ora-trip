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

// ─── DEBOUNCE MAP ───────────────────────────────────────────────────────────
// Un timer par lineItemId pour grouper les clics rapides en un seul appel réseau
const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

const debouncedServerUpdate = (
  lineItemId: string,
  quantity: number,
  cartId: string,
  onError: () => void,
  delay = 600
) => {
  // Annule le timer précédent pour cet item s'il existe
  const existing = debounceMap.get(lineItemId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    debounceMap.delete(lineItemId);
    try {
      await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity });
      // ⚠️ On N'écrase PAS le state ici — l'UI est déjà correcte grâce à l'optimistic update
    } catch (error) {
      console.error("Erreur serveur lors de la mise à jour de quantité.");
      onError(); // Rollback uniquement si le serveur répond avec une erreur
    }
  }, delay);

  debounceMap.set(lineItemId, timer);
};
// ────────────────────────────────────────────────────────────────────────────

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

      // 🛒 2. AJOUTER AU PANIER
      addToCart: async (variantId: string, quantity: number) => {
        try {
          set({ isLoading: true });
          let { cartId } = get();

          if (!cartId) {
            const { cart } = await sdk.store.cart.create({});
            cartId = cart.id;
            set({ cartId });
          }

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

      // ✅ FIX : Optimistic UI sans race condition + debounce réseau
      updateQuantity: async (lineItemId: string, quantity: number) => {
        const { cartId, items } = get();
        if (!cartId) return;

        // Snapshot pour le rollback
        const previousItems = [...items];

        // A. Mise à jour IMMÉDIATE et DÉFINITIVE de l'UI (pas d'écrasement après)
        set({
          items: items.map(item =>
            item.id === lineItemId ? { ...item, quantity } : item
          )
        });

        // B. Envoi au serveur avec debounce (600ms)
        // Les clics rapides (+, +, +) ne font qu'UN seul appel réseau avec la quantité finale
        debouncedServerUpdate(
          lineItemId,
          quantity,
          cartId,
          () => set({ items: previousItems }) // Rollback uniquement sur erreur serveur
        );
      },

      // 🗑️ 4. RETIRER DU PANIER
      removeFromCart: async (lineItemId: string) => {
        const { cartId, items } = get();
        if (!cartId) return;

        // Annule tout debounce en cours pour cet item avant de le supprimer
        const existing = debounceMap.get(lineItemId);
        if (existing) {
          clearTimeout(existing);
          debounceMap.delete(lineItemId);
        }

        const previousItems = [...items];

        set({ items: items.filter(item => item.id !== lineItemId) });

        try {
          await sdk.store.cart.deleteLineItem(cartId, lineItemId);
        } catch (error) {
          console.error("Erreur serveur, restauration de l'article.");
          set({ items: previousItems });
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
