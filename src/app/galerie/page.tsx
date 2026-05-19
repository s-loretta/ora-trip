"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore'; // ⚡️ AJOUT DE L'AUTHENTIFICATION
import { sdk } from '@/lib/sdk';

// --- CHORÉGRAPHIE ORA TRIP ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ARCHIVES = [
  { id: '01', title: 'PROTOTYPE_A', colSpan: 'md:col-span-5', aspect: 'aspect-[3/4]', mt: 'md:mt-0', src: '/galerie/01.JPG' },
  { id: '02', title: 'DÉTAIL_COUTURE', colSpan: 'md:col-span-4', aspect: 'aspect-square', mt: 'md:mt-32', src: '/galerie/02.jpg' },
  { id: '03', title: 'VISION_NOCTURNE', colSpan: 'md:col-span-3', aspect: 'aspect-[2/3]', mt: 'md:mt-12', src: '/galerie/03.JPG' },
  { id: '04', title: 'ÉCUSSON_1998', colSpan: 'md:col-span-7', aspect: 'aspect-[16/9]', mt: 'md:mt-24', src: '/galerie/04.JPG' },
  { id: '05', title: 'MAILLOT_EXCURSION', colSpan: 'md:col-span-5', aspect: 'aspect-[3/4]', mt: 'md:mt-0', src: '/galerie/05.png' },
  { id: '06', title: 'FIBRE_CARBONE', colSpan: 'md:col-span-4', aspect: 'aspect-square', mt: 'md:mt-40', src: '/galerie/06.JPG' },
  { id: '07', title: 'ARCHIVE_CACHÉE', colSpan: 'md:col-span-3', aspect: 'aspect-[4/5]', mt: 'md:mt-10', src: '/galerie/07.JPG' },
  { id: '08', title: 'TISSU_TECHNIQUE', colSpan: 'md:col-span-6', aspect: 'aspect-video', mt: 'md:mt-32', src: '/galerie/08.JPG' },
  { id: '09', title: 'LIGNE_DE_TOUCHE', colSpan: 'md:col-span-3', aspect: 'aspect-square', mt: 'md:mt-0', src: '/galerie/09.JPG' },
  { id: '10', title: 'NUMÉRO_DIX', colSpan: 'md:col-span-4', aspect: 'aspect-[3/4]', mt: 'md:mt-20', src: '/galerie/10.JPG' },
  { id: '11', title: 'VESTIAIRE_VISITEUR', colSpan: 'md:col-span-8', aspect: 'aspect-[21/9]', mt: 'md:mt-40', src: '/galerie/11.JPG' },
  { id: '12', title: 'COULEURS_PRIMAIRES', colSpan: 'md:col-span-4', aspect: 'aspect-[3/4]', mt: 'md:mt-12', src: '/galerie/12.JPG' },
  { id: '13', title: 'SAISON_95', colSpan: 'md:col-span-5', aspect: 'aspect-square', mt: 'md:mt-32', src: '/galerie/13.JPG' },
  { id: '14', title: 'FINALE_NATIONALE', colSpan: 'md:col-span-7', aspect: 'aspect-[16/9]', mt: 'md:mt-24', src: '/galerie/16.JPG' },
  { id: '15', title: 'HÉRITAGE_ORA', colSpan: 'md:col-span-5', aspect: 'aspect-[4/5]', mt: 'md:mt-0', src: '/galerie/15.JPG' },
];

