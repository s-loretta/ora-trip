"use client";

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion'; // IMPORT DU TYPE VARIANTS
import { useForm } from 'react-hook-form';

// --- TYPAGE STRICT ---
interface ForgotPasswordForm {
  email: string;
}

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    mode: 'onSubmit',
  });

  const emailValue = watch('email');

  // --- SOUMISSION ---
  const onSubmit = async (data: ForgotPasswordForm) => {
    // TODO: Connecter à MedusaJS (ex: medusa.auth.resetPassword(data.email))
    console.log("Données soumises :", data);
    
    // Simulation d'un appel réseau pour l'expérience UI
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
  };

  // --- VARIANTES D'ANIMATION (AVEC TYPAGE) ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  const shakeAnimation = {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey flex flex-col items-center justify-center px-6 selection:bg-light-grey selection:text-dark">
      
      {/* --- BOUTON RETOUR --- */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute top-10 left-6 md:left-20 font-mono text-[10px] uppercase tracking-[0.3em] text-light-grey/40 hover:text-white transition-colors flex items-center gap-4"
        onClick={() => window.history.back()}
      >
        {/* CORRECTION TAILWIND: h-[1px] -> h-px */}
        <span className="w-6 h-px bg-light-grey/40" />
        Retour
      </motion.button>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md flex flex-col gap-16"
      >
        {/* --- EN-TÊTE --- */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 text-center items-center">
          <span className="font-mono text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
            Accès
          </span>
          <h1 className="font-title text-4xl md:text-5xl tracking-tighter italic text-white">
            VOUS AVEZ OUBLIE<br />
            VOTRE MOT DE PASSE ?
          </h1>
          <p className="font-mono text-xs text-light-grey/60 tracking-widest uppercase mt-4">
            Un lien vous sera envoyé pour réinitialiser votre mot de passe.
          </p>
        </motion.div>

        {/* --- ÉTAT DE SUCCÈS --- */}
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8 text-center"
          >
            {/* CORRECTION TAILWIND: h-[1px] -> h-px */}
            <div className="w-full h-px bg-light-grey/20 relative overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }} 
                animate={{ x: "100%" }} 
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-white/50 w-1/3" 
              />
            </div>
            <p className="font-mono text-sm leading-relaxed text-light-grey/80">
              Si cette adresse existe dans nos archives, un protocole de réinitialisation a été transmis à <span className="text-white italic">{emailValue}</span>.
            </p>
          </motion.div>
        ) : (
          /* --- FORMULAIRE --- */
          <motion.form 
            variants={itemVariants} 
            onSubmit={handleSubmit(onSubmit)} 
            className="flex flex-col gap-12"
            noValidate
          >
            {/* CHAMP EMAIL AVEC MICRO-INTERACTION SHAKE SI ERREUR */}
            <motion.div 
              animate={errors.email ? shakeAnimation : {}}
              className="relative w-full flex flex-col justify-end h-14"
            >
              <label 
                htmlFor="email"
                className={`absolute left-0 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-500 pointer-events-none
                  ${emailValue ? '-translate-y-8 text-light-grey/40' : 'translate-y-0 text-light-grey/60'}
                `}
              >
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Cette information est requise.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Format invalide.',
                  },
                })}
                className={`w-full bg-transparent border-b pb-2 font-mono text-sm text-white focus:outline-none transition-colors duration-300 rounded-none
                  ${errors.email ? 'border-red-500/50' : 'border-light-grey/20 focus:border-white'}
                `}
              />
              
              {/* MESSAGE D'ERREUR */}
              {errors.email && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-0 font-mono text-[9px] uppercase tracking-widest text-red-400"
                >
                  {errors.email.message}
                </motion.span>
              )}
            </motion.div>

            {/* BOUTON DE SOUMISSION */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-4 flex items-center justify-between border-b border-light-grey/20 hover:border-white transition-colors duration-500 overflow-hidden mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-light-grey group-hover:text-white transition-colors relative z-10">
                {isSubmitting ? 'Traitement...' : 'Confirmer'}
              </span>
              
              <div className="flex items-center gap-4 relative z-10">
                {/* CORRECTION TAILWIND: h-[1px] -> h-px */}
                <span className="w-8 h-px bg-light-grey/40 group-hover:bg-white group-hover:w-12 transition-all duration-500" />
              </div>

              {/* BACKGROUND FILL ON HOVER */}
              {/* CORRECTION TAILWIND: bg-white/[0.02] -> bg-white/2 */}
              <div className="absolute inset-0 bg-white/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;