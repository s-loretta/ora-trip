"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
// IMPORTANT: Importe ton store
import { useUIStore } from '@/store/useUIStore';

// --- TYPAGE STRICT ---
interface CartItem {
  id: string;
  name: string;
  culture: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

// Données de simulation
const MOCK_ITEMS: CartItem[] = [
  {
    id: "01",
    name: "NOMADE",
    culture: "SAHARA",
    size: "L",
    price: 180,
    quantity: 1,
    image: "https://placehold.co/300x400/transparent/FFFFFF/png?text=NOMADE",
  },
  {
    id: "03",
    name: "OBSIDIENNE",
    culture: "AZTÈQUE",
    size: "M",
    price: 180,
    quantity: 1,
    image: "https://placehold.co/300x400/transparent/FFFFFF/png?text=OBSIDIENNE",
  }
];

// --- CONSTANTES D'ANIMATION (TYPAGE STRICT BÉZIER) ---
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: premiumEase } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: premiumEase } }
};

const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: "0%", transition: { duration: 0.7, ease: premiumEase } },
  exit: { x: "100%", transition: { duration: 0.5, ease: premiumEase } }
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: premiumEase } }
};

// --- COMPOSANT PRINCIPAL ---
export default function CartDrawer() {
  // 1. On supprime le useState(false) local
  // 2. On récupère l'état et la fonction de fermeture depuis Zustand
  const { isCartOpen, closeCart } = useUIStore();
  const [items, setItems] = useState<CartItem[]>(MOCK_ITEMS);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeCart} // 4. On utilise closeCart au lieu de setIsOpen(false)
              className="fixed inset-0 bg-dark/60 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* TIROIR LATÉRAL */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-screen w-full md:w-112.5 bg-dark border-l border-light-grey/10 z-50 flex flex-col shadow-2xl selection:bg-white selection:text-dark"
            >
              
              {/* HEADER DU PANIER */}
              <div className="flex justify-between items-center p-8 border-b border-light-grey/10">
                <span className="font-mono text-[10px] tracking-[0.5em] text-light-grey/40 uppercase">
                  Sélection
                </span>
                <button 
                  onClick={closeCart} // 5. On utilise closeCart au lieu de setIsOpen(false)
                  className="group relative overflow-hidden flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-light-grey/20 transition-colors"
                >
                  <span className="font-mono text-xs text-light-grey group-hover:text-white transition-colors">✕</span>
                </button>
              </div>

              {/* LISTE DES ARTICLES */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                    <span className="font-title text-4xl text-light-grey/20 italic">VIDE</span>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-light-grey/40">Votre archive ne contient aucune pièce.</p>
                  </div>
                ) : (
                  <motion.ul 
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-8"
                  >
                    {items.map((item) => (
                      <motion.li key={item.id} variants={itemVariants} className="flex gap-6 group">
                        
                        {/* IMAGE MINIATURE */}
                        <div className="w-24 aspect-[3/4] bg-white/5 border border-light-grey/10 flex items-center justify-center overflow-hidden relative">
                           <img src={item.image} alt={item.name} className="h-[120%] w-auto object-contain scale-90 group-hover:scale-100 transition-transform duration-700 ease-out" />
                           <div className="absolute inset-0 bg-dark/20 mix-blend-multiply" />
                        </div>

                        {/* INFOS PRODUIT */}
                        <div className="flex flex-col justify-between flex-1 py-1 border-b border-light-grey/10 pb-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-title text-2xl text-white italic leading-none">{item.name}</h4>
                              <span className="font-mono text-sm text-white">{item.price}€</span>
                            </div>
                            <span className="font-mono text-[9px] tracking-[0.2em] text-light-grey/40 uppercase">
                              {item.culture} / Taille {item.size}
                            </span>
                          </div>

                          {/* ACTIONS TECHNIQUES */}
                          <div className="flex justify-between items-end mt-4">
                            <button 
                              onClick={() => setItems(items.filter(i => i.id !== item.id))}
                              className="font-mono text-[9px] uppercase tracking-widest text-light-grey/40 hover:text-white transition-colors underline decoration-light-grey/20 underline-offset-4"
                            >
                              Retirer
                            </button>

                            <div className="flex items-center gap-3 font-mono text-[10px] text-light-grey">
                              <button className="hover:text-white px-1 transition-colors">-</button>
                              <span className="text-white w-4 text-center">0{item.quantity}</span>
                              <button className="hover:text-white px-1 transition-colors">+</button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>

              {/* FOOTER (PAIEMENT) */}
              <div className="p-8 border-t border-light-grey/10 flex flex-col gap-6 bg-dark z-10">
                <div className="flex justify-between items-end font-mono">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] uppercase tracking-[0.2em] text-light-grey/40">Sous-total</span>
                     <span className="text-[9px] text-light-grey/20 uppercase">Taxes & expédition calculées à l'étape suivante</span>
                  </div>
                  <span className="text-xl text-white">{subtotal}€</span>
                </div>

                <button className="group relative w-full overflow-hidden bg-white text-dark py-5 flex justify-center items-center gap-4 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={items.length === 0}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold z-10">Finaliser l'acquisition</span>
                  <div className="absolute inset-0 bg-light-grey/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}