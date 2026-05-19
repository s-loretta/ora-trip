// src/components/Prefetcher.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Place ce composant dans ton layout root :
//   import Prefetcher from "@/components/Prefetcher";
//   // Dans le JSX du layout : <Prefetcher />
//
// Il est invisible et déclenche les fetches au plus tôt, pendant que
// l'utilisateur est encore en train de lire la home ou de naviguer.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

export default function Prefetcher() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const initCart = useCartStore((s) => s.initCart);
  const isHydrated = useCartStore((s) => s.isHydrated);

  useEffect(() => {
    // Lance les deux fetches en parallèle dès le montage du layout
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // initCart dépend de l'hydratation Zustand (cartId depuis localStorage)
    if (isHydrated) initCart();
  }, [isHydrated, initCart]);

  return null; // Composant invisible
}
