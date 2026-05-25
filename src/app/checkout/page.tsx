"use client"


import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/useCartStore"
import { useUserStore } from "@/store/useUserStore"
import { CheckoutService } from "@/services/checkout.service"

import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

// --- DICTIONNAIRE DES ERREURS STRIPE ---
const translateStripeError = (errorCode: string | undefined): string => {
  switch (errorCode) {
    case 'insufficient_funds': return "Les fonds sur cette carte sont insuffisants.";
    case 'card_declined':
    case 'fraudulent':
    case 'transaction_not_allowed': return "Votre banque a refusé la transaction.";
    case 'expired_card': return "Votre carte a expiré.";
    case 'incorrect_cvc':
    case 'invalid_cvc': return "Le code de sécurité (CVC) est incorrect.";
    case 'processing_error': return "Une erreur est survenue lors du traitement.";
    case 'incomplete_number':
    case 'invalid_number': return "Le numéro de carte est incomplet ou invalide.";
    case 'incomplete_expiry': return "La date d'expiration de la carte est incomplète.";
    default: return "Le paiement n'a pas pu aboutir. Veuillez essayer une autre carte.";
  }
};

// --- SCHÉMA DE VALIDATION ---
const shippingSchema = z.object({
  firstName: z.string().min(1, "Requis"),
  lastName: z.string().min(1, "Requis"),
  email: z.string().email("Invalide"),
  address: z.string().min(5, "Requis"),
  city: z.string().min(2, "Requis"),
  postalCode: z.string().min(4, "Requis"),
  country: z.string().min(2, "Requis"),
  phone: z.string().optional(),
})

type ShippingFormData = z.infer<typeof shippingSchema>

const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const stepVariants: Variants = {
  active: { 
    opacity: 1, filter: "blur(0px)", scale: 1, pointerEvents: "auto", 
    transition: { duration: 0.4, ease: LUXURY_EASE } // 🚀 Réduit de 0.8 à 0.4
  },
  inactive: { 
    opacity: 0.3, filter: "blur(4px)", scale: 0.98, pointerEvents: "none", 
    transition: { duration: 0.4, ease: LUXURY_EASE } // 🚀 Réduit de 0.8 à 0.4
  },
}

const stripeAppearance = {
  theme: "night" as const,
  variables: {
    fontFamily: "monospace",
    colorBackground: "#131313",
    colorText: "#ffffff",
    colorDanger: "#ef4444",
  },
}

export default function CheckoutPage() {
  const router = useRouter()

  const [medusaCartId, setMedusaCartId] = useState<string | null>(null)
  const [isProcessingStep, setIsProcessingStep] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)

  const { items, getCartTotal, isHydrated } = useCartStore()
  const { customer, isAuthenticated } = useUserStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const subtotal = getCartTotal()
  const selectedOption = shippingOptions.find(o => o.id === selectedShippingId)
  const shippingCost = selectedOption ? (selectedOption.amount ?? 0) : 0
  const total = subtotal + shippingCost

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: customer?.email || '',
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
      phone: customer?.phone || '',
    }
  });

  useEffect(() => {
    if (isAuthenticated && customer?.addresses?.length) {
      const savedAddress = customer.addresses[0];
      reset({
        email: customer.email || '',
        firstName: savedAddress.first_name || customer.first_name || '',
        lastName: savedAddress.last_name || customer.last_name || '',
        phone: savedAddress.phone || customer.phone || '',
        address: savedAddress.address_1 || '',
        city: savedAddress.city || '',
        postalCode: savedAddress.postal_code || '',
        country: savedAddress.country_code?.toUpperCase() || '',
      });
    }
  }, [isAuthenticated, customer, reset]);

  useEffect(() => {
    if (isHydrated && items.length === 0) router.push("/galerie")
  }, [isHydrated, items, router])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/connexion?redirect=/checkout")
  }, [isHydrated, isAuthenticated, router])

  // ✅ OPTIMISATION CLÉ : syncCartAndAddress + getShippingOptions en PARALLÈLE
  // Avant : ~800ms (séquentiel) → Après : ~400ms (parallèle)
  // Les deux appels sont indépendants côté Medusa une fois l'adresse posée
