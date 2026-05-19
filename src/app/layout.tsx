// src/components/Prefetcher.tsx
// OPTIMISATIONS :
// - Keep-alive ping toutes les 4 minutes → Railway ne dort jamais → 0 cold start
// - fetchProducts + initCart en parallèle au montage
"use client";

import { useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (Railway timeout = 5min)

export default function Prefetcher() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const initCart = useCartStore((s) => s.initCart);
  const isHydrated = useCartStore((s) => s.isHydrated);

  // ─── PREFETCH PRODUITS ────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── INIT CART (après hydratation Zustand) ───────────────────────────────
  useEffect(() => {
    if (isHydrated) initCart();
  }, [isHydrated, initCart]);

  // ─── KEEP-ALIVE RAILWAY ───────────────────────────────────────────────────
  // Un ping léger vers /health toutes les 4 minutes.
  // Empêche Railway de mettre le serveur en veille entre les visites.
  // Coût : ~1 requête HTTP légère toutes les 4 minutes, négligeable.
  useEffect(() => {
    if (!BACKEND_URL) return;

    const ping = () => {
      fetch(`${BACKEND_URL}/health`, {
        method: "GET",
        headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      }).catch(() => {}); // Silencieux — on réessaie dans 4min si ça échoue
    };

    // Premier ping immédiat au chargement de l'app
    ping();

    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
