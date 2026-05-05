"use client";

import { useRef, useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { motion, useScroll, useTransform, Variants, Transition } from "framer-motion";
import { useProductStore } from "@/store/useProductStore";

// --- CONFIGURATION PHYSIQUE DES RESSORTS ---
const luxurySpring: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  mass: 1.2,
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const textReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: luxurySpring,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PiecePage({ params }: PageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedParams = use(params);
  const pieceId = resolvedParams.id;

  const getProductById = useProductStore((state) => state.getProductById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const isLoading = useProductStore((state) => state.isLoading);

  // BUG CORRIGÉ : fetchProducts n'était jamais déclenché → store vide → notFound()
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const piece = getProductById(pieceId);

  const [selectedFormat, setSelectedFormat] = useState<{ name: string; stock: number } | null>(null);
  const [allocation, setAllocation] = useState(1);

  useEffect(() => {
    if (piece && piece.formats.length > 0) setSelectedFormat(piece.formats[0]);
  }, [piece]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const imageBrightness = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  // --- RENDU CONDITIONNEL ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-light-grey animate-pulse" />
      </div>
    );
  }

  if (!piece && !isLoading) {
    notFound();
  }

  if (!piece) return null;

  const decreaseAllocation = () => setAllocation((prev) => Math.max(1, prev - 1));

  const increaseAllocation = () => {
    if (selectedFormat && allocation < selectedFormat.stock) {
      setAllocation((prev) => prev + 1);
    }
  };

  const handleAcquisition = () => {
    console.log("Acquisition initiée pour :", {
      pieceId: piece.id,
      format: selectedFormat,
      quantity: allocation,
    });
  };

  return (
    <main
      ref={containerRef}
      className="relative w-full bg-dark text-light-grey selection:bg-white selection:text-dark min-h-[200vh]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 max-w-480 mx-auto">

        {/* COLONNE GAUCHE : L'ŒUVRE */}
        <div className="lg:col-span-6 h-screen sticky top-0 overflow-hidden bg-dark flex items-center justify-center p-8 lg:p-24">
          <motion.div
            className="w-full max-w-125 aspect-4/5 flex items-center justify-center overflow-hidden"
            style={{
              scale: imageScale,
              filter: useTransform(imageBrightness, (v) => `brightness(${v})`),
            }}
          >
            <motion.img
              layoutId={`piece-image-${piece.id}`}
              src={piece.imagePath}
              alt={piece.title}
              className="object-cover w-full h-full opacity-90"
            />
          </motion.div>
        </div>

        {/* COLONNE DROITE : L'ÉDITORIAL */}
        <div className="lg:col-span-6 px-8 py-32 lg:px-24 flex flex-col justify-center min-h-screen">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-lg">

            {/* Fil d'Ariane */}
            <div className="overflow-hidden mb-8">
              <motion.p variants={textReveal} className="font-mono text-[10px] tracking-widest uppercase border-b border-light-grey/10 pb-4">
                Archive / {piece.origin} / {piece.year}
              </motion.p>
            </div>

            {/* Titre */}
            <div className="overflow-hidden mb-12">
              <motion.h1 variants={textReveal} className="font-title text-5xl lg:text-7xl italic text-white leading-[1.1]">
                {piece.title}
              </motion.h1>
            </div>

            {/* Histoire */}
            <div className="overflow-hidden mb-16">
              <motion.p variants={textReveal} className="text-sm leading-relaxed text-light-grey/80">
                {piece.history}
              </motion.p>
            </div>

            {/* SÉLECTEURS : Format & Allocation */}
            <div className="flex flex-col gap-8 mb-16">

              {/* Sélecteur de Format */}
              <div className="flex gap-6">
                {piece.formats.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => { setSelectedFormat(f); setAllocation(1); }}
                    className={selectedFormat?.name === f.name ? "text-white" : "text-light-grey/40"}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Sélecteur d'Allocation */}
              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex flex-col gap-4">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">
                    Quantité
                  </span>
                  <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-white">
                    <button
                      onClick={decreaseAllocation}
                      disabled={allocation <= 1}
                      className={`pb-1 transition-colors ${allocation <= 1 ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
                    >
                      −
                    </button>
                    <span className="w-4 text-center">{allocation}</span>
                    <button
                      onClick={increaseAllocation}
                      disabled={!selectedFormat || allocation >= selectedFormat.stock}
                      className={`pb-1 transition-colors ${!selectedFormat || allocation >= selectedFormat.stock ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
                    >
                      +
                    </button>
                  </div>
                  {/* Indicateur de stock restant */}
                  {selectedFormat && (
                    <span className="font-mono text-[9px] tracking-widest text-light-grey/30">
                      {selectedFormat.stock} unité{selectedFormat.stock > 1 ? "s" : ""} disponible{selectedFormat.stock > 1 ? "s" : ""}
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Inventaire Technique */}
            <div className="flex flex-col gap-4 mb-16">
              {[
                { label: "Identification", value: piece.id },
                { label: "Matière", value: piece.material },
                { label: "Valeur", value: piece.value },
              ].map((detail, idx) => (
                <div key={idx} className="overflow-hidden">
                  <motion.div
                    variants={textReveal}
                    className="flex justify-between items-end border-b border-light-grey/10 pb-2"
                  >
                    <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">
                      {detail.label}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest uppercase text-white">
      {detail.value}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Interaction d'Acquisition */}
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

                <motion.div
                  className="absolute inset-0 bg-white z-0 origin-left"
                  initial={{ scaleX: 0 }}
                  variants={{ hover: { scaleX: 1, transition: luxurySpring } }}
                />

                <span className="font-mono text-[10px] tracking-widest uppercase relative z-10 transition-colors duration-500 group-hover:text-dark text-white">
                  {piece.maxAllocation === 0 ? "Archive Épuisée" : "Initier l'Acquisition"}
                </span>

                <motion.div
                  className="relative z-10 flex items-center text-white group-hover:text-dark transition-colors duration-500"
                  variants={{ hover: { x: 10, transition: luxurySpring } }}
                >
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
