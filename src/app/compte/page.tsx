"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1, ease: LUXURY_EASE } 
  },
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.4 } }
};

type TabType = 'aperçu' | 'commandes' | 'retours' | 'adresses' | 'paramètres';
const TABS: TabType[] = ['aperçu', 'commandes', 'retours', 'adresses', 'paramètres'];

export default function AccountDashboard() {
  const router = useRouter();
  
  // --- CONNEXION AU VRAI BACKEND (ZUSTAND + MEDUSA) ---
  const { customer, isAuthenticated, isLoading, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('aperçu');

  // Sécurité : Redirection immédiate si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirection vers l'accueil après déconnexion
  };

  // Écran de chargement expérientiel (Skeleton Luxe)
  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.span 
          animate={{ opacity: [0.3, 1, 0.3] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-[10px] tracking-[0.5em] text-white uppercase"
        >
          Chargement du compte...
        </motion.span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-20">
        
        {/* --- HEADER COMPTE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex flex-col gap-6">
            <motion.span variants={itemVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
              Espace Client
            </motion.span>
            <h1 className="font-title text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white flex flex-col">
              <span className="overflow-hidden pb-2">
                <motion.span variants={itemVariants} className="block">COMPTE DE</motion.span>
              </span>
              <span className="overflow-hidden pb-4">
                <motion.span variants={itemVariants} className="block italic opacity-80 text-light-grey">
                  {customer.first_name.toUpperCase()}.
                </motion.span>
              </span>
            </h1>
          </div>

          <motion.div variants={itemVariants}>
            <button onClick={handleLogout} className="group relative flex items-center gap-4 cursor-pointer">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-colors duration-500">
                [ Se déconnecter ]
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* --- NAVIGATION SCROLLABLE --- */}
        <motion.nav variants={containerVariants} initial="hidden" animate="visible" className="flex gap-10 border-b border-light-grey/10 pb-4 relative overflow-x-auto no-scrollbar whitespace-nowrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative text-[10px] tracking-[0.4em] uppercase pb-2 transition-colors duration-500 ${
                activeTab === tab ? 'text-white' : 'text-light-grey/40 hover:text-light-grey/80'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 -bottom-[17px] w-full h-px bg-white"
                  transition={{ type: "spring", stiffness: 100, damping: 20, mass: 10 }}
                />
              )}
            </button>
          ))}
        </motion.nav>

        {/* --- CONTENU DYNAMIQUE --- */}
        <div className="min-h-[50vh] relative">
          <AnimatePresence mode="wait">
            
            {/* 1. VUE D'ENSEMBLE */}
            {activeTab === 'aperçu' && (
              <motion.div key="apercu" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-16 pt-4">
                <motion.p variants={itemVariants} className="text-light-grey/80 text-sm font-light italic max-w-xl leading-relaxed">
                  Bonjour {customer.first_name}. Voici le résumé de vos commandes récentes et de vos informations personnelles.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <motion.div variants={itemVariants} className="border-b border-light-grey/10 pb-8 flex flex-col justify-between">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Dernière commande</span>
                    <div className="mt-8">
                      {/* Note : Ces données seront à dynamiser plus tard avec les commandes Medusa */}
                      <p className="text-2xl font-light text-white">N° ORA-0892</p>
                      <p className="text-[10px] text-light-grey/60 mt-2">Maillot Milan AC 93/94</p>
                      <div className="w-full h-px bg-light-grey/10 mt-6 relative overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "66%" }} transition={{ duration: 1.5, ease: LUXURY_EASE, delay: 0.5 }} className="absolute top-0 left-0 h-full bg-white" />
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[9px] uppercase tracking-widest text-white">En cours de livraison</span>
                        <button className="text-[9px] uppercase tracking-[0.2em] text-light-grey/40 hover:text-white transition-colors">[ Suivre le colis ]</button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="border-b border-light-grey/10 pb-8 flex flex-col justify-between">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Programme de fidélité</span>
                    <div className="mt-8">
                      <p className="font-title text-4xl italic text-white">Membre.</p>
                      <p className="text-[10px] text-light-grey/60 mt-4 tracking-widest uppercase">Solde de points : 0</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* 2. HISTORIQUE DES COMMANDES */}
            {activeTab === 'commandes' && (
              <motion.div key="commandes" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-0 pt-4">
                <div className="hidden md:flex justify-between pb-4 border-b border-light-grey/20">
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 w-1/3">Commande</span>
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 w-1/4 text-center">Statut</span>
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 w-1/4 text-right">Actions</span>
                </div>
                
                {/* Mocks de commandes en attendant de lier l'API Medusa des commandes */}
                <OrderRow id="ORA-0892" date="12.05.2026" item="Milan AC 93/94 - L" price="180€" status="Expédiée" />
                <OrderRow id="ORA-0714" date="04.02.2026" item="Arsenal 05/06 - XL" price="210€" status="Livrée" />
                <OrderRow id="ORA-0341" date="18.11.2025" item="Juventus 97/98 - M" price="150€" status="Livrée" />
              </motion.div>
            )}

            {/* 3. RETOURS & SAV */}
            {activeTab === 'retours' && (
              <motion.div key="retours" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-10 pt-4">
                <motion.p variants={itemVariants} className="text-light-grey/60 text-sm font-light italic leading-relaxed max-w-xl">
                  Les articles doivent vous correspondre parfaitement. Effectuez une demande de retour si un produit ne répond pas à vos attentes.
                </motion.p>
                <motion.div variants={itemVariants}>
                  <button className="group relative inline-flex items-center gap-6 cursor-pointer mt-4">
                    <span className="font-title text-xl tracking-widest text-white group-hover:italic transition-all duration-500">
                      FAIRE UN RETOUR
                    </span>
                    <div className="w-12 h-px bg-white group-hover:w-24 transition-all duration-500 ease-out" />
                  </button>
                </motion.div>
                
                <div className="mt-12">
                   <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 block mb-6">Retours en cours</span>
                   <div className="py-6 border-b border-light-grey/10 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-white">RMA-0714</p>
                        <p className="text-[10px] text-light-grey/60 mt-2">Lié à la commande ORA-0714</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest text-white">En cours de traitement</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* 4. ADRESSES ET PAIEMENTS */}
            {activeTab === 'adresses' && (
              <motion.div key="adresses" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-4">
                
                {/* Adresses */}
                <div className="flex flex-col gap-8">
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Adresse de livraison (Défaut)</span>
                  <motion.div variants={itemVariants} className="border border-light-grey/10 p-8 flex flex-col gap-4 group hover:border-light-grey/30 transition-colors duration-500">
                    <p className="text-white text-sm uppercase tracking-widest">{customer.first_name} {customer.last_name}</p>
                    <p className="text-light-grey/60 font-light text-sm">
                      124 Rue du Faubourg Saint-Honoré<br/>
                      75008 Paris<br/>
                      France
                    </p>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-light-grey/10">
                      <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Modifier</button>
                      <button className="text-[9px] uppercase tracking-[0.2em] text-red-400/40 hover:text-red-400 transition-colors">Supprimer</button>
                    </div>
                  </motion.div>
                  <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors w-max">[ + Ajouter une adresse ]</button>
                </div>

                {/* Paiements */}
                <div className="flex flex-col gap-8">
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Moyens de paiement</span>
                  <motion.div variants={itemVariants} className="border border-light-grey/10 p-8 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm uppercase tracking-widest">VISA</p>
                      <span className="text-[10px] text-light-grey/40">Expire 10/28</span>
                    </div>
                    <p className="text-light-grey/60 font-mono text-sm tracking-[0.2em]">**** **** **** 4242</p>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-light-grey/10">
                      <button className="text-[9px] uppercase tracking-[0.2em] text-red-400/40 hover:text-red-400 transition-colors">Supprimer</button>
                    </div>
                  </motion.div>
                </div>

              </motion.div>
            )}

            {/* 5. RÉGLAGES */}
            {activeTab === 'paramètres' && (
              <motion.div key="parametres" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-20 pt-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  {/* Informations Personnelles */}
                  <div className="flex flex-col gap-0">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 mb-6">Informations personnelles</span>
                    <InfoRow label="Prénom" value={customer.first_name} editable />
                    <InfoRow label="Nom" value={customer.last_name} editable />
                    <InfoRow label="Email" value={customer.email} editable />
                    <InfoRow label="Téléphone" value={customer.phone || "Non renseigné"} editable />
                  </div>

                  {/* Préférences & Sécurité */}
                  <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                       <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Newsletter</span>
                       <label className="flex items-center gap-4 cursor-pointer group">
                         <div className="w-4 h-4 border border-light-grey/20 flex items-center justify-center group-hover:border-white transition-colors">
                            <div className="w-2 h-2 bg-white" />
                         </div>
                         <span className="text-[10px] uppercase tracking-widest text-light-grey/80">S'abonner à la newsletter ORA TRIP</span>
                       </label>
                    </div>

                    <div className="flex flex-col gap-6 pt-10 border-t border-light-grey/10">
                       <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Sécurité</span>
                       <button className="text-[10px] tracking-[0.4em] uppercase text-white/60 hover:text-white flex items-center gap-4 w-max transition-colors duration-500">
                        <span className="w-4 h-px bg-white/40" />
                        Modifier le mot de passe
                      </button>
                      <button className="text-[10px] tracking-[0.4em] uppercase text-white/60 hover:text-white flex items-center gap-4 w-max transition-colors duration-500">
                        <span className="w-4 h-px bg-white/40" />
                        Activer la double authentification (2FA)
                      </button>
                    </div>

                    {/* Zone de Danger */}
                    <div className="pt-20">
                      <HoldToDeleteButton />
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- MICRO-COMPOSANTS ---

const InfoRow = ({ label, value, editable = false }: { label: string, value: string, editable?: boolean }) => (
  <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-light-grey/10 group hover:border-light-grey/30 transition-colors duration-500">
    <div className="flex flex-col gap-2">
      <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 group-hover:text-light-grey/60 transition-colors duration-500">
        {label}
      </span>
      <span className="text-lg font-light text-white">
        {value}
      </span>
    </div>
    {editable && (
      <button className="text-[9px] uppercase tracking-[0.2em] text-white/20 group-hover:text-white/80 transition-colors mt-4 md:mt-0">
        [ Modifier ]
      </button>
    )}
  </motion.div>
);

const OrderRow = ({ id, date, item, price, status }: { id: string, date: string, item: string, price: string, status: string }) => (
  <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between md:items-center py-8 border-b border-light-grey/10 group hover:border-light-grey/30 transition-colors duration-500 gap-6 md:gap-0">
    <div className="w-full md:w-1/3 flex flex-col gap-2">
      <p className="text-lg text-white">{id}</p>
      <p className="text-[10px] text-light-grey/60 uppercase tracking-widest">{item}</p>
    </div>
    <div className="w-full md:w-1/4 flex flex-col md:items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white">{status}</span>
      <span className="text-[9px] text-light-grey/40">{date}</span>
    </div>
    <div className="w-full md:w-1/4 flex flex-col md:items-end gap-3">
      <span className="text-sm text-white">{price}</span>
      <div className="flex gap-4">
        <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Facture</button>
        <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Commander à nouveau</button>
      </div>
    </div>
  </motion.div>
);

const HoldToDeleteButton = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            console.log("Compte supprimé.");
            // Ajouter ici la logique réelle de suppression de compte
            return 100;
          }
          return prev + 2; 
        });
      }, 30);
    } else {
      setProgress(0); 
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  return (
    <div 
      className="relative w-max cursor-pointer group mt-10"
      onPointerDown={() => setIsHolding(true)}
      onPointerUp={() => setIsHolding(false)}
      onPointerLeave={() => setIsHolding(false)}
      // Support tactile mobile
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
    >
      <span className={`text-[10px] tracking-[0.4em] uppercase transition-colors duration-500 select-none ${isHolding ? 'text-red-400' : 'text-red-400/40 group-hover:text-red-400/80'}`}>
        {progress === 100 ? "COMPTE SUPPRIMÉ." : "Maintenir pour supprimer le compte"}
      </span>
      
      <div className="absolute -bottom-3 left-0 w-full h-px bg-red-400/10 overflow-hidden">
        <motion.div 
          className="h-full bg-red-400"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.05 }}
        />
      </div>
    </div>
  );
};