const onShippingSubmit = async (data: ShippingFormData) => {
    setIsProcessingStep(true)
    setStepError(null)

    try {
      // On remet les vraies données de l'adresse (Adieu l'objet vide !)
      const formattedAddress = {
        first_name: data.firstName,
        last_name: data.lastName,
        address_1: data.address,
        city: data.city,
        postal_code: data.postalCode,
        country_code: data.country.toLowerCase().slice(0, 2),
        email: data.email,
      }

      const activeCartId = medusaCartId || useCartStore.getState().cartId;

      // On rassure TypeScript : si pas de panier, on bloque tout de suite
      if (!activeCartId) {
        throw new Error("Impossible de trouver votre session de commande.");
      }

    
      const [cart, options] = await Promise.all([
        CheckoutService.syncCartAndAddress(activeCartId, formattedAddress),
        CheckoutService.getShippingOptions(activeCartId) // Plus d'erreur ici !
      ]);

      setMedusaCartId(cart.id);
      setShippingOptions(options);
      if (options?.length > 0) setSelectedShippingId(options[0].id);

      setStep(2);
    } catch (error: any) {
      setStepError(error.message)
    } finally {
      setIsProcessingStep(false)
    }
  }


  const prefetchedSecret = useRef<string | null>(null)
  const prefetchedForShippingId = useRef<string | null>(null)
