"use client";

import { useRef, useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { motion, useScroll, useTransform, Variants, Transition, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";

// --- CONFIGURATION PHYSIQUE DES RESSORTS ---
const luxurySpring: Transition = { type: "spring", stiffness: 100, damping: 30, mass: 1.2 };
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const textReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: { opacity: 1, y: "0%", transition: luxurySpring },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PiecePage({ params }: PageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number>(0);
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useUIStore((state) => state.openCart);

  const resolvedParams = use(params);
  const pieceId = resolvedParams.id;

  const getProductById = useProductStore((state) => state.getProductById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const isLoading = useProductStore((state) => state.isLoading);
  const hasFetched = useProductStore((state) => state.hasFetched);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const piece = getProductById(pieceId);

  const [selectedFormat, setSelectedFormat] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [allocation, setAllocation] = useState(1);
  
  // --- ÉTAT DU SLIDER D'IMAGES ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (piece && piece.formats.length > 0) setSelectedFormat(piece.formats[0]);
  }, [piece]);

  // ⚡️ NOUVEAU : AUTOPLAY DU SLIDER
  useEffect(() => {
    // On ne lance l'autoplay que si la pièce existe et possède plus d'une image
    if (!piece || piece.images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % piece.images.length);
    }, 3500); // 4000ms = 4 secondes. Tu peux ajuster ce rythme.

    // Nettoyage de l'intervalle si le composant est démonté
    return () => clearInterval(intervalId);
  }, [piece]);

  const { scrollYProgress } = useScroll();

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const imageBrightness = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const imageFilter = useTransform(imageBrightness, (v) => `brightness(${v})`);

  // Fetch en cours ou pas encore lancé → spinner
  if (isLoading || !hasFetched) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-light-grey animate-pulse" />
      </div>
    );
  }

  // Fetch terminé et produit introuvable → vraie 404
  if (!piece) notFound();

  // --- LOGIQUE MANUELLE DU SLIDER ---
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % piece.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? piece.images.length - 1 : prev - 1));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const delta = pointerStartX.current - e.clientX;
    if (Math.abs(delta) > 40) {
      delta > 0 ? handleNextImage() : handlePrevImage();
    }
  };

  const decreaseAllocation = () => setAllocation((prev) => Math.max(1, prev - 1));
  const increaseAllocation = () => {
    if (selectedFormat && allocation < selectedFormat.stock) {
      setAllocation((prev) => prev + 1);
    }
  };

 const handleAcquisition = async () => {
    if (!piece || !selectedFormat) return;

    // ⚡️ ARCHITECTURE V2 : Plus besoin de passer l'image, le prix, etc. 
    // On donne juste l'ID et la quantité à Medusa !
    await addToCart(selectedFormat.id, allocation);

    openCart();
  };

  return (
    <main ref={containerRef} className="relative w-full bg-dark text-light-grey selection:bg-white selection:text-dark min-h-screen">
      <div className="flex flex-col lg:grid lg:grid-cols-12 max-w-480 mx-auto relative">

        {/* COLONNE GAUCHE : L'ŒUVRE (Le Slider) */}
        <div className="lg:col-span-6 h-[70vh] lg:h-screen sticky top-0 overflow-hidden bg-dark flex items-center justify-center p-8 lg:p-24 z-0 relative">
          <motion.div
            className="relative w-full max-w-[400px] lg:max-w-125 aspect-4/5 flex items-center justify-center group"
            style={{
              scale: imageScale,
              filter: imageFilter,
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {/* Affichage de l'image avec transition de fondu */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={piece.images[currentImageIndex]}
                alt={`${piece.title} - Vue ${currentImageIndex + 1}`}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 0.9, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: LUXURY_EASE }}
                className="absolute inset-0 object-cover w-full h-full"
              />
            </AnimatePresence>

            {/* Indicateurs de progression luxueux (Lignes) */}
            {piece.images.length > 1 && (
              <>
                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-3 z-20">
                  {piece.images.map((_, idx) => (
                    <div key={idx} className="w-8 h-px bg-white/20 relative overflow-hidden">
                      {currentImageIndex === idx && (
                        <motion.div
                          layoutId="activeImageIndicator"
                          className="absolute inset-0 bg-white"
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Flèches de navigation — desktop uniquement, positionnées sous le slider */}
          {piece.images.length > 1 && (
            <div className="hidden lg:flex absolute bottom-8 left-0 right-0 items-center justify-center gap-8 z-30">
              <button
                onClick={handlePrevImage}
                className="font-mono text-[10px] tracking-widest uppercase text-light-grey/40 hover:text-white transition-colors duration-300 flex items-center gap-3"
              >
                <span className="flex items-center">
                  <span className="border-t border-l border-current p-1 rotate-[-45deg] transform" />
                  <span className="w-8 h-px bg-current" />
                </span>
                Prev
              </button>
              <span className="font-mono text-[10px] tracking-widest text-light-grey/20">
                {currentImageIndex + 1} / {piece.images.length}
              </span>
              <button
                onClick={handleNextImage}
                className="font-mono text-[10px] tracking-widest uppercase text-light-grey/40 hover:text-white transition-colors duration-300 flex items-center gap-3"
              >
                Next
                <span className="flex items-center">
                  <span className="w-8 h-px bg-current" />
                  <span className="border-t border-r border-current p-1 rotate-45 transform" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : L'ÉDITORIAL (Reste inchangée) */}
        <div className="lg:col-span-6 px-6 py-16 lg:py-32 lg:px-24 flex flex-col justify-center min-h-screen bg-dark lg:bg-transparent z-10 relative">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }} className="max-w-lg mx-auto lg:mx-0 w-full">
            {/* ... TON CONTENU ÉDITORIAL ... */}
            <div className="overflow-hidden mb-8">
              <motion.p variants={textReveal} className="font-mono text-[10px] tracking-widest uppercase border-b border-light-grey/10 pb-4 text-light-grey/60">
                ORA TRIP / Maillot / {piece.title}
              </motion.p>
            </div>

            <div className="overflow-hidden mb-12">
              <motion.h1 variants={textReveal} className="font-title text-5xl lg:text-7xl italic text-white leading-[1.1]">
                {piece.title}
              </motion.h1>
            </div>

            <div className="overflow-hidden mb-16">
              <motion.p variants={textReveal} className="text-sm leading-relaxed text-light-grey/80">
                {piece.history}
              </motion.p>
            </div>

            <div className="flex flex-col gap-10 mb-16">
              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex gap-8 border-b border-light-grey/10">
                  {piece.formats.map((f) => {
                    const isActive = selectedFormat?.name === f.name;
                    return (
                      <button
                        key={f.name}
                        onClick={() => { setSelectedFormat(f); setAllocation(1); }}
                        className={`relative pb-4 font-mono text-[10px] tracking-widest uppercase transition-colors duration-500 ${isActive ? "text-white" : "text-light-grey/40 hover:text-light-grey/80"}`}
                      >
                        {f.name}
                        {isActive && (
                          <motion.div layoutId="activeFormatIndicator" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" transition={luxurySpring} />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex flex-col gap-4">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">Quantite</span>
                  <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-white">
                    <button onClick={decreaseAllocation} disabled={allocation <= 1} className={`pb-1 transition-colors ${allocation <= 1 ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}>−</button>
                    <div className="w-4 h-4 overflow-hidden relative flex items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span key={allocation} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={luxurySpring} className="absolute">
                          {allocation}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button onClick={increaseAllocation} disabled={!selectedFormat || allocation >= selectedFormat.stock} className={`pb-1 transition-colors ${!selectedFormat || allocation >= selectedFormat.stock ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}>+</button>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-16">
              {[
                { label: "Identification", value: piece.id },
                { label: "Matière", value: piece.material },
                { label: "Prix", value: piece.value },
              ].map((detail, idx) => (
                <div key={idx} className="overflow-hidden">
                  <motion.div variants={textReveal} className="flex justify-between items-end border-b border-light-grey/10 pb-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">{detail.label}</span>
                    <span className="font-mono text-[10px] tracking-widest uppercase text-white">{detail.value}</span>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden">
              <motion.button
                variants={textReveal}
                whileHover="hover"
                onClick={handleAcquisition}
                disabled={piece.maxAllocation === 0}
                className="w-full relative py-6 flex items-center justify-between group overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-light-grey/10" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-light-grey/10" />
                <motion.div className="absolute inset-0 bg-white z-0 origin-left" initial={{ scaleX: 0 }} variants={{ hover: { scaleX: 1, transition: luxurySpring } }} />
                <span className="font-mono text-[10px] tracking-widest uppercase relative z-10 transition-colors duration-500 group-hover:text-dark text-white">
                  {piece.maxAllocation === 0 ? "Sold out" : "Ajouter au Panier"}
                </span>
                <motion.div className="relative z-10 flex items-center text-white group-hover:text-dark transition-colors duration-500" variants={{ hover: { x: 10, transition: luxurySpring } }}>
                  <span className="w-8 h-px bg-current mr-2" />
                  <span className="border-t border-r border-current p-1 rotate-45 transform" />
                </motion.div>
              </motion.button>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}