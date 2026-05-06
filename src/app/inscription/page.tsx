"use client";
import { useRouter } from 'next/navigation';
import { medusaClient } from '@/lib/medusa/client'; // Vérifie que ce chemin correspond à ton arborescence

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

// --- 1. SCHÉMA DE SÉCURITÉ (Mis à jour avec le téléphone) ---
const registerSchema = z.object({
  firstName: z.string().min(1, "Requis."),
  lastName: z.string().min(1, "Requis."),
  email: z.string().email("Format invalide."),
  phone: z.string().min(10, "Format invalide."), // Nouveau champ ajouté ici
  password: z.string().min(8, "8 caractères minimum."),
  confirmPassword: z.string(),
  address_secondary: z.string().optional(), // Honeypot
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe diffèrent.",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// --- 2. CHORÉGRAPHIE LUXE (Design System) ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
  }
};

const textRevealVariants: Variants = {
  hidden: { opacity: 0, y: "120%", filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: LUXURY_EASE } 
  }
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: LUXURY_EASE } 
  }
};

const RegisterPage = () => {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState<keyof RegisterFormData | null>(null);
  const [serverError, setServerError] = useState<string | null>(null); // Nouvel état d'erreur

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (data.address_secondary) return; // Honeypot trap
    setServerError(null);

    try {
      // 1. Inscription dans l'archive ORA TRIP (MedusaJS)
      await medusaClient.customers.create({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone, // Le champ téléphone est injecté ici
      });

      // 2. Redirection fluide vers la page de connexion après succès
      router.push('/connexion?registered=true');

    } catch (error: any) {
      // Si l'API refuse (ex: email déjà pris)
      console.error("Erreur d'inscription:", error);
      setServerError("Cette identité fait déjà partie de l'archive ORA.");
    }
  };

  // --- Ajoute aussi ce variant pour le 'shake' s'il n'y est pas ---
  const shakeVariants = {
    shake: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
        
        {/* --- COLONNE GAUCHE : MANIFESTE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <motion.span variants={fadeUpVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
              Membre
            </motion.span>
            
            {/* Effet de masque pour le titre principal */}
            <h1 className="font-title text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white flex flex-col">
              <span className="overflow-hidden pb-2">
                <motion.span variants={textRevealVariants} className="block">CREER VOTRE</motion.span>
              </span>
              <span className="overflow-hidden pb-4">
                <motion.span variants={textRevealVariants} className="block italic opacity-80 text-light-grey">COMPTE.</motion.span>
              </span>
            </h1>
          </div>

          <motion.div variants={fadeUpVariants} className="flex flex-col gap-8 text-sm max-w-sm">
            <p className="text-light-grey/80 leading-relaxed italic font-light">
              En rejoignant ORA TRIP, vous accédez à l'histoire derrière chaque maillot. Gérez vos commandes, suivez l'aventure ORA et participez à la culture.
            </p>
            <div className="pt-6 border-t border-light-grey/10">
              <Link href="/connexion" className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-500 hover:tracking-[0.4em]">
                [ Déjà inscrit ? Se connecter ]
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* --- COLONNE DROITE : FORMULAIRE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <motion.form 
          onSubmit={handleSubmit(onSubmit)}
          animate={(Object.keys(errors).length > 0 || serverError) ? "shake" : ""}
          variants={shakeVariants}
          className="flex flex-col gap-10"
        >
            <input type="text" {...register("address_secondary")} className="hidden" tabIndex={-1} />

            <div className="grid grid-cols-2 gap-10">
              <InputField 
                label="Prénom" name="firstName" register={register} error={errors.firstName?.message}
                isFocused={focusedField === 'firstName'} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)}
              />
              <InputField 
                label="Nom" name="lastName" register={register} error={errors.lastName?.message}
                isFocused={focusedField === 'lastName'} onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)}
              />
            </div>

            <InputField 
              label="Email de correspondance" name="email" type="email" register={register} error={errors.email?.message}
              isFocused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
            />

            {/* NOUVEAU CHAMP : TÉLÉPHONE */}
            <InputField 
              label="Téléphone" name="phone" type="tel" register={register} error={errors.phone?.message}
              isFocused={focusedField === 'phone'} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
            />

            <InputField 
              label="Mot de passe" name="password" type="password" register={register} error={errors.password?.message}
              isFocused={focusedField === 'password'} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
            />

            <InputField 
              label="Confirmer le mot de passe" name="confirmPassword" type="password" register={register} error={errors.confirmPassword?.message}
              isFocused={focusedField === 'confirmPassword'} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
            />

            {/* Bouton de Soumission Expérientiel */}
            <motion.div variants={fadeUpVariants} className="pt-8 flex flex-col gap-4">
              <button 
                disabled={isSubmitting}
                className="group relative inline-flex items-center gap-6 cursor-pointer w-max"
              >
                <span className="font-title text-2xl md:text-3xl tracking-widest text-white group-hover:italic transition-all duration-500">
                  {isSubmitting ? 'TRAITEMENT...' : 'CREER LE COMPTE'}
                </span>
                <motion.div 
                  initial={{ width: "3rem" }}
                  whileHover={{ width: "6rem" }}
                  transition={{ ease: LUXURY_EASE, duration: 0.8 }}
                  className="h-px bg-white" 
                />
              </button>

              {/* Message d'erreur serveur (Medusa) */}
              <AnimatePresence>
                {serverError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-red-400/80 text-[10px] uppercase tracking-widest mt-2"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

// --- 3. COMPOSANT INPUT ATOMIQUE (Gestion fine des micro-interactions) ---
const InputField = ({ label, name, type = "text", register, error, isFocused, onFocus, onBlur }: any) => (
  <motion.div variants={fadeUpVariants} className="relative flex flex-col gap-2 group">
    <motion.label 
      animate={{ color: isFocused ? "#FFFFFF" : "rgba(195, 195, 195, 0.4)" }}
      transition={{ duration: 0.5 }}
      className="text-[10px] tracking-[0.3em] uppercase"
    >
      {label}
    </motion.label>
    
    <div className="relative">
      <input 
        type={type}
        {...register(name)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full bg-transparent border-b border-light-grey/10 py-3 text-white focus:outline-none font-light transition-colors duration-500"
      />
      {/* Ligne de focus animée par l'axe X (Effet de tracé) */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.8, ease: LUXURY_EASE }}
        className="absolute bottom-0 left-0 w-full h-px bg-white origin-left"
      />
    </div>

    <AnimatePresence>
      {error && (
        <motion.span 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -5 }}
          className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest"
        >
          {error}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.div>
);

export default RegisterPage;