export default function GaleriePage() {
  const router = useRouter();
  const { isAuthenticated, customer } = useUserStore(); // ⚡️ RÉCUPÉRATION DU CLIENT

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // États vides au départ, ils seront remplis par la base de données
 const [globalLikes, setGlobalLikes] = useState<Record<string, number>>({});
  const [userLikedIds, setUserLikedIds] = useState<Set<string>>(new Set());

  // ⚡️ CHARGEMENT DES LIKES DEPUIS L'API AU DÉMARRAGE
 useEffect(() => {
    const fetchLikes = async () => {
      try {
        const queryParams = customer?.id ? `?customerId=${customer.id}` : '';
        // Utilisation du SDK Medusa !
        const data = (await sdk.client.fetch(`/store/gallery-likes${queryParams}`, { method: "GET" })) as {
  globalLikes: Record<string, number>;
  userLikedIds: string[];
};
      } catch (error) {
        console.error("Erreur de récupération des likes:", error);
      }
    };

    fetchLikes();
  }, [customer?.id]);

  // ⚡️ FONCTION DE LIKE (RÉELLE)
 const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (!isAuthenticated || !customer?.id) {
      if (confirm("L'archive est réservée aux membres. Voulez-vous vous connecter ?")) {
        router.push('/connexion?redirect=/galerie');
      }
      return;
    }

    const isLiking = !userLikedIds.has(id);

    // Mise à jour optimiste de l'UI
    setUserLikedIds(prev => {
      const newSet = new Set(prev);
      isLiking ? newSet.add(id) : newSet.delete(id);
      return newSet;
    });
    
    setGlobalLikes(prev => ({ 
      ...prev, 
      [id]: (prev[id] || 0) + (isLiking ? 1 : -1) 
    }));

    try {
      // Envoi au backend Medusa
      await sdk.client.fetch('/store/gallery-likes', {
        method: 'POST',
        body: {
          imageId: id,
          customerId: customer.id,
          action: isLiking ? 'like' : 'unlike'
        }
      });

    } catch (error) {
      console.error("Rollback des likes suite à une erreur :", error);
      setUserLikedIds(prev => {
        const newSet = new Set(prev);
        !isLiking ? newSet.add(id) : newSet.delete(id);
        return newSet;
      });
      setGlobalLikes(prev => ({ 
        ...prev, 
        [id]: (prev[id] || 0) + (!isLiking ? 1 : -1) 
      }));
    }
  };

  return (
    <main className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-12 pt-40 pb-32 font-mono">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col mb-24 gap-4">
        <h1 className="font-title text-5xl md:text-7xl italic text-white leading-none">
          La Galerie
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-light-grey/40">
          L'univers d'ORA TRIP à travers un argentique.
        </p>
      </div>

      {/* --- GRILLE ASYMÉTRIQUE --- */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-20">
        <AnimatePresence>
          {ARCHIVES.map((item) => {
            const isHovered = hoveredId === item.id;
            const hasLiked = userLikedIds.has(item.id);
            const isDimmed = hoveredId !== null && hoveredId !== item.id;
            const currentLikes = globalLikes[item.id] || 0; // Sécurité si 0

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: isDimmed ? 0.3 : 1, 
                  y: 0,
                  filter: isDimmed ? "blur(4px)" : "blur(0px)",
                  scale: isHovered ? 1.02 : 1
                }}
                transition={{ duration: 0.8, ease: LUXURY_EASE }}
                key={item.id}
                className={`${item.colSpan} ${item.mt} flex flex-col gap-4 relative group cursor-crosshair`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                
                {/* ZONE IMAGE AVEC NEXT/IMAGE */}
                <div className={`w-full ${item.aspect} bg-[#111] border border-white/5 relative overflow-hidden flex items-center justify-center transition-colors duration-700 ${isHovered ? 'border-white/20' : ''}`}>
                  <Image 
                    src={item.src} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-1000 ${isHovered ? 'scale-105 opacity-100' : 'opacity-80 grayscale-[20%]'}`}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />

                  <AnimatePresence>
                    {hasLiked && (
                      <motion.div 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white pointer-events-none z-20"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* SOUS L'IMAGE : NUMÉRO ET COMPTEUR DE LIKES */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-white/40">
                    N° {item.id}
                  </span>
                  
                  {/* Bouton Like Public */}
                  <button 
                    onClick={(e) => handleLike(item.id, e)}
                    className="flex items-center gap-3 transition-all duration-500 group/btn hover:text-white/60"
                  >
                    <span className="text-[9px] tracking-[0.3em] uppercase">
                      [ {currentLikes} ]
                    </span>
                    
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {hasLiked ? (
                          <motion.div
                            key="liker-icon"
                            initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                            animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="absolute inset-0 w-full h-full"
                          >
                            <Image src="/liker.png" alt="Archivé" fill sizes="24px" className="object-contain" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unliked-icon"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 w-full h-full mix-blend-screen opacity-50 group-hover/btn:opacity-100 transition-opacity"
                          >
                            <Image src="/like.png" alt="Sauvegarder" fill sizes="24px" className="object-contain" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}