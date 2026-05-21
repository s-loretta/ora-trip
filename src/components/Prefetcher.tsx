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