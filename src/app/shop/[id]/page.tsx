"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, Variants, Transition } from "framer-motion";

// --- TYPAGE STRICT ---
interface PieceData {
  id: string;
  title: string;
  year: string;
  origin: string;
  material: string;
  history: string;
  value: string;
  imagePath: string;
  formats: string[];
  maxAllocation: number;
}

const mockPiece: PieceData = {
  id: "ora-001",
  title: "L'Héritage de 98",
  year: "1998",
  origin: "Paris, France",
  material: "100% Polyester Jacquard",
  history:
    "Une relique tissée dans le temps. Ce tissu ne raconte pas seulement une victoire, mais le souffle retenu d'une nation entière. Ses lignes asymétriques capturent le chaos géométrique de la fin des années 90, restaurées aujourd'hui pour l'éternité.",
  value: "450 €",
  imagePath: "/placeholder-maillot.png",
  formats: ["S-M", "L-XL", "XXL", "52"], // Tailles adaptées au luxe (équivalent S, M, L, XL)
  maxAllocation: 3, // Quantité max
};

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

export default function PiecePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // États locaux pour le Format (Taille) et l'Allocation (Quantité)
  const [selectedFormat, setSelectedFormat] = useState<string>(mockPiece.formats[0]);
  const [allocation, setAllocation] = useState<number>(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const imageBrightness = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  // Fonctions de gestion de l'allocation
  const decreaseAllocation = () => setAllocation((prev) => Math.max(1, prev - 1));
  const increaseAllocation = () => setAllocation((prev) => Math.min(mockPiece.maxAllocation, prev + 1));

  return (
    <main
      ref={containerRef}
      className="relative w-full bg-dark text-light-grey selection:bg-white selection:text-dark min-h-[200vh]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 max-w-[1920px] mx-auto">
        
        {/* COLONNE GAUCHE : L'ŒUVRE (Fixée avec "Passe-partout") */}
        <div className="lg:col-span-6 relative h-screen sticky top-0 overflow-hidden bg-dark flex items-center justify-center p-8 lg:p-24">
          <motion.div
            className="w-full max-w-[500px] aspect-[4/5] relative flex items-center justify-center overflow-hidden"
            style={{ 
              scale: imageScale, 
              filter: useTransform(imageBrightness, (v) => `brightness(${v})`) 
            }}
          >
            <motion.img
              layoutId={`piece-image-${mockPiece.id}`}
              src={mockPiece.imagePath}
              alt={mockPiece.title}
              className="object-cover w-full h-full opacity-90"
            />
          </motion.div>
        </div>

        {/* COLONNE DROITE : L'ÉDITORIAL (Défilante) */}
        <div className="lg:col-span-6 px-8 py-32 lg:px-24 flex flex-col justify-center min-h-screen">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-lg"
          >
            {/* Fil d'Ariane Minimaliste */}
            <div className="overflow-hidden mb-8">
              <motion.p
                variants={textReveal}
                className="font-mono text-[10px] tracking-widest uppercase border-b border-light-grey/10 pb-4"
              >
                Archive / {mockPiece.origin} / {mockPiece.year}
              </motion.p>
            </div>

            {/* Titre Sculptural */}
            <div className="overflow-hidden mb-12">
              <motion.h1
                variants={textReveal}
                className="font-title text-5xl lg:text-7xl italic text-white leading-[1.1]"
              >
                {mockPiece.title}
              </motion.h1>
            </div>

            {/* Histoire */}
            <div className="overflow-hidden mb-16">
              <motion.p
                variants={textReveal}
                className="text-sm leading-relaxed text-light-grey/80"
              >
                {mockPiece.history}
              </motion.p>
            </div>

            {/* SÉLECTEURS : Format & Allocation */}
            <div className="flex flex-col gap-8 mb-16">
              
              {/* Sélecteur de Format */}
              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex flex-col gap-4">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">
                    Format
                  </span>
                  <div className="flex gap-6">
                    {mockPiece.formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`font-mono text-[10px] tracking-widest uppercase pb-1 transition-colors duration-300 relative ${
                          selectedFormat === format ? "text-white" : "text-light-grey/40 hover:text-light-grey"
                        }`}
                      >
                        {format}
                        {selectedFormat === format && (
                          <motion.div 
                            layoutId="activeFormatLine"
                            className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                            transition={luxurySpring}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sélecteur d'Allocation */}
              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex flex-col gap-4">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">
                    Allocation
                  </span>
                  <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-white">
                    <button 
                      onClick={decreaseAllocation}
                      className={`pb-1 transition-colors ${allocation <= 1 ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
                      disabled={allocation <= 1}
                    >
                      -
                    </button>
                    <span className="w-4 text-center">{allocation}</span>
                    <button 
                      onClick={increaseAllocation}
                      className={`pb-1 transition-colors ${allocation >= mockPiece.maxAllocation ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
                      disabled={allocation >= mockPiece.maxAllocation}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Inventaire Technique */}
            <div className="flex flex-col gap-4 mb-16">
              {[
                { label: "Identification", value: mockPiece.id },
                { label: "Matière", value: mockPiece.material },
                { label: "Valeur", value: mockPiece.value },
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
                className="w-full relative py-6 flex items-center justify-between group overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-light-grey/10" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-light-grey/10" />

                <motion.div
                  className="absolute inset-0 bg-white z-0 origin-left"
                  initial={{ scaleX: 0 }}
                  variants={{
                    hover: { scaleX: 1, transition: luxurySpring },
                  }}
                />

                <span className="font-mono text-[10px] tracking-widest uppercase relative z-10 transition-colors duration-500 group-hover:text-dark text-white">
                  Initier l'Acquisition
                </span>

                <motion.div
                  className="relative z-10 flex items-center text-white group-hover:text-dark transition-colors duration-500"
                  variants={{
                    hover: { x: 10, transition: luxurySpring },
                  }}
                >
                  <span className="w-8 h-[1px] bg-current mr-2" />
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