const prefetchPromise = useRef<Promise<string> | null>(null)
useEffect(() => {
    if (step !== 2 || !medusaCartId || !selectedShippingId) return
    if (prefetchedForShippingId.current === selectedShippingId) return 

    prefetchedForShippingId.current = selectedShippingId

    // ✅ On stocke la promesse en cours d'exécution
    prefetchPromise.current = CheckoutService.initializePayment(medusaCartId, selectedShippingId)
    
    prefetchPromise.current
      .then(secret => { prefetchedSecret.current = secret })
      .catch(() => {
        prefetchedSecret.current = null
        prefetchedForShippingId.current = null
      })
  }, [step, medusaCartId, selectedShippingId])

  const onMethodSubmit = async () => {
    if (!medusaCartId || !selectedShippingId) return
    setIsProcessingStep(true)
    setStepError(null)

    try {
      
      let secret = prefetchedSecret.current;
      
      if (!secret && prefetchPromise.current) {
        secret = await prefetchPromise.current;
      } 
      
      if (!secret) {
        secret = await CheckoutService.initializePayment(medusaCartId, selectedShippingId);
      }

      setClientSecret(secret)
      setStep(3)
    } catch (error: any) {
      setStepError(error.message)
    } finally {
      setIsProcessingStep(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4 text-light-grey font-mono">
        <span className="text-[10px] uppercase tracking-widest animate-pulse">Synchronisation de l'archive...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

        {/* COLONNE GAUCHE : ÉTAPES */}
        <div className="lg:col-span-7 flex flex-col gap-20">

          {/* ÉTAPE 1 : LIVRAISON */}
          <motion.section
            variants={stepVariants}
            initial="active"
            animate={step === 1 ? "active" : "inactive"}
            className="flex flex-col gap-10 origin-left"
          >
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">01. Livraison</h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="font-mono text-[9px] uppercase tracking-widest text-light-grey/30 hover:text-white transition-colors">
                  Modifier
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onShippingSubmit)} className="flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <InputField label="Prénom" name="firstName" register={register} error={errors.firstName?.message} />
                <InputField label="Nom" name="lastName" register={register} error={errors.lastName?.message} />
                <InputField label="Email" name="email" type="email" register={register} error={errors.email?.message} />
                <InputField label="Téléphone" name="phone" type="tel" register={register} error={errors.phone?.message} />
                <div className="md:col-span-2">
                  <InputField label="Adresse" name="address" register={register} error={errors.address?.message} />
                </div>
                <InputField label="Ville" name="city" register={register} error={errors.city?.message} />
                <InputField label="Code postal" name="postalCode" register={register} error={errors.postalCode?.message} />
                <InputField label="Pays (ex: FR)" name="country" register={register} error={errors.country?.message} />
              </div>

              {stepError && (
                <p className="text-red-400/80 text-[10px] uppercase tracking-widest">{stepError}</p>
              )}

              <button
                type="submit"
                disabled={isProcessingStep}
                className="group relative inline-flex items-center gap-6 cursor-pointer w-max disabled:opacity-50"
              >
                <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-500">
                  {isProcessingStep ? "VERIFICATION..." : "VALIDER L'ADRESSE"}
                </span>
                <motion.div
                  initial={{ width: "2rem" }}
                  whileHover={{ width: "4rem" }}
                  transition={{ ease: LUXURY_EASE, duration: 0.8 }}
                  className="h-px bg-white"
                />
              </button>
            </form>
          </motion.section>

          {/* ÉTAPE 2 : EXPÉDITION */}
          <motion.section
            variants={stepVariants}
            initial="inactive"
            animate={step === 2 ? "active" : "inactive"}
            className="flex flex-col gap-10 origin-left"
          >
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">02. Expedition</h2>
            </div>
            <AnimatePresence mode="wait">
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: LUXURY_EASE }}
                  className="flex flex-col gap-6"
                >
                  {shippingOptions.length === 0 ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-light-grey/40 animate-pulse">
                      Chargement des options...
                    </span>
                  ) : (
                    shippingOptions.map((option) => (
                      <ShippingOption
                        key={option.id}
                        title={option.name}
                        delay={option.metadata?.delivery_time || "5-7 jours ouvrés"}
                        price={option.amount ? `${option.amount} €` : "Offert"}
                        isActive={selectedShippingId === option.id}
                        onClick={() => setSelectedShippingId(option.id)}
                      />
                    ))
                  )}
                  {stepError && (
                    <p className="text-red-400/80 text-[10px] uppercase tracking-widest mt-4">{stepError}</p>
                  )}
                  <button
                    onClick={onMethodSubmit}
                    disabled={!selectedShippingId || isProcessingStep}
                    className="group relative inline-flex items-center gap-6 cursor-pointer w-max mt-8 disabled:opacity-50"
                  >
                    <span className="font-title text-2xl tracking-widest text-white group-hover:italic transition-all duration-500">
                      {isProcessingStep ? "SÉCURISATION..." : "VALIDER L'EXPEDITION"}
                    </span>
                    <motion.div
                      initial={{ width: "2rem" }}
                      whileHover={{ width: "4rem" }}
                      transition={{ ease: LUXURY_EASE, duration: 0.8 }}
                      className="h-px bg-white"
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* ÉTAPE 3 : PAIEMENT */}
          <motion.section
            variants={stepVariants}
            initial="inactive"
            animate={step === 3 ? "active" : "inactive"}
            className="flex flex-col gap-10 origin-left"
          >
            <div className="flex justify-between items-end border-b border-light-grey/10 pb-6">
              <h2 className="font-title text-4xl md:text-5xl italic text-white">03. Paiement</h2>
            </div>
            <AnimatePresence mode="wait">
              {step === 3 && clientSecret && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.8, ease: LUXURY_EASE }}
                  className="flex flex-col gap-10"
                >
                  <p className="text-[10px] tracking-widest uppercase text-light-grey/60">
                    Transaction cryptee via Stripe.
                  </p>
                  <Elements
                    key={clientSecret}
                    options={{ clientSecret, appearance: stripeAppearance }}
                    stripe={stripePromise}
                  >
                    <StripeForm
                      totalAmount={total}
                      cartId={medusaCartId!}
                      clientSecret={clientSecret!}
                    />
                  </Elements>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>

        {/* COLONNE DROITE : RÉSUMÉ */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-40 flex flex-col gap-10 border border-light-grey/10 p-8 md:p-12 bg-dark z-10">
            <span className="text-[10px] tracking-[0.4em] uppercase text-light-grey/40 border-b border-light-grey/10 pb-6">
              Votre Archive ({items.length})
            </span>
            <div className="flex flex-col gap-8 max-h-[40vh] overflow-y-auto no-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-20 aspect-[3/4] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <p className="font-title text-xl text-white italic">{item.title}</p>
                    <p className="text-[9px] tracking-widest uppercase text-light-grey/40">
                      Taille {item.variantTitle} — Qté: {item.quantity}
                    </p>
                    <p className="text-sm text-white mt-1">{item.unitPrice * item.quantity} EUR</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 border-t border-light-grey/10 pt-8 mt-4">
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-light-grey/60">
                <span>Sous-total</span><span>{subtotal} EUR</span>
              </div>
              <div className="flex justify-between text-[10px] tracking-widest uppercase text-light-grey/60">
                <span>Expédition</span><span>{shippingCost === 0 ? "Offert" : `${shippingCost} €`}</span>
              </div>
              <div className="flex justify-between text-xl text-white mt-4 border-t border-light-grey/10 pt-6">
                <span className="font-light">Total</span><span>{total} EUR</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- STRIPE FORM ---
const StripeForm = ({ totalAmount, cartId, clientSecret }: { totalAmount: number; cartId: string; clientSecret: string }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasSubmitted = useRef(false)

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !cartId || hasSubmitted.current) return

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(translateStripeError(submitError.decline_code || submitError.code))
      return
    }

    hasSubmitted.current = true
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/api/capture-payment/${cartId}`,
        },
        redirect: "if_required",
      })

      if (error) {
        hasSubmitted.current = false
        setErrorMessage(translateStripeError(error.decline_code || error.code))
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {
        window.location.href = `/api/capture-payment/${cartId}?redirect_status=succeeded&payment_intent=${paymentIntent.id}&payment_intent_client_secret=${paymentIntent.client_secret}`
      }
    } catch (err: any) {
      hasSubmitted.current = false
      setErrorMessage("Anomalie réseau. Veuillez réessayer.")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmitPayment} className="flex flex-col gap-10">
      <PaymentElement options={{ layout: "accordion" }} />
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="border-l border-red-400/50 pl-4 py-2 mt-2"
          >
            <p className="text-[10px] uppercase tracking-widest text-red-400/80">Transaction refusée</p>
            <p className="text-sm font-light text-light-grey/80 mt-1">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-white text-dark py-6 mt-4 font-mono text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-light-grey transition-colors duration-500 disabled:opacity-50"
      >
        {isProcessing ? "TRAITEMENT SÉCURISE..." : `CONFIRMER L'ACQUISITION — ${totalAmount} €`}
      </button>
    </form>
  )
}

