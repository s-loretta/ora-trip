"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
  address_secondary?: string;
}

const LoginPage = () => {
  const [focusedField, setFocusedField] = useState<keyof LoginFormData | null>(null);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>();

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onSubmit = async (data: LoginFormData) => {
    if (data.address_secondary) return;
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Tentative d'accès ORA TRIP :", data);
  };

  // --- VARIANTS D'ANIMATION ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } 
    }
  };

  // Variant de secousse (Shake)
  const shakeVariants = {
    shake: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-light-grey selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
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
            <div className="pt-6 border-t border-light-grey/10">
              <Link href="/inscription" className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors">
                [ Pas encore inscrit ? Inscrivez-vous ]
              </Link>
            </div>
          </div>
          {/* ... reste de la colonne gauche ... */}
        </motion.div>

        {/* --- COLONNE DROITE : FORMULAIRE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full lg:max-w-md ml-auto">
          {/* On applique l'animation de shake ici si des erreurs existent */}
          <motion.form 
            onSubmit={handleSubmit(onSubmit)}
            animate={Object.keys(errors).length > 0 ? "shake" : ""}
            variants={shakeVariants}
            className="flex flex-col gap-10"
          >
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" {...register("address_secondary")} tabIndex={-1} autoComplete="off" />
            </div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative flex flex-col">
              <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 
                ${focusedField === 'email' || emailValue ? 'text-white' : 'text-light-grey/40'}`}>
                Email
              </label>
              <input 
                type="email" 
                {...register("email", { required: "Identifiant requis." })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white focus:outline-none focus:border-white transition-colors duration-500"
                placeholder="votre@email.com"
              />
            </motion.div>

            {/* Mot de passe */}
            <motion.div variants={itemVariants} className="relative flex flex-col">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 
                  ${focusedField === 'password' || passwordValue ? 'text-white' : 'text-light-grey/40'}`}>
                  Mot de passe
                </label>
                <Link 
                  href="/mot-de-passe-oublie" 
                  className="text-[9px] uppercase tracking-widest text-light-grey/20 hover:text-white/60 transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <input 
                type="password" 
                {...register("password", { required: "Mot de passe requis." })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white focus:outline-none focus:border-white transition-colors duration-500"
              />
            </motion.div>

            {/* Bouton de Connexion */}
            <motion.div variants={itemVariants} className="pt-6">
              <button 
                disabled={isSubmitting}
                className={`group relative inline-flex items-center gap-4 ${isSubmitting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              >
                <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-300">
                  {isSubmitting ? 'VÉRIFICATION...' : 'SE CONNECTER'}
                </span>
                {!isSubmitting && <div className="w-12 h-px bg-white group-hover:w-24 transition-all duration-500 ease-out" />}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;