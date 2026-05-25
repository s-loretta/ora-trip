"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';

const Page = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chapter1Ref = useRef<HTMLElement>(null);
  const chapter2Ref = useRef<HTMLElement>(null);
  const chapter3Ref = useRef<HTMLElement>(null);
  const chapter4Ref = useRef<HTMLElement>(null);
  const panoramaRef = useRef<HTMLElement>(null);

  // --- ÉTAT NAVIGATION LATERALE ---
  const [activeSection, setActiveSection] = useState(0);

  // --- LOGIQUE TEXTE ANIME (HERO) ---
  const staticText = "CHAQUE HISTOIRE";
  const animatedText = "\u00A0MERITE D'ETRE RACONTEE";
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev < animatedText.length ? prev + 1 : prev));
    }, 100); 

    if (currentIndex === animatedText.length) {
      clearInterval(typingInterval);
      const restart = setTimeout(() => setCurrentIndex(0), 2000); 
      return () => clearTimeout(restart);
    }
    return () => clearInterval(typingInterval);
  }, [currentIndex, animatedText.length]);

  // --- DETECTION DE LA SECTION ACTIVE ---
  useEffect(() => {
    const sections = [
      { id: 1, ref: chapter1Ref },
      { id: 2, ref: chapter2Ref },
      { id: 3, ref: chapter3Ref },
      { id: 4, ref: chapter4Ref },
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Déclenche quand la section est au milieu
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sections.find(s => s.ref.current === entry.target);
          if (section) setActiveSection(section.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(s => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

 const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }
};

  // --- SCROLL CONFIGURATIONS ---
  const { scrollYProgress: scrollCh1 } = useScroll({ target: chapter1Ref, offset: ["start end", "end start"] });
  const smoothScroll1 = useSpring(scrollCh1, { stiffness: 100, damping: 30 });
  const yImage1 = useTransform(smoothScroll1, [0, 1], [100, -100]);
  const textOpacity1 = useTransform(smoothScroll1, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);
  const textBlur1 = useTransform(smoothScroll1, [0.1, 0.3, 0.7, 0.9], ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"]);

  const { scrollYProgress: scrollCh2 } = useScroll({ target: chapter2Ref, offset: ["start end", "end start"] });
  const smoothScroll2 = useSpring(scrollCh2, { stiffness: 100, damping: 30 });
  const yImage2 = useTransform(smoothScroll2, [0, 1], [100, -100]);
  const textOpacity2 = useTransform(smoothScroll2, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);
  const textBlur2 = useTransform(smoothScroll2, [0.1, 0.3, 0.7, 0.9], ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"]);

  const { scrollYProgress: scrollCh3 } = useScroll({ target: chapter3Ref, offset: ["start end", "end start"] });
  const lineWidth = useTransform(scrollCh3, [0.1, 0.5], ["0%", "100%"]);
  const objectivesOpacity = useTransform(scrollCh3, [0.2, 0.4, 0.8, 0.9], [0, 1, 1, 0]);

  const { scrollYProgress: scrollCh4 } = useScroll({ target: chapter4Ref, offset: ["start end", "end start"] });
  const smoothScroll4 = useSpring(scrollCh4, { stiffness: 100, damping: 30 });
  const quoteX = useTransform(smoothScroll4, [0.3, 0.6], [50, 0]);
  const manifestoOpacity = useTransform(scrollCh4, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const { scrollYProgress: scrollPano } = useScroll({ target: panoramaRef, offset: ["start end", "end start"] });
  const clipPath = useTransform(scrollPano, [0, 0.4], ["inset(20% 15% 20% 15%)", "inset(0% 0% 0% 0%)"]);

  return (
    <div ref={containerRef} className="bg-dark text-light-grey overflow-x-hidden selection:bg-light-grey selection:text-dark">
      
      {/* --- NAVIGATION LATERALE --- */}
      <nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 p-2 bg-light-grey/5 backdrop-blur-md rounded-full border border-light-grey/10">
        {[
          { id: 1, ref: chapter1Ref },
          { id: 2, ref: chapter2Ref },
          { id: 3, ref: chapter3Ref },
          { id: 4, ref: chapter4Ref },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.ref)}
            className={`
              w-10 h-10 rounded-full font-mono text-[10px] transition-all duration-500 border border-transparent
              ${activeSection === item.id 
                ? "bg-light-grey text-dark scale-110 shadow-lg shadow-white/5" 
                : "text-light-grey/40 hover:text-light-grey hover:bg-light-grey/10"
              }
            `}
          >
            0{item.id}
          </button>
        ))}
      </nav>

      {/* --- HERO --- */}
      <section className="flex items-center justify-center h-screen w-screen relative">
        <div className="flex flex-col items-center gap-6">
          <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} src="/logo.jpg" alt="Logo" className="h-30 w-auto" />
          <p className="font-title text-light-grey tracking-[0.3em] text-center text-2xl flex items-center justify-center flex-wrap italic">
            <span>{staticText}</span>
            <span className="relative">{animatedText.slice(0, currentIndex)}<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block h-6 w-[1px] bg-light-grey ml-1 align-middle" /></span>
          </p>
        </div>
      </section>

      {/* --- CHAPITRE 01 --- */}
      <section ref={chapter1Ref} className="min-h-[120vh] w-full py-24 px-6 md:px-20 flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            style={{ y: yImage1 }}
            className="relative aspect-[3/4] w-full bg-light-grey/5 border border-light-grey/10 flex items-center justify-center overflow-hidden"
          >
            <motion.div 
                style={{ scale: useTransform(smoothScroll1, [0, 1], [1.2, 1]) }}
                className="absolute inset-0 w-full h-full"
            >
                <Image 
                  src="/histoire/01.JPG" 
                  alt="La naissance d'une quête" 
                  fill 
                  className="object-cover opacity-80" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
            </motion.div>
          </motion.div>

          <motion.div 
            style={{ opacity: textOpacity1, filter: textBlur1 }}
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
                        D'UNE QUETE
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
          className="relative w-full h-full bg-light-grey/[0.03] border border-light-grey/10 overflow-hidden"
        >
          {/* ⚡️ IMAGE PANORAMIQUE AJOUTÉE ICI */}
          <Image 
            src="/histoire/04.JPG" 
            alt="Le design est un langage" 
            fill 
            className="object-cover opacity-90" 
            sizes="100vw"
          />
        </motion.div>
      </section>

      {/* --- CHAPITRE 02 --- */}
      <section ref={chapter2Ref} className="min-h-[140vh] w-full py-24 px-6 md:px-20 flex flex-col justify-center relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          
          <motion.div 
            style={{ opacity: textOpacity2, filter: textBlur2 }} 
            className="flex flex-col gap-12 order-2 md:order-1 font-mono"
          >
            <div className="flex flex-col gap-6">
              <span className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase font-mono">Chapitre 02</span>
              <h2 className="font-title text-5xl md:text-7xl tracking-tighter leading-[0.9]">
                <div className="overflow-hidden h-[1.1em] py-1">
                  <motion.div initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 1 }}>UNE NOUVELLE</motion.div>
                </div>
                <div className="overflow-hidden h-[1.1em] py-1 italic opacity-80">
                  <motion.div initial={{ y: "100%" }} whileInView={{ y: 0 }} transition={{ duration: 1, delay: 0.1 }}>VISION</motion.div>
                </div>
              </h2>
            </div>

            <div className="w-20 h-[1px] bg-light-grey/20" />

            <div className="flex flex-col gap-8 max-w-md">
              <p className="text-lg leading-relaxed opacity-90">
                Dans un monde où le maillot est devenu un vêtement quotidien, 
                <span className="text-white"> ORA TRIP</span> transforme cette pièce iconique en objet culturel et intemporel.
              </p>
              <p className="text-sm opacity-60 leading-relaxed font-light">
                Nos créations s'inspirent des peuples, des villes et des civilisations antiques pour offrir des maillots uniques, chargés de sens et d'histoire.
              </p>
            </div>

            <div className="flex flex-col gap-6 pt-6 border-t border-light-grey/10 max-w-md">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Nos Valeurs fondamentales</span>
              
              <div className="grid grid-cols-1 gap-y-6">
                {[
                  { label: "Originalité", desc: "Chaque design raconte une histoire unique, sans recyclage." },
                  { label: "Accessibilité", desc: "Qualité premium au prix juste, loin de l'industrie de masse." },
                  { label: "Culture", desc: "Passerelle entre football, art et identité." },
                  { label: "Authenticité", desc: "Fidélité à la passion et à l'esprit originel du jeu." }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col gap-1 group">
                    <span className="text-xs uppercase tracking-widest text-white group-hover:translate-x-2 transition-transform duration-300">
                      {item.label}
                    </span>
                    <span className="text-[13px] text-light-grey/50 leading-snug font-light italic">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={{ y: yImage2 }} 
            className="relative aspect-[3/4] w-full bg-light-grey/5 border border-light-grey/10 flex items-center justify-center overflow-hidden order-1 md:order-2 md:sticky md:top-24"
          >
            <Image 
              src="/histoire/2.JPG" 
              alt="Culture & Vision ORA TRIP" 
              fill 
              className="object-cover opacity-80" 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </section>

      {/* --- CHAPITRE 03 --- */}
      <section ref={chapter3Ref} className="min-h-screen w-full py-32 px-6 md:px-20 flex flex-col justify-center relative font-mono">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-6 mb-20 text-center md:text-left">
            <span className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">Chapitre 03</span>
            <h2 className="font-title text-5xl md:text-7xl tracking-tighter leading-[0.9]">NOS <span className="italic">OBJECTIFS</span></h2>
          </div>

          <div className="relative w-full h-[1px] bg-light-grey/10 mb-16 hidden md:block">
            <motion.div style={{ width: lineWidth }} className="absolute h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>

          <motion.div style={{ opacity: objectivesOpacity }} className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { time: "Court Terme", goal: "Proposer des pièces fortes et accessibles, qui dépassent le sport pour devenir des symboles culturels.", id: "01" },
              { time: "Moyen Terme", goal: "Evoluer vers une marque d'équipement complète en conservant notre philosophie : qualité, singularité, culture.", id: "02" },
              { time: "Long Terme", goal: "Devenir un acteur précurseur qui développe la culture à travers le football et au-delà.", id: "03" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col gap-6 p-8 bg-white/[0.02] border border-light-grey/5 hover:border-light-grey/20 transition-colors duration-500 group">
                <span className="text-4xl font-title opacity-10 group-hover:opacity-100 transition-opacity duration-700">/{item.id}</span>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 italic">{item.time}</span>
                  <p className="text-[15px] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity duration-300">{item.goal}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CHAPITRE 04 : LE MANIFESTE --- */}
      <section ref={chapter4Ref} className="min-h-[200vh] w-full py-32 px-6 md:px-20 flex flex-col items-center relative font-mono">
        <motion.div 
          style={{ opacity: manifestoOpacity }}
          className="max-w-4xl w-full flex flex-col gap-24 relative z-10"
        >
          <div className="flex flex-col gap-12 text-center items-center">
            <div className="flex flex-col gap-4">
               <span className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">Chapitre 04</span>
               <h2 className="font-title text-5xl md:text-8xl tracking-tighter leading-none italic">UN MAILLOT,  UNE HISTOIRE</h2>
            </div>
            <p className="text-xl md:text-3xl leading-tight tracking-tight text-white font-light">
              "Chaque maillot porte une histoire. Pas seulement celle d'un club, mais celle d'une <span className="italic opacity-70">identité</span>, d'un parcours, d'une énergie."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start text-justify">
             <div className="flex flex-col gap-8">
                <p className="text-lg leading-relaxed opacity-80">
                  Chez ORA TRIP, nous croyons qu'un maillot peut être bien plus qu'un vêtement sportif : c'est une <span className="text-white border-b border-white/20">toile d'expression</span>, un témoignage vivant de qui nous sommes, d'où nous venons, et de ce que nous rêvons de devenir.
                </p>
                
                {/* ⚡️ IMAGE AGRANDIE ICI */}
                <div className="relative aspect-square w-64 md:w-80 bg-light-grey/5 border border-light-grey/10 self-center md:self-start flex items-center justify-center overflow-hidden mt-4">
                  <Image 
                    src="/histoire/03.JPG" 
                    alt="Symbolique ORA TRIP" 
                    fill 
                    className="object-cover opacity-80" 
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
             </div>
             <div className="flex flex-col gap-8 pt-12 md:pt-24">
                <p className="text-lg leading-relaxed opacity-80">
                  Chaque design ORA TRIP puise dans des histoires vraies, des trajectoires humaines, des symboles et des émotions pour créer des pièces authentiques, chargées de sens et <span className="text-white">tournées vers l'avenir</span>.
                </p>
             </div>
          </div>

          <motion.div 
            style={{ x: quoteX }}
            className="w-full py-20 border-y border-light-grey/10 my-10 relative"
          >
             <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-dark px-4 text-[10px] tracking-[0.5em] text-light-grey/30">L'INSPIRATION</span>
             <p className="text-2xl md:text-4xl text-center font-title tracking-tight leading-relaxed italic">
                « C'est la paire qui raconte vraiment qui je suis. »
             </p>
             <span className="block text-center mt-6 text-[10px] tracking-[0.3em] uppercase opacity-40">— Michael Jordan (Air Jordan XX)</span>
          </motion.div>

          <div className="flex flex-col gap-12 text-center items-center pb-32">
             <p className="text-xl leading-relaxed max-w-2xl">
               ORA TRIP est un voyage à travers les âmes, les epoques et les cultures. Une marque qui transforme le maillot en <span className="text-white underline underline-offset-8 decoration-white/20">langage visuel</span>.
             </p>
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center gap-4 mt-12"
             >
                <div className="h-20 w-[1px] bg-gradient-to-b from-transparent to-white/40" />
                <span className="font-title text-2xl md:text-4xl tracking-widest uppercase">
                  Parce que tout le monde a une histoire <br /> 
                  <span className="italic opacity-60">qui merite d'être racontee.</span>
                </span>
             </motion.div>
          </div>
        </motion.div>
      </section>

      <div className="h-[10vh]" />
    </div>
  );
};

export default Page;