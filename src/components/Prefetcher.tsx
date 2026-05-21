"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

export default function Prefetcher() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const initCart = useCartStore((s) => s.initCart);
  const isHydrated = useCartStore((s) => s.isHydrated);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (isHydrated) initCart();
  }, [isHydrated, initCart]);

  return null;
}
