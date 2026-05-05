"use client"; 

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/store/useUIStore'; 
import { useCartStore } from '@/store/useCartStore'; // AJOUT : Store Panier

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCompte, setIsOpenCompte] = useState(false);
  
  const { openCart } = useUIStore(); 
  
  // AJOUT : Récupération de l'état du panier
  const itemCount = useCartStore((state) => state.getItemCount());
  const isHydrated = useCartStore((state) => state.isHydrated);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleMenuCompte = () => setIsOpenCompte(!isOpenCompte);

  return (
    <nav className="z-40 flex items-center justify-between px-6 py-4 w-full text-light-grey fixed top-0 font-mono pointer-events-none">
      
      {/* Logo */}
      <Link href='/' className="pointer-events-auto"> 
        <img 
          src="/logo2.png" 
          alt="Logo" 
          className="h-13 w-auto cursor-pointer" 
        />
      </Link>

      {/* Liens Desktop */}
      <div className='md:flex hidden pointer-events-auto'>
        <ul className='flex gap-8 tracking-[0.2em] font-bold '>
          <Link href="/histoire" ><li className="hover:opacity-50 cursor-pointer transition-opacity">NOTRE HISTOIRE</li></Link>
          <Link href="/shop"><li className="hover:opacity-50 cursor-pointer transition-opacity">SHOP</li> </Link>
          <Link href="/galerie"><li className="hover:opacity-50 cursor-pointer transition-opacity">GALERIE</li></Link>
          <Link href="/contact"> <li className="hover:opacity-50 cursor-pointer transition-opacity">CONTACTEZ-NOUS</li></Link>
        </ul> 
      </div>
      
      {/* Actions */}
      <div className='flex gap-5 items-center pointer-events-auto'>
        
        {/* BOUTON INVENTAIRE (PANIER) MODIFIÉ */}
        <button onClick={openCart} className="hover:opacity-80 transition-opacity flex items-center gap-2">
          <img src="/panier.png" alt="Panier" className="h-7 w-auto cursor-pointer" />
          
          {/* AJOUT TECHNIQUE : Compteur minimaliste */}
          <AnimatePresence mode="popLayout">
            {isHydrated && itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="relative right-4 -top-3 w-4 h-4 flex items-center justify-center bg-white text-[9px] text-dark rounded-full font-mono leading-none"
              >
                {itemCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        
        {/* Compte Desktop */}
        <Link href="/inscription" className="hidden md:block sm:opacity-100 disabled:opacity-50">
          <img 
            src="/compte.png" 
            alt="Compte" 
            className="h-7 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
          />
        </Link>

        {/* Compte Mobile */}
        <img 
          src="/compte.png" 
          alt="Compte" 
          className="h-7 w-auto cursor-pointer md:hidden hover:opacity-80 transition-opacity" 
          onClick={toggleMenuCompte} 
        />

        {/* Menu Burger Mobile */}
        <div onClick={toggleMenu} className="md:hidden cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="/menu-burger.png" 
            alt="Menu" 
            className="h-7 w-auto" 
          />
        </div>
      </div>

      {/* --- MENU COMPTE MOBILE (Inchangé) --- */}
      <AnimatePresence>
        {isOpenCompte && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 bg-[#131313] text-[#c3c3c3] flex flex-col p-10 z-[60] w-80 md:hidden pointer-events-auto"
          >
            <div className="flex justify-end mb-20" onClick={toggleMenuCompte}>
              <span className="text-sm tracking-widest cursor-pointer">X</span>
            </div>
            <ul className="flex flex-col gap-8 text-2xl font-title tracking-[0.2em]">
              <Link href="/connexion"><li onClick={toggleMenuCompte} className="hover:text-white">CONNECTEZ-VOUS</li></Link> 
              <Link href="/inscription"><li onClick={toggleMenuCompte} className="hover:text-white">INSCRIVEZ-VOUS</li></Link>
            </ul>
            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="text-[10px] tracking-widest opacity-50">ORA TRIP — 2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MENU NAVIGATION MOBILE (Inchangé) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 bg-[#131313] text-[#c3c3c3] flex flex-col p-10 z-[60] w-80 pointer-events-auto"
          >
            <div className="flex justify-end mb-20" onClick={toggleMenu}>
              <span className="text-sm tracking-widest cursor-pointer">X</span>
            </div>
            <ul className="flex flex-col gap-8 text-2xl font-title tracking-[0.2em]">
              <Link href="/histoire"><li onClick={toggleMenu} className="hover:text-white">NOTRE HISTOIRE</li></Link>
              <Link href="/shop"><li onClick={toggleMenu} className="hover:text-white">SHOP</li></Link>
              <Link href="/galerie"><li onClick={toggleMenu} className="hover:text-white">GALERIE</li></Link>
              <Link href="/contact"><li onClick={toggleMenu} className="hover:text-white">CONTACTEZ-NOUS</li></Link>
            </ul>
            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="text-[10px] tracking-widest opacity-50">ORA TRIP — 2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;