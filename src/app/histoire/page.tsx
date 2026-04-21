"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Page = () => {
  const containerRef = useRef(null);
  const chapter1Ref = useRef(null);
  const panoramaRef = useRef(null);

  // --- LOGIQUE TEXTE ANIME (HERO) ---
  const staticText = "CHAQUE HISTOIRE";
  const animatedText = "\u00A0MERITE D'ETRE RACONTEE";
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 250ms : vitesse de frappe ralentie et élégante
    const typingInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev < animatedText.length ? prev + 1 : prev));
    }, 100); 

    if (currentIndex === animatedText.length) {
      clearInterval(typingInterval);
      // 3000ms : temps d'attente une fois la phrase finie
      const restart = setTimeout(() => setCurrentIndex(0), 2000); 
      return () => clearTimeout(restart);
    }
    
    return () => clearInterval(typingInterval);
  }, [currentIndex, animatedText.length]);

  // --- CONFIGURATION DU SCROLL ---
  const { scrollYProgress: scrollCh1 } = useScroll({
    target: chapter1Ref,
    offset: ["start end", "end start"]
  });

  const smoothScroll = useSpring(scrollCh1, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const yImage = useTransform(smoothScroll, [0, 1], [100, -100]);
  const textOpacity = useTransform(smoothScroll, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);
  const textBlur = useTransform(smoothScroll, [0, 0.2, 0.8, 1], ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"]);

  const { scrollYProgress: scrollPano } = useScroll({
    target: panoramaRef,
    offset: ["start end", "end start"]
  });

  const clipPath = useTransform(
    scrollPano,
    [0, 0.4],
    ["inset(20% 15% 20% 15%)", "inset(0% 0% 0% 0%)"]
  );

  return (
    <div ref={containerRef} className="bg-dark text-light-grey overflow-x-hidden selection:bg-light-grey selection:text-dark">
      
      {/* --- SECTION HERO --- */}
      <section className="flex items-center justify-center h-screen w-screen relative">
        <div className="flex flex-col items-center gap-6">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="/logo.jpg" 
            alt="Logo" 
            className="h-30 w-auto" 
          />
          <p className="font-title text-light-grey tracking-[0.3em] text-center text-2xl flex items-center justify-center flex-wrap">
            <span>{staticText}</span>
            <span className="relative">
              {animatedText.slice(0, currentIndex)}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block h-6 w-[1px] bg-light-grey ml-1 align-middle"
              />
            </span>
          </p>
        </div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 font-mono text-[9px] tracking-[0.5em] opacity-30 uppercase"
        >
          Scroll pour découvrir
        </motion.div>
      </section>

      {/* --- CHAPITRE 01 --- */}
      <section ref={chapter1Ref} className="min-h-[120vh] w-full py-24 px-6 md:px-20 flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            style={{ y: yImage }}
            className="relative aspect-[3/4] w-full bg-light-grey/5 border border-light-grey/10 flex items-center justify-center overflow-hidden"
          >
            <motion.div 
                style={{ scale: useTransform(smoothScroll, [0, 1], [1.2, 1]) }}
                className="absolute inset-0 w-full h-full flex items-center justify-center italic font-mono text-light-grey/10 text-xs uppercase"
            >
                Espace Image : Genèse
            </motion.div>
          </motion.div>

          <motion.div 
            style={{ opacity: textOpacity, filter: textBlur }}
            className="flex flex-col gap-12"
          >
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
                Chapitre 01
              </span>
              
              <h2 className="font-title text-5xl md:text-7xl tracking-tighter leading-[0.9]">
                <div className="overflow-hidden h-[1.1em] py-1">
                    <motion.div
                        initial={{ y: "100%" }}
                        whileInView={{ y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        LA NAISSANCE
                    </motion.div>
                </div>
                <div className="overflow-hidden h-[1.1em] py-1 italic">
                    <motion.div
                        initial={{ y: "100%" }}
                        whileInView={{ y: 0 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        D'UNE QUÊTE
                    </motion.div>
                </div>
              </h2>
            </div>
            
            <div className="w-20 h-[1px] bg-light-grey/20" />

            <div className="flex flex-col gap-10 max-w-md font-mono text-lg leading-relaxed">
              <p className="transition-colors duration-700 hover:text-white">
                Depuis mon enfance, le football est ma passion. Ma première victoire ? En avoir fait mon métier. 
                Mais au-delà du rectangle vert, une fascination est née pour <span className="text-white border-b border-white/20 pb-1">l'identité visuelle</span> des clubs. 
                Le maillot est devenu pour moi bien plus qu'un vêtement technique : c'est une pièce d'archive qui porte l'histoire d'une ville sur les épaules.
              </p>
              
              <p className="text-sm opacity-50 italic font-light leading-loose">
                Pourtant, un constat s'impose. Les grands équipementiers saturent le marché de <span className="text-light-grey opacity-100">designs sans âme</span>. 
                Les clubs, eux, s'essoufflent à chercher une créativité disparue. Le maillot a perdu son essence originelle.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PANORAMA --- */}
      <section ref={panoramaRef} className="w-full h-screen px-6 md:px-10 py-10">
        <motion.div 
          style={{ clipPath: clipPath }}
          className="w-full h-full bg-light-grey/[0.03] border border-light-grey/10 flex items-center justify-center overflow-hidden"
        >
          <motion.span 
            style={{ 
                letterSpacing: useTransform(scrollPano, [0, 1], ["1em", "0.2em"]),
                opacity: useTransform(scrollPano, [0, 0.5, 1], [0, 1, 0.5])
            }}
            className="font-mono text-light-grey italic text-xs uppercase"
          >
            Le design est un langage
          </motion.span>
        </motion.div>
      </section>

      <div className="h-[30vh]" />
    </div>
  );
};

export default Page;