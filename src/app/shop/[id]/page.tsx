"use client";

import { useRef, useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { motion, useScroll, useTransform, Variants, Transition, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore"; // Import du store panier
import { useUIStore } from "@/store/useUIStore";
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
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useUIStore((state) => state.openCart);

  const resolvedParams = use(params);
  const pieceId = resolvedParams.id;

  const getProductById = useProductStore((state) => state.getProductById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const isLoading = useProductStore((state) => state.isLoading);

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
  const imageBrightness = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

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
    if (!piece || !selectedFormat) return;

    // Création d'un ID unique pour cette combinaison produit + taille
    const cartItemId = `${piece.id}_${selectedFormat.name}`;

    // On prépare l'objet pour le store
    // Note : On parse la valeur (ex: "120€") en nombre si nécessaire. 
    // Ici, j'utilise une conversion simple pour l'exemple.
    const priceAsNumber = typeof piece.value === "string"
      ? parseFloat(piece.value.replace(/[^0-9.]/g, ""))
      : piece.value;

    addToCart({
      id: cartItemId,
      productId: piece.id,
      title: piece.title,
      format: selectedFormat.name,
      price: priceAsNumber,
      quantity: allocation,
      maxStock: selectedFormat.stock,
      imagePath: piece.imagePath,
    });

    // UX : Ouvrir le panier immédiatement pour montrer que l'ajout a réussi
    openCart();
  };

  return (
    <main
      ref={containerRef}
      className="relative w-full bg-dark text-light-grey selection:bg-white selection:text-dark min-h-screen"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-12 max-w-480 mx-auto relative">

        {/* COLONNE GAUCHE : L'ŒUVRE (Sticky sur Mobile et Desktop) */}
        <div className="lg:col-span-6 h-[70vh] lg:h-screen sticky top-0 overflow-hidden bg-dark flex items-center justify-center p-8 lg:p-24 z-0">
          <motion.div
            className="w-full max-w-[400px] lg:max-w-125 aspect-4/5 flex items-center justify-center overflow-hidden"
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

        {/* COLONNE DROITE : L'ÉDITORIAL (Passe par-dessus l'image sur mobile grâce au z-10 et bg-dark) */}
        <div className="lg:col-span-6 px-6 py-16 lg:py-32 lg:px-24 flex flex-col justify-center min-h-screen bg-dark lg:bg-transparent z-10 relative">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className="max-w-lg mx-auto lg:mx-0 w-full"
          >

            {/* Fil d'Ariane */}
            <div className="overflow-hidden mb-8">
              <motion.p variants={textReveal} className="font-mono text-[10px] tracking-widest uppercase border-b border-light-grey/10 pb-4 text-light-grey/60">
                ORA TRIP / Maillot / {piece.title}
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
            <div className="flex flex-col gap-10 mb-16">

              {/* Sélecteur de Format avec animation de ligne de luxe */}
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
                          <motion.div
                            layoutId="activeFormatIndicator"
                            className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                            transition={luxurySpring}
                          />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Sélecteur d'Allocation (Quantité) avec effet barillet */}
              <div className="overflow-hidden">
                <motion.div variants={textReveal} className="flex flex-col gap-4">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-light-grey/60">
                    Quantite
                  </span>
                  <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-white">
                    <button
                      onClick={decreaseAllocation}
                      disabled={allocation <= 1}
                      className={`pb-1 transition-colors ${allocation <= 1 ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
                    >
                      −
                    </button>

                    {/* Chiffre animé */}
                    <div className="w-4 h-4 overflow-hidden relative flex items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={allocation}
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -15, opacity: 0 }}
                          transition={luxurySpring}
                          className="absolute"
                        >
                          {allocation}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={increaseAllocation}
                      disabled={!selectedFormat || allocation >= selectedFormat.stock}
                      className={`pb-1 transition-colors ${!selectedFormat || allocation >= selectedFormat.stock ? "text-light-grey/20 cursor-not-allowed" : "text-light-grey/60 hover:text-white"}`}
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
                { label: "Identification", value: piece.id },
                { label: "Matière", value: piece.material },
                { label: "Prix", value: piece.value },
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
                  {piece.maxAllocation === 0 ? "Sold out" : "Ajouter au Panier"}
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