"use client"; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="z-50 flex items-center justify-between px-6 py-4 w-full text-[#131313] fixed font-mono">
      
      {/* Logo */}
      <img 
        src="/logonoir2.png" 
        alt="Logo" 
        className="h-13 w-auto z-50 cursor-pointer" 
      />

      {/* Liens Desktop (cachés sur mobile) */}
      <div className='md:flex hidden'>
        <ul className='flex gap-8  tracking-[0.2em] font-bold '>
          <li className="hover:opacity-50 cursor-pointer transition-opacity">NOTRE HISTOIRE</li>
          <li className="hover:opacity-50 cursor-pointer transition-opacity">SHOP</li> 
          <li className="hover:opacity-50 cursor-pointer transition-opacity">GALERIE</li>
          <li className="hover:opacity-50 cursor-pointer transition-opacity">CONTACTEZ-NOUS</li>
        </ul> 
      </div>
      
      {/* Actions (Panier, Compte, Burger) */}
      <div className='flex gap-5 items-center z-50'>
        <img src="/panier.png" alt="Panier" className="h-7 w-auto cursor-pointer" />
        <img src="/compte.png" alt="Compte" className="h-7 w-auto cursor-pointer" />
        
        {/* BOUTON BURGER : On ajoute le onClick ici */}
        <div onClick={toggleMenu} className="md:hidden cursor-pointer">
          <img 
            src="/menu-burger.png" 
            alt="Menu" 
            className="h-7 w-auto" 
          />
        </div>
      </div>

      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 80}}
            exit={{ x: '125%' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#131313] text-[#c3c3c3] flex flex-col p-10 z-[60] w-80 "
          >
            {/* Bouton Fermer à l'intérieur du menu */}
            <div className="flex justify-end mb-20" onClick={toggleMenu}>
              <span className="text-sm tracking-widest cursor-pointer">[ FERMER ]</span>
            </div>

            {/* Liens du menu mobile */}
            <ul className="flex flex-col gap-8 text-2xl font-title tracking-[0.2em]">
              <li onClick={toggleMenu} className="hover:text-white">NOTRE HISTOIRE</li>
              <li onClick={toggleMenu} className="hover:text-white">SHOP</li>
              <li onClick={toggleMenu} className="hover:text-white">GALERIE</li>
              <li onClick={toggleMenu} className="hover:text-white">CONTACTEZ-NOUS</li>
            </ul>

            {/* Footer du menu mobile */}
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