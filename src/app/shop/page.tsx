"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useTransform, MotionValue, useMotionValue, animate } from 'framer-motion';


interface Jersey {
  id: string;
  name: string;
  year: string;
  culture: string;
  image: string;
  inspiration: string;
}

const JERSEYS: Jersey[] = [
  { 
    id: "01", 
    name: "GUADELOUPE 971", // ou 972 si tu gardes la Martinique
    year: "1994", 
    culture: "GUADELOUPE", 
    image: "/placeholder-maillot.png",
    inspiration: "Un hommage vibrant à l'âme des Antilles. Ses motifs géométriques rappellent le tissage traditionnel du madras, tandis que ses teintes éclatantes capturent l'énergie des vagues de la mer des Caraïbes sous le soleil de midi."
  },
  { 
    id: "02", 
    name: "Undefined", 
    year: "Undefined", 
    culture: "Undefined", // J'ai adapté la culture pour plus de cohérence
    image: "/placeholder-bloque.png",
    inspiration: "Undefined"
  },
  { 
    id: "03", 
    name: "Undefined", 
    year: "Undefined", 
    culture: "Undefined", 
    image: "/placeholder-bloque.png",
    inspiration: "Undefined"
  },
];
// --- LOGIQUE MATHÉMATIQUE DE LA BOUCLE ---
// Calcule la distance relative d'un item sur un cercle infini.
// Retourne une valeur entre -1.5 et 1.5 (pour 3 items).
const getRelativeDistance = (progress: number, index: number, total: number) => {
  const dist = progress - index;
  let relativeDist = ((dist % total) + total) % total;
  // Si la distance dépasse la moitié, on le fait passer de l'autre côté pour l'effet de boucle
  if (relativeDist > total / 2) relativeDist -= total;
  return relativeDist;
};

const ProductArchive = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // animateProgress est maintenant un index continu : -10, -9... 0, 1, 2... 15, 16.
  const animateProgress = useMotionValue(0);
  
  // Références techniques pour le moteur de scroll
  const activeIndex = useRef(0);
  const isAnimating = useRef(false);
  
  // État UI pour l'affichage du numéro (01, 02, 03)
  const [displayIndex, setDisplayIndex] = useState(1);
  const total = JERSEYS.length;

  // Initialisation du tapis roulant (On place le scroll natif très loin du bord)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = window.innerHeight * 5;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const windowHeight = window.innerHeight;
    const centerScroll = windowHeight * 5; // Le point zéro de notre tapis roulant
    
    // Verrouillage pendant l'animation pour éviter les sauts
    if (isAnimating.current) {
      target.scrollTop = centerScroll;
      return;
    }

    const scrollPosition = target.scrollTop;
    const threshold = windowHeight * 0.15; // Il faut scroller 15% de l'écran pour déclencher

    // --- PROPULSION VERS LE BAS (NEXT) ---
    if (scrollPosition > centerScroll + threshold) {
        isAnimating.current = true;
        activeIndex.current += 1;
        
        animate(animateProgress, activeIndex.current, {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1], // Transition Premium Élastique
            onComplete: () => {
                isAnimating.current = false;
                setDisplayIndex(((activeIndex.current % total) + total) % total + 1);
            }
        });
        target.scrollTop = centerScroll; // On replace le scroll natif au milieu
    } 
    // --- PROPULSION VERS LE HAUT (PREV) ---
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
        target.scrollTop = centerScroll; // On replace le scroll natif au milieu
    }
  };

  return (
    <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="bg-[#131313] relative h-screen overflow-y-scroll selection:bg-white selection:text-[#131313] no-scrollbar"
    >
      {/* LE TAPIS ROULANT : Un espace fantôme immense (10 écrans) */}
      <div className="h-[1000vh] w-px absolute top-0 pointer-events-none opacity-0" />

      {/* LA VUE COLLANTE : L'objectif de la caméra */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-10">
        
        {/* TEXTE D'ARRIÈRE PLAN */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
           {JERSEYS.map((jersey, index) => (
             <BackgroundText key={`bg-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
           ))}
        </div>

        {/* IMAGES DES MAILLOTS */}
        <div className="relative w-full h-full max-w-xl flex items-center justify-center z-10">
           {JERSEYS.map((jersey, index) => (
             <JerseyImage key={`img-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
           ))}
        </div>

        {/* INTERFACE (TEXTES ET BOUTONS) */}
        {JERSEYS.map((jersey, index) => (
          <JerseyUI key={`ui-${jersey.id}`} jersey={jersey} index={index} total={total} progress={animateProgress} />
        ))}

        {/* INDICATEUR DE NUMÉRO (Dynamique) */}
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

// --- SOUS-COMPOSANTS : MATHÉMATIQUES RELATIVES (CORRIGÉS ET STABLES) ---

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
      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
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
      className="absolute bottom-12 left-6 right-6 md:left-20 md:right-20 flex flex-col gap-8 z-20"
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
            <span className="text-[#C3C3C3]/20">Origine</span>
            <span className="text-white">{jersey.culture}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#C3C3C3]/20">Saison</span>
            <span className="text-white">{jersey.year}</span>
          </div>
        </div>

        <button className="group relative overflow-hidden bg-white text-[#131313] px-12 py-4 flex items-center gap-4 transition-all duration-500 hover:pr-16 cursor-pointer">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Ajouter au panier</span>
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xs">→</motion.span>
          <div className="absolute inset-0 bg-[#C3C3C3]/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductArchive;