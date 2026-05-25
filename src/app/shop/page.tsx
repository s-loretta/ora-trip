"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useTransform, MotionValue, useMotionValue, animate } from 'framer-motion';
import Link from 'next/link';
import { useProductStore } from '@/store/useProductStore';

// On garde ton interface, on ajoute juste le "realId" pour le lien Medusa
interface Jersey {
  id: string;      // Ex: "01", "02" (Pour l'esthétique UI)
  realId: string;  // L'ID unique Medusa (Pour naviguer)
  name: string;
  year: string;
  culture: string;
  image: string;
  inspiration: string;
}

// --- LOGIQUE MATHÉMATIQUE DE LA BOUCLE (INTOUCHÉE) ---
const getRelativeDistance = (progress: number, index: number, total: number) => {
  const dist = progress - index;
  let relativeDist = ((dist % total) + total) % total;
  if (relativeDist > total / 2) relativeDist -= total;
  return relativeDist;
};

const ProductArchive = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- NOUVEAU : CONNEXION AU BACKEND ---
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- MOTEUR DE SCROLL (INTOUCHÉ) ---
  const animateProgress = useMotionValue(0);
  const activeIndex = useRef(0);
  const isAnimating = useRef(false);
  const [displayIndex, setDisplayIndex] = useState(1);
  
  // On crée notre tableau dynamiquement à partir des données Medusa
  const dynamicJerseys: Jersey[] = products.map((product, index) => ({
    id: String(index + 1).padStart(2, '0'),
    realId: product.id,
    name: product.title,
    year: product.year,
    culture: product.origin,
    image: product.imagePath,
    inspiration: product.history
  }));

  const total = dynamicJerseys.length;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = window.innerHeight * 5;
    }
  }, [total]); // On réinitialise si le total change

  // --- ÉCRAN DE CHARGEMENT MINIMALISTE ---
  // Indispensable car la logique mathématique crashe si total === 0
  if (isLoading || total === 0) {
    return (
      <div className="bg-[#131313] h-screen w-full flex items-center justify-center">
        <span className="font-mono text-xs text-[#C3C3C3] uppercase tracking-[0.4em] animate-pulse">
          Accès au shop...
        </span>
      </div>
    );
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const windowHeight = window.innerHeight;
    const centerScroll = windowHeight * 5; 
    
    if (isAnimating.current) {
      target.scrollTop = centerScroll;
      return;
    }

    const scrollPosition = target.scrollTop;
    const threshold = windowHeight * 0.15; 

    if (scrollPosition > centerScroll + threshold) {
        isAnimating.current = true;
        activeIndex.current += 1;
        
        animate(animateProgress, activeIndex.current, {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1], 
            onComplete: () => {
                isAnimating.current = false;
                setDisplayIndex(((activeIndex.current % total) + total) % total + 1);
            }
        });
        target.scrollTop = centerScroll; 
    } 
    else if (scrollPosition < centerScroll - threshold) {
        isAnimating.current = true;
        activeIndex.current -= 1;
        
        animate(animateProgress, activeIndex.current, {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            onComplete: () => {
                isAnimating.current = false;
                setDisplayIndex(((activeIndex.current % total) + total) % total + 1);
            }
        });
        target.scrollTop = centerScroll; 
    }
  };

  return (
    <div 
        ref={containerRef} 
        onScroll={handleScroll}
        data-lenis-prevent="true"
        className="bg-[#131313] relative h-screen overflow-y-scroll selection:bg-white selection:text-[#131313] no-scrollbar"
    >
      <div className="h-[1000vh] w-px absolute top-0 pointer-events-none opacity-0" />

      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-10">
        
        <div className="absolute inset-0 flex items-center justify-center -z-10">
           {dynamicJerseys.map((jersey, index) => (
             <BackgroundText key={`bg-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
           ))}
        </div>

        <div className="relative w-full h-full max-w-xl flex items-center justify-center z-10">
           {dynamicJerseys.map((jersey, index) => (
             <JerseyImage key={`img-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
           ))}
        </div>

        {dynamicJerseys.map((jersey, index) => (
          <JerseyUI key={`ui-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
        ))}

        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-30 pointer-events-none">
          <span className="font-mono text-[9px] text-[#C3C3C3]/20 rotate-90 mb-6">ARCHIVE</span>
          <span className="font-mono text-sm text-white transition-all duration-300">
            0{displayIndex}
          </span>
          <div className="h-16 w-[1px] bg-white/20 relative overflow-hidden mt-2">
             <motion.div 
               animate={{ y: ["-100%", "100%"] }} 
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="absolute inset-0 bg-white" 
             />
          </div>
        </div>

      </div>
    </div>
  );
};

// --- SOUS-COMPOSANTS (AJUSTÉS POUR LE MOBILE) ---

const BackgroundText = ({ jersey, index, total, progress }: { jersey: Jersey, index: number, total: number, progress: MotionValue<number> }) => {
  const y = useTransform(progress, p => `${getRelativeDistance(p, index, total) * -20}vh`);
  const opacity = useTransform(progress, p => Math.max(0.01, 0.15 - Math.abs(getRelativeDistance(p, index, total)) * 0.14));
  const scale = useTransform(progress, p => 1 - Math.abs(getRelativeDistance(p, index, total)) * 0.2);

  return (
    <motion.h2 
      style={{ y, opacity, scale, position: 'absolute' }}
      className="font-title text-[20vw] md:text-[15vw] italic text-white whitespace-nowrap leading-none pointer-events-none"
    >
      {jersey.name}
    </motion.h2>
  );
};

const JerseyImage = ({ jersey, index, total, progress }: { jersey: Jersey, index: number, total: number, progress: MotionValue<number> }) => {
  const y = useTransform(progress, p => `${getRelativeDistance(p, index, total) * -100}vh`);
  const scale = useTransform(progress, p => 1 - Math.abs(getRelativeDistance(p, index, total)) * 0.4);
  
  const filter = useTransform(progress, p => {
    const brightness = Math.max(0, 1 - Math.abs(getRelativeDistance(p, index, total)));
    const blurNum = Math.abs(getRelativeDistance(p, index, total)) * 20;
    return `brightness(${brightness}) blur(${blurNum}px)`;
  });

  return (
    <motion.div 
      style={{ y, scale, filter }}
      // ⚡️ AJOUT : pb-32 sur mobile pour remonter l'image, md:pb-0 pour l'annuler sur PC
      className="absolute inset-0 flex items-center justify-center pb-32 md:pb-0 z-10 pointer-events-none"
    >
      <img
        src={jersey.image}
        alt={jersey.name}
        className="h-[60vh] w-auto object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
};

const JerseyUI = ({ jersey, index, total, progress }: { jersey: Jersey, index: number, total: number, progress: MotionValue<number> }) => {
  const y = useTransform(progress, p => `${getRelativeDistance(p, index, total) * -40}px`);
  const opacity = useTransform(progress, p => Math.max(0, 1 - Math.abs(getRelativeDistance(p, index, total)) * 3));
  const pointerEvents = useTransform(progress, p => Math.abs(getRelativeDistance(p, index, total)) < 0.05 ? "auto" : "none");

  return (
    <motion.div 
      style={{ opacity, y, pointerEvents: pointerEvents as any }}
      // ⚡️ MODIFICATION : bottom-28 sur mobile pour remonter le bloc entier, md:bottom-12 sur PC
      className="absolute bottom-28 md:bottom-12 left-6 right-6 md:left-20 md:right-20 flex flex-col gap-8 z-20"
    >
      <div className="w-full border-b border-[#C3C3C3]/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] tracking-[0.5em] text-[#C3C3C3]/30 uppercase">Archive No. {jersey.id}</span>
          <h3 className="font-title text-4xl md:text-6xl text-white italic leading-none">{jersey.name}</h3>
        </div>
        <div className="max-w-xs">
          <p className="font-mono text-[11px] leading-relaxed text-[#C3C3C3]/60 italic border-l border-[#C3C3C3]/10 pl-4">
            "{jersey.inspiration}"
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 font-mono">
        <div className="flex gap-10 text-[10px] uppercase tracking-[0.2em]">
          <div className="flex flex-col gap-1">
            <span className="text-[#C3C3C3]/20">Brand</span>
            <span className="text-white">{jersey.culture}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#C3C3C3]/20">Année</span>
            <span className="text-white">{jersey.year}</span>
          </div>
        </div>

        {/* Le bouton est devenu un Link qui pointe vers la fiche produit Medusa */}
        <Link 
          href={`/shop/${jersey.realId}`}
          className="group relative overflow-hidden bg-white text-[#131313] px-12 py-4 flex items-center gap-4 transition-all duration-500 hover:pr-16 cursor-pointer inline-flex"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">J'achete !</span>
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xs">→</motion.span>
          <div className="absolute inset-0 bg-[#C3C3C3]/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductArchive;