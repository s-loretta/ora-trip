"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
// ✅ NOUVEAU : On utilise le SDK officiel (v2)
import { sdk } from '@/lib/sdk'; 

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

// --- UTILITAIRES DE FORMATAGE ---
const formatPrice = (amount: number, currencyCode: string = 'eur') => {
  if (!amount) return "0,00 €";
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100); 
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateString));
};

const translateStatus = (status: string, fulfillment: string) => {
  if (status === 'canceled') return 'Annulée';
  if (fulfillment === 'shipped' || fulfillment === 'fulfilled') return 'Expédiée';
  if (fulfillment === 'partially_fulfilled') return 'Partiellement expédiée';
  if (status === 'captured') return 'Préparation en cours';
  return 'En attente de validation';
};

export default function AccountDashboard() {
  const router = useRouter();
  
  const { customer, isAuthenticated, isLoading, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('aperçu');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Sécurité et Récupération des données via SDK v2
useEffect(() => {
    // 1. Redirection si l'utilisateur n'est pas connecté
    if (!isLoading && !isAuthenticated) {
      router.push('/connexion');
      return;
    }

    // 2. On empêche le re-fetch inutile causé par la déconnexion
    if (isAuthenticated && isFetchingData) {
      const fetchCustomerData = async () => {
        try {
          const { orders: medusaOrders } = await sdk.store.order.list();
          setOrders(medusaOrders || []);
        } catch (error: any) {
          // ⚠️ CRUCIAL : On utilise console.warn et on filtre l'erreur 401 
          // pour que Next.js Turbopack ne déclenche plus l'écran rouge
          if (error?.status !== 401 && error?.message !== 'Unauthorized') {
            console.warn("Information : Impossible de récupérer les commandes.", error.message);
          }
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchCustomerData();
    }
  }, [isLoading, isAuthenticated, router, isFetchingData]);

  const handleLogout = async () => {
    await logout();
    router.push('/'); 
  };

  if (isLoading || isFetchingData || !customer) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.span 
          animate={{ opacity: [0.3, 1, 0.3] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-[10px] tracking-[0.5em] text-white uppercase"
        >
          Synchronisation de l'archive...
        </motion.span>
      </div>
    );
  }

  const lastOrder = orders.length > 0 ? orders[0] : null;

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
                  {customer.first_name?.toUpperCase() || "MEMBRE"}.
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
                      {lastOrder ? (
                        <>
                          <p className="text-2xl font-light text-white">N° ORA-{lastOrder.display_id}</p>
                          <p className="text-[10px] text-light-grey/60 mt-2">
                            {lastOrder.items?.length || 0} {(lastOrder.items?.length || 0) > 1 ? 'pièces' : 'pièce'} - {formatPrice(lastOrder.total, lastOrder.currency_code)}
                          </p>
                          <div className="w-full h-px bg-light-grey/10 mt-6 relative overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "66%" }} transition={{ duration: 1.5, ease: LUXURY_EASE, delay: 0.5 }} className="absolute top-0 left-0 h-full bg-white" />
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-[9px] uppercase tracking-widest text-white">
                              {translateStatus(lastOrder.status, lastOrder.fulfillment_status)}
                            </span>
                            <button className="text-[9px] uppercase tracking-[0.2em] text-light-grey/40 hover:text-white transition-colors">[ Voir détails ]</button>
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] text-light-grey/60 mt-2 uppercase tracking-widest">Aucune acquisition récente.</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="border-b border-light-grey/10 pb-8 flex flex-col justify-between">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Programme de fidélité</span>
                    <div className="mt-8">
                      <p className="font-title text-4xl italic text-white">Membre.</p>
                      <p className="text-[10px] text-light-grey/60 mt-4 tracking-widest uppercase">L'archive privée vous est ouverte.</p>
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
                
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderRow 
                      key={order.id}
                      id={`ORA-${order.display_id}`} 
                      date={formatDate(order.created_at)} 
                      item={`${order.items?.length || 0} {(order.items?.length || 0) > 1 ? 'pièces' : 'pièce'}`} 
                      price={formatPrice(order.total, order.currency_code)} 
                      status={translateStatus(order.status, order.fulfillment_status)} 
                    />
                  ))
                ) : (
                  <motion.p variants={itemVariants} className="text-[10px] text-light-grey/60 uppercase tracking-widest mt-10">
                    Votre archive personnelle est vide.
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* 3. RETOURS */}
            {activeTab === 'retours' && (
              <motion.div key="retours" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-10 pt-4">
                <motion.p variants={itemVariants} className="text-light-grey/60 text-sm font-light italic leading-relaxed max-w-xl">
                  Les articles doivent vous correspondre parfaitement. Contactez notre conciergerie pour initier un retour ou un échange.
                </motion.p>
                <motion.div variants={itemVariants}>
                  <a href="mailto:contact@oratrip.com" className="group relative inline-flex items-center gap-6 cursor-pointer mt-4">
                    <span className="font-title text-xl tracking-widest text-white group-hover:italic transition-all duration-500">
                      CONTACTER LE VESTIAIRE
                    </span>
                    <div className="w-12 h-px bg-white group-hover:w-24 transition-all duration-500 ease-out" />
                  </a>
                </motion.div>
              </motion.div>
            )}

            {/* 4. ADRESSES */}
            {activeTab === 'adresses' && (
              <motion.div key="adresses" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-4">
                
                <div className="flex flex-col gap-8">
                  <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40">Vos carnets d'adresses</span>
                  
                  {/* Validation sécurisée du type des adresses pour Medusa V2 */}
                  {((customer as any).addresses?.length > 0) ? (
                    (customer as any).addresses.map((address: any) => (
                      <motion.div key={address.id} variants={itemVariants} className="border border-light-grey/10 p-8 flex flex-col gap-4 group hover:border-light-grey/30 transition-colors duration-500">
                        <p className="text-white text-sm uppercase tracking-widest">{address.first_name} {address.last_name}</p>
                        <p className="text-light-grey/60 font-light text-sm">
                          {address.address_1}<br/>
                          {address.address_2 && <>{address.address_2}<br/></>}
                          {address.postal_code} {address.city}<br/>
                          {address.country_code?.toUpperCase()}
                        </p>
                        <div className="flex gap-6 mt-4 pt-4 border-t border-light-grey/10">
                          <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Modifier</button>
                          <button className="text-[9px] uppercase tracking-[0.2em] text-red-400/40 hover:text-red-400 transition-colors">Supprimer</button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                     <p className="text-[10px] text-light-grey/60 uppercase tracking-widest mt-2">Aucune adresse enregistrée.</p>
                  )}
                  <button className="text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors w-max">[ + Ajouter une adresse ]</button>
                </div>

              </motion.div>
            )}

            {/* 5. RÉGLAGES */}
            {activeTab === 'paramètres' && (
              <motion.div key="parametres" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-20 pt-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="flex flex-col gap-0">
                    <span className="text-[9px] tracking-[0.4em] uppercase text-light-grey/40 mb-6">Informations personnelles</span>
                    <InfoRow label="Prénom" value={customer.first_name || ""} editable />
                    <InfoRow label="Nom" value={customer.last_name || ""} editable />
                    <InfoRow label="Email" value={customer.email || ""} editable />
                    <InfoRow label="Téléphone" value={customer.phone || "Non renseigné"} editable />
                  </div>

                  <div className="flex flex-col gap-10">
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