// --- CHAMPS INPUT ---
const InputField = ({ label, name, type = "text", register, error, readOnly }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const { onBlur: rhfOnBlur, ...rest } = register(name);

  return (
    <div className="relative flex flex-col gap-2 group w-full">
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
          {...rest}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => { setIsFocused(false); rhfOnBlur(e); }}
          readOnly={readOnly}
          className={`w-full bg-transparent border-b border-light-grey/10 py-4 text-white text-sm outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:border-b focus:border-light-grey/10 font-light transition-colors duration-500 ${readOnly ? "opacity-40 cursor-not-allowed select-none" : ""}`}
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="absolute bottom-0 left-0 w-full h-px bg-white origin-left"
        />
      </div>
      {error && (
        <span className="absolute -bottom-5 text-red-400/60 text-[9px] uppercase tracking-widest">{error}</span>
      )}
    </div>
  )
}

const ShippingOption = ({ title, delay, price, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`relative flex items-center justify-between p-6 border transition-colors duration-500 cursor-pointer group ${isActive ? "border-white bg-white/[0.02]" : "border-light-grey/10 hover:border-light-grey/30"}`}
  >
    <div className="flex flex-col gap-1">
      <span className={`font-mono text-sm tracking-widest uppercase transition-colors duration-500 ${isActive ? "text-white" : "text-light-grey/60 group-hover:text-light-grey"}`}>
        {title}
      </span>
      <span className="font-mono text-[9px] text-light-grey/40 tracking-[0.2em]">{delay}</span>
    </div>
    <span className={`font-mono text-sm ${isActive ? "text-white" : "text-light-grey/60"}`}>{price}</span>
    {isActive && (
      <motion.div
        layoutId="shippingSelect"
        className="absolute left-0 top-0 w-[2px] h-full bg-white"
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      />
    )}
  </div>
)
