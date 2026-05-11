"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useUserStore } from '@/store/useUserStore';
import { formatPrice } from '@/utils/formatPrice';
import { CheckoutService } from '@/services/checkout.service';

// --- IMPORTS STRIPE ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialisation de Stripe (Remplace par ta vraie clé publique)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_placeholder');

// --- 1. SCHÉMAS DE VALIDATION ZOD ---
const shippingSchema = z.object({
  firstName: z.string().min(1, "Requis"),
  lastName: z.string().min(1, "Requis"),
  email: z.string().email("Invalide"),
  address: z.string().min(5, "Requis"),
  city: z.string().min(2, "Requis"),
  postalCode: z.string().min(4, "Requis"),
  country: z.string().min(2, "Requis"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// --- 2. CHORÉGRAPHIE LUXE ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const stepVariants: Variants = {
  active: { opacity: 1, filter: "blur(0px)", scale: 1, pointerEvents: "auto", transition: { duration: 0.8, ease: LUXURY_EASE } },
  inactive: { opacity: 0.3, filter: "blur(4px)", scale: 0.98, pointerEvents: "none", transition: { duration: 0.8, ease: LUXURY_EASE } },
};

export default function CheckoutPage() {
  const router = useRouter();

  const [medusaCartId, setMedusaCartId] = useState<string | null>(null);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const { items, getCartTotal, isHydrated } = useCartStore();
  const { customer, isAuthenticated } = useUserStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focusedField, setFocusedField] = useState<keyof ShippingFormData | null>(null);

  // ÉTATS DYNAMIQUES POUR MEDUSA
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: customer?.email || '',
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
    }
  });

  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.push('/shop');
    }
  }, [isHydrated, items, router]);

  const onShippingSubmit = async (data: ShippingFormData) => {
    setIsProcessingStep(true);
    setStepError(null);
    try {
      // 1. On formate l'adresse pour Medusa (avec la sécurité toLowerCase sur 2 lettres)
      const formattedAddress = {
        first_name: data.firstName,
        last_name: data.lastName,
        address_1: data.address,
        city: data.city,
        postal_code: data.postalCode,
        country_code: data.country.toLowerCase().slice(0, 2),
        email: data.email
      };

      const cart = await CheckoutService.syncCartAndAddress(items, formattedAddress, medusaCartId || undefined);
      setMedusaCartId(cart.id);

      // 2. ⚡️ CHARGEMENT DYNAMIQUE DES OPTIONS DE LIVRAISON DEPUIS MEDUSA
      const options = await CheckoutService.getShippingOptions(cart.id);
      setShippingOptions(options);

      // 3. Auto-sélection de la première option pour une meilleure UX
      if (options && options.length > 0) {
        setSelectedShippingId(options[0].id);
      }

      setStep(2);
    } catch (error: any) {
      setStepError(error.message);
    } finally {
      setIsProcessingStep(false);
    }
  };

  const onMethodSubmit = async () => {
    if (!medusaCartId || !selectedShippingId) return; // Sécurité

    setIsProcessingStep(true);
    setStepError(null);
    try {
      // ⚡️ CONNEXION FINALE : On envoie le vrai ID de livraison à Medusa et Stripe
      const secret = await CheckoutService.initializePayment(medusaCartId, selectedShippingId);

      setClientSecret(secret);
      setStep(3);
    } catch (error: any) {
      setStepError(error.message);
    } finally {
      setIsProcessingStep(false);
    }
  };

  if (!isHydrated || items.length === 0) return null;

  // CALCULS DYNAMIQUES DU PRIX
  const subtotal = getCartTotal();
  const selectedOptionData = shippingOptions.find(opt => opt.id === selectedShippingId);
  const shippingCost = selectedOptionData?.amount ? selectedOptionData.amount*100 : 0; // Utilise le vrai prix Medusa
  const total = subtotal + shippingCost;

  // --- HACK STRIPE APPEARANCE (Design System ORA TRIP) ---
  const stripeAppearance = {
    theme: 'night' as const,
    variables: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      colorBackground: 'transparent',
      colorText: '#ffffff',
      colorDanger: '#f87171',
      spacingUnit: '4px',
      borderRadius: '0px',
      colorTextPlaceholder: 'rgba(195, 195, 195, 0.4)',
    },
    rules: {
      '.Input': {
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid rgba(195, 195, 195, 0.1)',
        boxShadow: 'none',
        padding: '16px 0',
        transition: 'border-color 0.5s ease',
      },
      '.Input:focus': {
        borderBottom: '1px solid #ffffff',
        boxShadow: 'none',
      },
      '.Label': {
        color: 'rgba(195, 195, 195, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.3em',
        fontSize: '10px',
        marginBottom: '8px',
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-20">

        {/* --- COLONNE GAUCHE : LE TUNNEL --- */}
        <div className="lg:col-span-7 flex flex-col gap-20 relative">

          {/* ÉTAPE 1 */}
          <motion.section variants={stepVariants} initial="active" animate={step === 1 ? "active" : "inactive"} className="flex flex-col gap-10 origin-left">
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">01. Destination</h2>
              {stepError && (
                <p className="text-red-400/80 text-[10px] uppercase tracking-widest mt-4">
                  {stepError}
                </p>
              )}
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-[9px] uppercase tracking-widest text-light-grey/40 hover:text-white transition-colors">
                  [ Modifier ]
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form key="form-step-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.8, ease: LUXURY_EASE }} onSubmit={handleSubmit(onShippingSubmit)} className="flex flex-col gap-10">
                  {!isAuthenticated && (
                    <p className="text-[10px] tracking-widest text-light-grey/60 uppercase">
                      Déjà membre ? <button type="button" onClick={() => router.push('/connexion?redirect=checkout')} className="text-white hover:italic transition-all">Se connecter</button>
                    </p>
                  )}
                  <InputField label="Email" name="email" type="email" register={register} error={errors.email?.message} isFocused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Prénom" name="firstName" register={register} error={errors.firstName?.message} isFocused={focusedField === 'firstName'} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)} />
                    <InputField label="Nom" name="lastName" register={register} error={errors.lastName?.message} isFocused={focusedField === 'lastName'} onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <InputField label="Adresse complète" name="address" register={register} error={errors.address?.message} isFocused={focusedField === 'address'} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)} />
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Code Postal" name="postalCode" register={register} error={errors.postalCode?.message} isFocused={focusedField === 'postalCode'} onFocus={() => setFocusedField('postalCode')} onBlur={() => setFocusedField(null)} />
                    <InputField label="Ville" name="city" register={register} error={errors.city?.message} isFocused={focusedField === 'city'} onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <InputField label="Pays" name="country" register={register} error={errors.country?.message} isFocused={focusedField === 'country'} onFocus={() => setFocusedField('country')} onBlur={() => setFocusedField(null)} />
                  <button type="submit" disabled={isProcessingStep} className="group relative inline-flex items-center gap-6 cursor-pointer w-max mt-4 disabled:opacity-50">
                    <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-500">
                      {isProcessingStep ? "SÉCURISATION..." : "CONTINUER"}
                    </span>
                    <motion.div initial={{ width: "2rem" }} whileHover={{ width: "4rem" }} transition={{ ease: LUXURY_EASE, duration: 0.8 }} className="h-px bg-white" />
                  </button>
                </motion.form>
              ) : (
                <motion.div key="summary-step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                  <p className="text-sm text-white">Livraison sécurisée pour :</p>
                  <p className="text-[10px] tracking-widest uppercase text-light-grey/60">L'adresse a été validée et enregistrée.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* ÉTAPE 2 */}
          <motion.section variants={stepVariants} initial="inactive" animate={step === 2 ? "active" : step > 2 ? "inactive" : "inactive"} className="flex flex-col gap-10 origin-left">
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">02. Expédition</h2>
              {step > 2 && (
                <button onClick={() => setStep(2)} className="text-[9px] uppercase tracking-widest text-light-grey/40 hover:text-white transition-colors">[ Modifier ]</button>
              )}
            </div>
            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.8, ease: LUXURY_EASE }} className="flex flex-col gap-8">
                  
                  {/* ⚡️ RENDU DYNAMIQUE DES OPTIONS DE LIVRAISON */}
                  {shippingOptions.length === 0 ? (
                    <span className="text-[10px] uppercase tracking-widest text-white/40 animate-pulse py-4">
                      Recherche des transporteurs sécurisés...
                    </span>
                  ) : (
                    shippingOptions.map((option) => (
                      <ShippingOption 
                        key={option.id}
                        title={option.name} 
                        delay={option.name.toLowerCase().includes('express') ? '24h à 48h ouvrées' : '3 à 5 jours ouvrés'} 
                        price={option.amount ? (option.amount + " €" ): "Offert"} 
                        isActive={selectedShippingId === option.id} 
                        onClick={() => setSelectedShippingId(option.id)} 
                      />
                    ))
                  )}

                  {stepError && (
                    <p className="text-red-400/80 text-[10px] uppercase tracking-widest mt-4">
                      {stepError}
                    </p>
                  )}
                  
                  <button onClick={onMethodSubmit} disabled={!selectedShippingId || isProcessingStep} className="group relative inline-flex items-center gap-6 cursor-pointer w-max mt-8 disabled:opacity-50">
                    <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-500">
                      {isProcessingStep ? "SÉCURISATION..." : "VALIDER L'EXPÉDITION"}
                    </span>
                    <motion.div initial={{ width: "2rem" }} whileHover={{ width: "4rem" }} transition={{ ease: LUXURY_EASE, duration: 0.8 }} className="h-px bg-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* ÉTAPE 3 : STRIPE */}
          <motion.section variants={stepVariants} initial="inactive" animate={step === 3 ? "active" : "inactive"} className="flex flex-col gap-10 origin-left">
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">03. Paiement</h2>
            </div>
            <AnimatePresence mode="wait">
              {step === 3 && clientSecret && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.8, ease: LUXURY_EASE }} className="flex flex-col gap-10">
                  <p className="text-[10px] tracking-widest uppercase text-light-grey/60">Transaction cryptée via Stripe.</p>

                  {/* INJECTION DU PROVIDER STRIPE */}
                  <Elements options={{ clientSecret, appearance: stripeAppearance }} stripe={stripePromise}>
                    <StripeForm totalAmount={total} />
                  </Elements>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>

        {/* --- COLONNE DROITE : RÉSUMÉ --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-40 flex flex-col gap-10 border border-light-grey/10 p-8 md:p-12 bg-dark z-10">
            <span className="text-[10px] tracking-[0.4em] uppercase text-light-grey/40 border-b border-light-grey/10 pb-6">Votre Archive ({items.length})</span>
            <div className="flex flex-col gap-8 max-h-[40vh] overflow-y-auto no-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-20 aspect-[3/4] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    <img src={item.imagePath} alt={item.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <p className="font-title text-xl text-white italic">{item.title}</p>
                    <p className="text-[9px] tracking-widest uppercase text-light-grey/40">Taille {item.format} — Qté: {item.quantity}</p>
                    <p className="text-sm text-white mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 border-t border-light-grey/10 pt-8 mt-4">
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-light-grey/60"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-light-grey/60"><span>Expédition</span><span>{shippingCost === 0 ? "Offert" : formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between text-xl text-white mt-4 border-t border-light-grey/10 pt-6"><span className="font-light">Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SOUS-COMPOSANT : FORMULAIRE STRIPE ---
const StripeForm = ({ totalAmount }: { totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "La transaction a été refusée par l'établissement bancaire.");
      }
    } catch (err) {
      setErrorMessage("Une anomalie réseau a interrompu la transaction sécurisée.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPayment} className="flex flex-col gap-10">
      <PaymentElement options={{ layout: 'accordion' }} />
      {errorMessage && (
        <span className="text-red-400/80 text-[10px] uppercase tracking-widest">{errorMessage}</span>
      )}
      <button
        disabled={!stripe || isProcessing}
        className="w-full bg-white text-dark py-6 mt-4 font-mono text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-light-grey transition-colors duration-500 disabled:opacity-50"
      >
        {isProcessing ? 'TRAITEMENT SÉCURISÉ...' : `CONFIRMER L'ACQUISITION — ${formatPrice(totalAmount)}`}
      </button>
    </form>
  );
};

// --- MICRO-COMPOSANTS ---
const InputField = ({ label, name, type = "text", register, error, isFocused, onFocus, onBlur }: any) => (
  <div className="relative flex flex-col gap-2 group w-full">
    <motion.label animate={{ color: isFocused ? "#FFFFFF" : "rgba(195, 195, 195, 0.4)" }} transition={{ duration: 0.5 }} className="text-[10px] tracking-[0.3em] uppercase">{label}</motion.label>
    <div className="relative">
      <input type={type} {...register(name)} onFocus={onFocus} onBlur={onBlur} className="w-full bg-transparent border-b border-light-grey/10 py-3 text-white focus:outline-none font-light transition-colors duration-500" />
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: isFocused ? 1 : 0 }} transition={{ duration: 0.8, ease: LUXURY_EASE }} className="absolute bottom-0 left-0 w-full h-px bg-white origin-left" />
    </div>
    {error && <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest">{error}</span>}
  </div>
);

const ShippingOption = ({ title, delay, price, isActive, onClick }: any) => (
  <div onClick={onClick} className={`relative flex items-center justify-between p-6 border transition-colors duration-500 cursor-pointer group ${isActive ? 'border-white bg-white/[0.02]' : 'border-light-grey/10 hover:border-light-grey/30'}`}>
    <div className="flex flex-col gap-1">
      <span className={`font-mono text-sm tracking-widest uppercase transition-colors duration-500 ${isActive ? 'text-white' : 'text-light-grey/60 group-hover:text-light-grey'}`}>{title}</span>
      <span className="font-mono text-[9px] text-light-grey/40 tracking-[0.2em]">{delay}</span>
    </div>
    <span className={`font-mono text-sm ${isActive ? 'text-white' : 'text-light-grey/60'}`}>{price}</span>
    {isActive && <motion.div layoutId="shippingSelect" className="absolute left-0 top-0 w-[2px] h-full bg-white" transition={{ type: "spring", stiffness: 200, damping: 30 }} />}
  </div>
);