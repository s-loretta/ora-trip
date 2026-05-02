"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

// 1. Définition des types
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address_secondary?: string; // Honeypot
}

const RegisterPage = () => {
  const [focusedField, setFocusedField] = useState<keyof RegisterFormData | null>(null);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    if (data.address_secondary) return;
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Nouvelle archive ORA TRIP :", data);
    // Ici l'intégration future avec MedusaJS
  };

  // --- ANIMATIONS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } 
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-light-grey selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
        
        {/* --- COLONNE GAUCHE : MANIFESTE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <motion.span variants={itemVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
              Membre
            </motion.span>
            <motion.h1 variants={itemVariants} className="font-title text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white">
              CREER VOTRE <br />
              <span className="italic opacity-80 text-light-grey">COMPTE.</span>
            </motion.h1>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col gap-8 text-sm max-w-sm">
            <p className="text-light-grey/80 leading-relaxed italic font-light">
              En rejoignant ORA TRIP, vous accédez à l'histoire derrière chaque maillots. Gérez vos commande, suivez l'aventure ORA et participez à la culture.
            </p>
            <div className="pt-6 border-t border-light-grey/10">
              <Link href="/connexion" className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors">
                [ Déjà inscrit ? Se connecter ]
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* --- COLONNE DROITE : FORMULAIRE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <motion.form 
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" {...register("address_secondary")} tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Prénom */}
              <motion.div variants={itemVariants} className="relative flex flex-col">
                <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'firstName' ? 'text-white' : 'text-light-grey/40'}`}>
                  Prénom
                </label>
                <input 
                  type="text" 
                  {...register("firstName", { required: "Requis." })}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b border-light-grey/20 py-3 text-white focus:outline-none focus:border-white transition-colors duration-500"
                />
              </motion.div>

              {/* Nom */}
              <motion.div variants={itemVariants} className="relative flex flex-col">
                <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'lastName' ? 'text-white' : 'text-light-grey/40'}`}>
                  Nom
                </label>
                <input 
                  type="text" 
                  {...register("lastName", { required: "Requis." })}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b border-light-grey/20 py-3 text-white focus:outline-none focus:border-white transition-colors duration-500"
                />
              </motion.div>
            </div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative flex flex-col">
              <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-light-grey/40'}`}>
                Email de correspondance
              </label>
              <input 
                type="email" 
                {...register("email", { 
                  required: "Email requis.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format invalide." }
                })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/20 py-3 text-white focus:outline-none focus:border-white transition-colors duration-500"
                placeholder="votre@email.com"
              />
              {errors.email && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase">{errors.email.message}</span>}
            </motion.div>

            {/* Mot de passe */}
            <motion.div variants={itemVariants} className="relative flex flex-col">
              <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-light-grey/40'}`}>
                Mot de passe
              </label>
              <input 
                type="password" 
                {...register("password", { 
                  required: "Sécurisez votre accès.",
                  minLength: { value: 8, message: "8 caractères minimum." }
                })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/20 py-3 text-white focus:outline-none focus:border-white transition-colors duration-500"
              />
              {errors.password && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase">{errors.password.message}</span>}
            </motion.div>

            {/* Confirmation */}
            <motion.div variants={itemVariants} className="relative flex flex-col">
              <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-white' : 'text-light-grey/40'}`}>
                Confirmer le mot de passe
              </label>
              <input 
                type="password" 
                {...register("confirmPassword", { 
                  required: "Confirmez votre mot de passe.",
                  validate: (val: string) => val === password || "Les mots de passe diffèrent."
                })}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className="w-full bg-transparent border-b border-light-grey/20 py-3 text-white focus:outline-none focus:border-white transition-colors duration-500"
              />
              {errors.confirmPassword && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase">{errors.confirmPassword.message}</span>}
            </motion.div>

            {/* Bouton de Soumission */}
            <motion.div variants={itemVariants} className="pt-8">
              <button 
                disabled={isSubmitting}
                className={`group relative inline-flex items-center gap-4 ${isSubmitting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
              >
                <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-300">
                  {isSubmitting ? 'CRÉATION...' : 'CREER LE COMPTE'}
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

export default RegisterPage;