"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationStore } from '@/store/useNotificationStore';
// --- 1. SCHÉMA DE VALIDATION ZOD ---
const loginSchema = z.object({
  email: z.string().email("Format d'email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
  address_secondary: z.string().optional(), // Honeypot
});

type LoginFormData = z.infer<typeof loginSchema>;

// --- 2. CHORÉGRAPHIE LUXE ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: LUXURY_EASE } 
  }
};

const shakeVariants = {
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.4 }
  }
};

// --- 3. COMPOSANT FORMULAIRE (Isolé pour utiliser useSearchParams proprement) ---
const LoginFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const showNotification = useNotificationStore((state) => state.showNotification);
  const [focusedField, setFocusedField] = useState<keyof LoginFormData | null>(null);
  const { register: registerUser, isAuthenticated, isLoading } = useUserStore();
  const login = useUserStore((state) => state.login);
  const storeError = useUserStore((state) => state.error);
  const clearError = useUserStore((state) => state.clearError);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Si le chargement initial de session est terminé ET que l'utilisateur est connecté
    if (!isLoading && isAuthenticated) {
      // Redirection immédiate et silencieuse vers l'archive
      router.push('/compte');
    }
  }, [isAuthenticated, isLoading, router]);

  // Optionnel : Éviter le "flash" de la page d'inscription pendant la vérification
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
         {/* Un loader minimaliste pour patienter le temps de la redirection */}
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
  if (data.address_secondary) return; // Honeypot trap
  
  try {
    await login(data.email, data.password);
    
    // 2. Déclenche le message de succès !
    showNotification("Connexion réussie. Bienvenue.");
    
    router.push('/compte'); 
  } catch (err) {
    console.error("Tentative d'accès échouée.");
  }
};

  return (
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
      
      {/* --- COLONNE GAUCHE --- */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <motion.span variants={itemVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
            Authentification
          </motion.span>
          <motion.h1 variants={itemVariants} className="font-title text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white">
            DE RETOUR ? <br />
            <span className="italic opacity-80 text-light-grey">CONNECTEZ-VOUS.</span>
          </motion.h1>
          <motion.div variants={itemVariants} className="pt-6 border-t border-light-grey/10">
            <Link href="/inscription" className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-500 hover:tracking-[0.4em]">
              [ Pas encore inscrit ? Inscrivez-vous ]
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* --- COLONNE DROITE : FORMULAIRE --- */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full lg:max-w-md ml-auto">
        
        {/* MESSAGE DE SUCCÈS D'INSCRIPTION */}
        <AnimatePresence>
          {isRegistered && (
            <motion.div 
              initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: LUXURY_EASE }}
              className="mb-12 border-l border-white/20 pl-4"
            >
              <p className="text-[10px] tracking-[0.4em] uppercase text-white">
                Archive créée avec succès. <br/>
                <span className="text-light-grey/60 mt-1 block">Veuillez vous connecter.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)}
          animate={(Object.keys(errors).length > 0 || storeError) ? "shake" : ""}
          variants={shakeVariants}
          className="flex flex-col gap-10"
        >
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input type="text" {...register("address_secondary")} tabIndex={-1} autoComplete="off" />
          </div>

          {/* Email */}
          <motion.div variants={itemVariants} className="relative flex flex-col group">
            <motion.label 
              animate={{ color: (focusedField === 'email' || emailValue) ? "#FFFFFF" : "rgba(195, 195, 195, 0.4)" }}
              className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
            >
              Email
            </motion.label>
            <div className="relative">
              <input 
                type="email" 
                {...register("email")}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/10 py-4 text-white focus:outline-none font-light transition-colors duration-500"
                placeholder="votre@email.com"
              />
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: focusedField === 'email' ? 1 : 0 }}
                transition={{ duration: 0.8, ease: LUXURY_EASE }}
                className="absolute bottom-0 left-0 w-full h-px bg-white origin-left"
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-6 text-red-400/80 text-[8px] tracking-widest uppercase">
                  {errors.email.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mot de passe */}
          <motion.div variants={itemVariants} className="relative flex flex-col group">
            <div className="flex justify-between items-center">
              <motion.label 
                animate={{ color: (focusedField === 'password' || passwordValue) ? "#FFFFFF" : "rgba(195, 195, 195, 0.4)" }}
                className="text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
              >
                Mot de passe
              </motion.label>
              <Link href="/mot-de-passe-oublie" className="text-[9px] uppercase tracking-widest text-light-grey/40 hover:text-white transition-colors duration-500">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input 
                type="password" 
                {...register("password")}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/10 py-4 text-white focus:outline-none font-light transition-colors duration-500"
              />
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                transition={{ duration: 0.8, ease: LUXURY_EASE }}
                className="absolute bottom-0 left-0 w-full h-px bg-white origin-left"
              />
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-6 text-red-400/80 text-[8px] tracking-widest uppercase">
                  {errors.password.message}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bouton & Erreur Serveur */}
          <motion.div variants={itemVariants} className="pt-8 flex flex-col gap-4">
            <button 
              disabled={isSubmitting}
              className="group relative inline-flex items-center gap-6 cursor-pointer w-max"
            >
              <span className="font-title text-2xl md:text-3xl tracking-widest text-white group-hover:italic transition-all duration-500">
                {isSubmitting ? 'VÉRIFICATION...' : 'SE CONNECTER'}
              </span>
              <motion.div 
                initial={{ width: "3rem" }}
                whileHover={{ width: "6rem" }}
                transition={{ ease: LUXURY_EASE, duration: 0.8 }}
                className="h-px bg-white" 
              />
            </button>

            <AnimatePresence>
              {storeError && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="text-red-400/80 text-[10px] uppercase tracking-widest mt-2"
                >
                  {storeError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

// --- 4. COMPOSANT PAGE PRINCIPAL (Wrap avec Suspense) ---
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-light-grey selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
      {/* On wrap le contenu qui utilise useSearchParams dans un Suspense */}
      <Suspense fallback={<div className="text-[10px] tracking-widest text-white/50 uppercase">Chargement de l'archive...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
};

export default LoginPage;