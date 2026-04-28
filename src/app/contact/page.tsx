"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';

// 1. Définition des types pour le formulaire
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  orderNumber?: string;
  message: string;
  address_secondary?: string; // Honeypot
}

const ContactPage = () => {
  // 2. Typage de l'état du focus (limité aux clés de notre interface ou null)
  const [focusedField, setFocusedField] = useState<keyof ContactFormData | null>(null);

  // 3. Initialisation typée de React Hook Form
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful } 
  } = useForm<ContactFormData>({
    defaultValues: {
      subject: "general",
      message: ""
    }
  });

  const selectedSubject = watch("subject");
  const messageValue = watch("message");

  // 4. Typage de la fonction de soumission
  const onSubmit = async (data: ContactFormData) => {
    if (data.address_secondary) return; // Honeypot
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Transmission ORA TRIP :", data);
  };

  // --- VARIANTS D'ANIMATION TYPÉS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as any // Cast "as any" car Motion est strict sur les tableaux de nombres
      } 
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey overflow-hidden selection:bg-light-grey selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
        
        {/* --- COLONNE GAUCHE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-16">
          <div className="flex flex-col gap-6">
            <motion.span variants={itemVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
              Échangeons
            </motion.span>
            <motion.h1 variants={itemVariants} className="font-title text-6xl md:text-8xl tracking-tighter leading-[0.9] text-white">
              UNE QUESTION ?  <br />
              <span className="italic opacity-80 text-light-grey">CONTACTEZ-NOUS.</span>
            </motion.h1>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col gap-8 text-sm">
            <p className="max-w-sm text-light-grey/80 leading-relaxed italic font-light">
              Une question sur une pièce, une idée de collaboration, ou simplement l'envie de partager votre propre histoire ? Le vestiaire est ouvert.
            </p>

            <div className="flex flex-col gap-6 pt-8 border-t border-light-grey/10">
              <div className="flex flex-col gap-1 group cursor-pointer">
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">Email</span>
                <span className="text-white tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                  contact@oratrip.com
                </span>
              </div>
              <div className="flex flex-col gap-1 group cursor-pointer">
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">Instagram</span>
                <span className="text-white tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                  @Oratripfr
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* --- COLONNE DROITE --- */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full mt-10 lg:mt-0">
          
          <AnimatePresence mode="wait">
            {!isSubmitSuccessful ? (
              <motion.form 
                key="form"
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-10" 
                onSubmit={handleSubmit(onSubmit)}
              >
                
                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <input type="text" {...register("address_secondary")} tabIndex={-1} autoComplete="off" />
                </div>

                {/* Champ NOM */}
                <motion.div variants={itemVariants} className="relative flex flex-col">
                  <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'name' ? 'text-white' : 'text-light-grey/40'}`}>
                    Votre Nom / Pseudo
                  </label>
                  <input 
                    type="text" 
                    {...register("name", { required: "Ce champ est requis." })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white placeholder-light-grey/10 focus:outline-none focus:border-white transition-colors duration-500"
                    placeholder="Ex: Zinedine Z."
                  />
                  {errors.name && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest">{errors.name.message}</span>}
                </motion.div>

                {/* Champ EMAIL */}
                <motion.div variants={itemVariants} className="relative flex flex-col">
                  <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-light-grey/40'}`}>
                    Adresse Email
                  </label>
                  <input 
                    type="email" 
                    {...register("email", { 
                      required: "Email requis.",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Format invalide." }
                    })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white placeholder-light-grey/10 focus:outline-none focus:border-white transition-colors duration-500"
                    placeholder="Ex: zizou@numero10.com"
                  />
                  {errors.email && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest">{errors.email.message}</span>}
                </motion.div>

                {/* Champ OBJET */}
                <motion.div variants={itemVariants} className="relative flex flex-col">
                  <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'subject' ? 'text-white' : 'text-light-grey/40'}`}>
                    Objet de la transmission
                  </label>
                  <select 
                    {...register("subject")}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white appearance-none focus:outline-none focus:border-white transition-colors duration-500 cursor-pointer"
                  >
                    <option value="general" className="bg-dark text-white">Demande Générale</option>
                    <option value="order" className="bg-dark text-white">Problème de Commande</option>
                    <option value="collab" className="bg-dark text-white">Collaboration</option>
                    <option value="presse" className="bg-dark text-white">Presse & Media</option>
                    <option value="autre" className="bg-dark text-white">Autre</option>
                  </select>
                  <div className="absolute right-0 bottom-5 pointer-events-none text-[10px] text-light-grey/40">↓</div>
                </motion.div>

                {/* Champ COMMANDE */}
                <AnimatePresence>
                  {selectedSubject === 'order' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="relative flex flex-col overflow-hidden"
                    >
                      <label className="text-[10px] tracking-[0.3em] uppercase text-light-grey/40">
                        Numéro de Commande
                      </label>
                      <input 
                        type="text"
                        {...register("orderNumber", { required: "Le numéro est nécessaire." })}
                        onFocus={() => setFocusedField('orderNumber')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white focus:outline-none focus:border-white transition-colors duration-500"
                        placeholder="Ex: #ORA-2024"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Champ MESSAGE */}
                <motion.div variants={itemVariants} className="relative flex flex-col">
                  <div className="flex justify-between items-end">
                    <label className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 ${focusedField === 'message' ? 'text-white' : 'text-light-grey/40'}`}>
                      Votre Histoire
                    </label>
                    <span className="text-[9px] font-mono text-light-grey/20 uppercase tracking-widest">
                      {(messageValue?.length || 0)} / 2000
                    </span>
                  </div>
                  <textarea 
                    rows={4} // Correction : Nombre au lieu de String
                    {...register("message", { 
                      required: "Le vestiaire attend votre message.",
                      maxLength: { value: 2000, message: "Maximum 2000 caractères." }
                    })}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-transparent border-b border-light-grey/20 py-4 text-white placeholder-light-grey/10 focus:outline-none focus:border-white transition-colors duration-500 resize-none"
                    placeholder="Racontez-nous..."
                  ></textarea>
                  {errors.message && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest">{errors.message.message}</span>}
                </motion.div>

                {/* Bouton */}
                <motion.div variants={itemVariants} className="pt-4">
                  <button 
                    disabled={isSubmitting}
                    className={`group relative inline-flex items-center gap-4 ${isSubmitting ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                  >
                    <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-300">
                      {isSubmitting ? 'TRANSMISSION...' : 'ENVOYER'}
                    </span>
                    {!isSubmitting && <div className="w-12 h-px bg-white group-hover:w-24 transition-all duration-500 ease-out" />}
                  </button>
                </motion.div>

              </motion.form>
            ) : (
              /* --- MESSAGE DE SUCCÈS --- */
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-6 items-start h-full justify-center"
              >
                <h3 className="font-title text-5xl tracking-widest text-white italic">BIEN REÇU.</h3>
                <p className="text-light-grey/80 leading-relaxed font-light border-l border-white/20 pl-6 max-w-sm">
                  Votre message a été envoyé avec succès. Notre équipe reviendra vers vous dès que la prochaine session d'analyse commencera.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mt-4"
                >
                  [ Nouvelle Transmission ]
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;