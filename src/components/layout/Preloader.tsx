"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 800); 
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-transparent">
          
          {/* PANNEAU GAUCHE - Nettoyé (pas de bordure) */}
          <motion.div 
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 1, ease: [0.85, 0, 0.15, 1] }}
            className="absolute left-0 top-0 w-1/2 h-full bg-[#131313] z-20"
          />

          {/* PANNEAU DROIT - Nettoyé */}
          <motion.div 
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 1, ease: [0.85, 0, 0.15, 1] }}
            className="absolute right-0 top-0 w-1/2 h-full bg-[#131313] z-20"
          />

          {/* CONTENU CENTRAL */}
          <motion.div 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative z-30 flex flex-col items-center gap-10"
          >
            {/* Logo */}
            <div className="w-16 h-16 mb-4 opacity-80">
               <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>

            {/* Texte Tagline */}
            <h2 className="font-title text-[#c3c3c3] text-2xl  tracking-[0.5em] uppercase text-center
             px-6 leading-relaxed">
              Chaque histoire merite <br/> d'être racontee
            </h2>

            {/* Barre de progression épurée */}
            <div className="w-40 h-4 bg-white/10 relative overflow-hidden rounded-full">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            {/* Année */}
            <span className="font-mono text-white/30 tracking-[0.3em] mt-12">
              2026
            </span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}