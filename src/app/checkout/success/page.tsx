"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useSearchParams } from 'next/navigation';
import { sdk } from '@/lib/sdk'; 

// --- CHORÉGRAPHIE ORA TRIP ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: LUXURY_EASE } 
  }
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { 
    scaleX: 1, 
    transition: { duration: 1.5, ease: LUXURY_EASE, delay: 0.8 } 
  }
};

// 1. NOUVEAU COMPOSANT : On isole tout le contenu qui lit l'URL
function SuccessContent() {
  const { clearCart, cartId: localCartId } = useCartStore(); 
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  
  // États pour gérer la validation Medusa
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Fonction asynchrone pour valider la commande chez Medusa
    const finalizeOrder = async () => {
      try {
        const activeCartId = searchParams.get('cart_id') || localCartId;

        if (activeCartId) {
          // L'étape cruciale : Medusa transforme le panier en vraie commande
          const response = await sdk.store.cart.complete(activeCartId);
          
          if (response.type === "order") {
            setOrderId(response.order.display_id?.toString() || response.order.id);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la finalisation de l'archive :", error);
      } finally {
        setIsProcessing(false);
        clearCart();
      }
    };

    finalizeOrder();
  }, [localCartId, searchParams, clearCart]);

  const finalOrderNumber = orderId 
    ? `ORA-${orderId}` 
    : (paymentIntent ? `ORA-${paymentIntent.slice(-8).toUpperCase()}` : "ORA-XXXX");

  return (
    <main className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-20 flex items-center justify-center overflow-hidden font-mono">
      
      {/* Ligne de scan décorative (Animation Luxe) */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        className="absolute left-0 w-full h-[1px] bg-white/5 z-0 pointer-events-none"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full flex flex-col items-center text-center gap-12 z-10"
      >
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4">
          <motion.span variants={itemVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
            {isProcessing ? "Sécurisation en cours..." : "Confirmation"}
          </motion.span>
          <div className="overflow-hidden">
            <motion.h1 variants={itemVariants} className="font-title text-6xl md:text-8xl tracking-tighter leading-none text-white italic">
              {isProcessing ? "TRAITEMENT." : "BIEN REÇU."}
            </motion.h1>
          </div>
        </div>

        {/* --- LIGNE DE SÉPARATION --- */}
        <motion.div variants={lineVariants} className="w-24 h-px bg-white origin-center" />

        {/* --- DÉTAILS DE L'ACQUISITION --- */}
        <div className="flex flex-col gap-8 w-full max-w-md bg-white/[0.02] border border-white/5 p-10 backdrop-blur-sm relative overflow-hidden">
          
          {/* Effet de brillance (Shimmer) pendant le chargement */}
          {isProcessing && (
             <motion.div 
               animate={{ x: ["-100%", "200%"] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
             />
          )}

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-light-grey/30">Numéro d'Archive</span>
            <span className="text-xl text-white tracking-widest">
              {isProcessing ? "GÉNÉRATION..." : finalOrderNumber}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[0.3em] uppercase text-light-grey/30">Statut</span>
            <div className="flex items-center justify-center gap-3">
               <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isProcessing ? 'bg-orange-400' : 'bg-green-500'}`} />
               <span className="text-[10px] text-white uppercase tracking-widest">
                 {isProcessing ? "Synchronisation Medusa" : "Paiement Sécurisé & Confirmé"}
               </span>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-[11px] leading-relaxed text-light-grey/60 italic border-t border-white/5 pt-8">
            Un certificat de transfert et votre reçu ont été envoyés par transmission électronique. 
            Votre pièce sera préparée avec le soin d'un gant blanc.
          </motion.p>
        </div>

        {/* --- ACTIONS --- */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-10 mt-6">
          <Link href="/shop" className="group relative py-2 overflow-hidden pointer-events-auto">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 group-hover:text-white transition-colors">
              [ Retourner à l'Archive ]
            </span>
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Link>
          
          <Link href="/compte" className="group relative py-2 overflow-hidden pointer-events-auto">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 group-hover:text-white transition-colors">
              [ Suivre l'expédition ]
            </span>
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </Link>
        </motion.div>

        {/* --- FOOTER DISCRET --- */}
        <motion.span variants={itemVariants} className="text-[8px] tracking-[0.5em] text-white/10 uppercase mt-20">
          ORA TRIP — TOUS DROITS RÉSERVÉS 2026- PAR SAMBA LORETTA
        </motion.span>
      </motion.div>
    </main>
  );
}

// 2. PAGE PRINCIPALE : On englobe le contenu dans un Suspense pour Vercel
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dark flex items-center justify-center font-mono text-[10px] text-white tracking-[0.5em] uppercase animate-pulse">
        Vérification de la transaction...
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}