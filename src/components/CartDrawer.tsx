"use client";

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation'; // <-- 1. AJOUT DU ROUTER
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/utils/formatPrice';

// --- CONSTANTES D'ANIMATION ---
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: premiumEase } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: premiumEase } }
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: "0%", transition: { duration: 0.8, ease: premiumEase } },
  exit: { x: "100%", transition: { duration: 0.6, ease: premiumEase } }
};

export default function CartDrawer() {
  const router = useRouter(); // <-- 2. INSTANCIATION DU ROUTER
  const { isCartOpen, closeCart } = useUIStore();
  
  // Récupération des données et actions du panier
  const { items, removeFromCart, updateQuantity, getCartTotal, isHydrated } = useCartStore();

  // Calcul du sous-total via le store
  const rawSubtotal = getCartTotal();

  // Sécurité Hydratation : On ne rend rien tant que Zustand n'a pas récupéré le LocalStorage
  if (!isHydrated) return null;

  // --- NOUVELLE FONCTION DE NAVIGATION ---
  const handleProceedToCheckout = () => {
    closeCart(); // On ferme le tiroir pour une transition propre
    router.push('/checkout'); // On redirige vers le tunnel de paiement
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            className="fixed inset-0 bg-dark/60 backdrop-blur-md z-50 cursor-pointer"
          />

          {/* TIROIR PANIER */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-screen w-full md:w-[450px] bg-dark border-l border-light-grey/10 z-50 flex flex-col shadow-2xl"
          >
            
            {/* HEADER : Sémantique "Sélection" */}
            <div className="flex justify-between items-center p-8 border-b border-light-grey/10">
              <span className="font-mono text-[10px] tracking-[0.5em] text-light-grey/40 uppercase">
                Votre Sélection
              </span>
              <button 
                onClick={closeCart}
                className="font-mono text-xs text-light-grey hover:text-white transition-colors cursor-pointer"
              >
                X
              </button>
            </div>

            {/* LISTE DYNAMIQUE */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-8">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-4"
                  >
                    <span className="font-title text-5xl text-light-grey/10 italic font-light">Vide</span>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-light-grey/30">L'archive est en attente de sélection.</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-10">
                    {items.map((item) => (
                      <motion.div
                        key={item.id} // ID unique composé de (ID_Taille)
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex gap-6 group"
                      >
                        {/* MINIATURE ÉDITORIALE */}
                        <div className="w-24 aspect-[3/4] bg-[#1a1a1a] border border-light-grey/5 flex items-center justify-center overflow-hidden">
                           <img 
                             src={item.imagePath} 
                             alt={item.title} 
                             className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" 
                           />
                        </div>

                        {/* DÉTAILS */}
                        <div className="flex flex-col justify-between flex-1 py-1 border-b border-light-grey/5 pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-title text-2xl text-white italic mb-1">{item.title}</h4>
                              <p className="font-mono text-[9px] tracking-widest text-light-grey/40 uppercase">
                                Taille {item.format}
                              </p>
                            </div>
                            {/* PRIX DE L'ARTICLE FORMATÉ */}
                            <span className="font-mono text-xs text-white">
                              {formatPrice(item.price)} 
                            </span>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="font-mono text-[9px] uppercase tracking-widest text-light-grey/30 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 cursor-pointer"
                            >
                              Retirer
                            </button>

                            {/* QUANTITÉ AVEC ANIMATION BARILLET */}
                            <div className="flex items-center gap-4 font-mono text-[10px] text-light-grey">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`transition-colors ${item.quantity <= 1 ? "opacity-10 cursor-not-allowed" : "hover:text-white cursor-pointer"}`}
                              >
                                —
                              </button>
                              
                              <div className="overflow-hidden h-4 w-4 relative flex justify-center">
                                <AnimatePresence mode="popLayout">
                                  <motion.span
                                    key={item.quantity}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    className="absolute text-white"
                                  >
                                    {item.quantity}
                                  </motion.span>
                                </AnimatePresence>
                              </div>

                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className={`transition-colors ${item.quantity >= item.maxStock ? "opacity-10 cursor-not-allowed" : "hover:text-white cursor-pointer"}`}
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Optionnel : Micro-label si le stock est atteint */}
                            {item.quantity >= item.maxStock && (
                              <motion.span 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="absolute -bottom-4 right-0 font-mono text-[7px] uppercase text-light-grey/20"
                              >
                                Limite atteinte
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER : CTA D'ACQUISITION */}
            <div className="p-8 space-y-8 bg-dark border-t border-light-grey/10">
              <div className="flex justify-between items-end font-mono">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-light-grey/40">Total de la sélection</span>
                   <span className="text-[8px] text-light-grey/20 uppercase">Expédition prioritaire incluse</span>
                </div>
                {/* PRIX TOTAL ANIMÉ */}
                <div className="overflow-hidden h-8">
                  <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={rawSubtotal}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="block text-2xl text-white font-mono"
                    >
                      {formatPrice(rawSubtotal)}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* BOUTON MODIFIÉ POUR LA REDIRECTION */}
              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-white text-dark py-6 font-mono text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-light-grey transition-colors duration-500 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                disabled={items.length === 0}
              >
                Procéder à l'achat
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}