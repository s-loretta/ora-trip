// src/store/useCartStore.ts
// Migré vers @medusajs/js-sdk (v2) — abandon de medusaClient (v1)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sdk } from "@/lib/sdk"

export interface CartItem {
  id: string
  medusaLineItemId?: string
  productId: string
  variantId: string
  title: string
  format: string
  price: number
  quantity: number
  maxStock: number
  imagePath: string
}

interface CartState {
  items: CartItem[]
  cartId: string | null
  isHydrated: boolean
  isLoading: boolean

  setHydrated: () => void
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => void

  getCartTotal: () => number
  getItemCount: () => number
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
      // 1. AJOUTER AU PANIER (Optimistic UI)
      // ---------------------------------------------------------
      addToCart: async (newItem) => {
        const previousItems = get().items
        const existingIndex = previousItems.findIndex((i) => i.id === newItem.id)
        let updatedItems = [...previousItems]

        if (existingIndex !== -1) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          }
        } else {
          updatedItems = [...updatedItems, newItem]
        }

        // Mise à jour visuelle instantanée avant la réponse backend
        set({ items: updatedItems, isLoading: true })

        try {
          let currentCartId = get().cartId

          // Création du panier Medusa si inexistant
          if (!currentCartId) {
            const { cart } = await sdk.store.cart.create({})
            currentCartId = cart.id
            set({ cartId: currentCartId })
          }

          if (existingIndex !== -1) {
            // Mise à jour d'un article existant
            const lineItemId = previousItems[existingIndex].medusaLineItemId
            if (lineItemId) {
              await sdk.store.cart.updateLineItem(
                currentCartId,
                lineItemId,
                { quantity: updatedItems[existingIndex].quantity }
              )
            }
          } else {
            // Ajout d'un nouvel article
            const { cart } = await sdk.store.cart.createLineItem(currentCartId, {
              variant_id: newItem.variantId,
              quantity: newItem.quantity,
            })

            // Récupération et stockage de l'ID Medusa du line item créé
            const newLineItem = cart.items?.find(
              (i) => i.variant_id === newItem.variantId
            )
            if (newLineItem) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.id === newItem.id
                    ? { ...item, medusaLineItemId: newLineItem.id }
                    : item
                ),
              }))
            }
          }

          set({ isLoading: false })
        } catch (error) {
          console.error("[Cart] Échec de l'ajout, rollback :", error)
          set({ items: previousItems, isLoading: false })
        }
      },

      // ---------------------------------------------------------
      // 2. RETIRER DU PANIER (Optimistic UI)
      // ---------------------------------------------------------
      removeFromCart: async (id) => {
        const previousItems = get().items
        const itemToRemove = previousItems.find((i) => i.id === id)

        set({
          items: previousItems.filter((item) => item.id !== id),
          isLoading: true,
        })

        try {
          const currentCartId = get().cartId
          if (currentCartId && itemToRemove?.medusaLineItemId) {
            await sdk.store.cart.deleteLineItem(
              currentCartId,
              itemToRemove.medusaLineItemId
            )
          }
          set({ isLoading: false })
        } catch (error) {
          console.error("[Cart] Échec de la suppression, rollback :", error)
          set({ items: previousItems, isLoading: false })
        }
      },

      // ---------------------------------------------------------
      // 3. METTRE À JOUR LA QUANTITÉ (Optimistic UI)
      // ---------------------------------------------------------
      updateQuantity: async (id, quantity) => {
        const previousItems = get().items
        const targetItem = previousItems.find((i) => i.id === id)
        if (!targetItem) return

        const newQuantity = Math.min(Math.max(1, quantity), targetItem.maxStock)

        set({
          items: previousItems.map((item) =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          ),
          isLoading: true,
        })

        try {
          const currentCartId = get().cartId
          if (currentCartId && targetItem.medusaLineItemId) {
            await sdk.store.cart.updateLineItem(
              currentCartId,
              targetItem.medusaLineItemId,
              { quantity: newQuantity }
            )
          }
          set({ isLoading: false })
        } catch (error) {
          console.error("[Cart] Échec de la mise à jour, rollback :", error)
          set({ items: previousItems, isLoading: false })
        }
      },

      clearCart: () => set({ items: [], cartId: null }),

      getCartTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "ora-cart-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated()
      },
    }
  )
)