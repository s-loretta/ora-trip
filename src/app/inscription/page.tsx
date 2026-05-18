"use client"
// src/app/inscription/page.tsx

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useUserStore } from "@/store/useUserStore"

// --- SCHÉMA DE VALIDATION ---
const registerSchema = z
  .object({
    firstName: z.string().min(1, "Requis."),
    lastName: z.string().min(1, "Requis."),
    email: z.string().email("Format invalide."),
    phone: z.string().min(10, "Format invalide."),
    password: z.string().min(8, "8 caractères minimum."),
    confirmPassword: z.string(),
    address_secondary: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe diffèrent.",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// --- DESIGN SYSTEM ---
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const textRevealVariants: Variants = {
  hidden: { opacity: 0, y: "120%", filter: "blur(10px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 1.2, ease: LUXURY_EASE },
  },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: LUXURY_EASE } },
}

const shakeVariants = {
  shake: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.4 } },
}

// --- CONTENU (isolé pour useSearchParams) ---
const RegisterFormContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get("redirect") || "/compte"

  const { register: registerUser, checkSession, isAuthenticated, clearError } = useUserStore()
  const [focusedField, setFocusedField] = useState<keyof RegisterFormData | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  useEffect(() => {
    checkSession().finally(() => setSessionChecked(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionChecked && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [sessionChecked, isAuthenticated, router, redirectTo])

  const onSubmit = async (data: RegisterFormData) => {
    if (data.address_secondary) return
    setServerError(null)
    clearError()

    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      })

      router.push(redirectTo)
    } catch (error: any) {
      const isExistingEmail =
        error?.message?.includes("already exists") || error?.message?.includes("déjà")
      setServerError(
        isExistingEmail
          ? "Cet email est deja utilisé par un compte."
          : "Une erreur est survenue. Veuillez réessayer."
      )
    }
  }

  const hasError = Object.keys(errors).length > 0 || !!serverError
  const isRedirecting = sessionChecked && isAuthenticated

  // ✅ CORRECTION ICI : Aucun 'return' conditionnel qui masque la structure.
  // Toute l'interface est toujours affichée.
  return (
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start relative">
      
      {/* OVERLAY DE CHARGEMENT (Apparaît si on vérifie la session ou si on redirige) */}
      {(!sessionChecked || isRedirecting) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm rounded-lg">
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase font-mono"
          >
            {isRedirecting ? "Redirection..." : "Vérification..."}
          </motion.div>
        </div>
      )}

      {/* COLONNE GAUCHE (Maintenant toujours visible instantanément) */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <motion.span variants={fadeUpVariants} className="text-[10px] tracking-[0.8em] text-light-grey/40 uppercase">
            Membre
          </motion.span>
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
            <Link
              href={`/connexion${redirectTo !== "/compte" ? `?redirect=${redirectTo}` : ""}`}
              className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-500 hover:tracking-[0.4em]"
            >
              [ Déjà inscrit ? Se connecter ]
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* COLONNE DROITE : FORMULAIRE */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          animate={hasError ? "shake" : ""}
          variants={shakeVariants}
          className="flex flex-col gap-10"
        >
          <input type="text" {...register("address_secondary")} className="hidden" tabIndex={-1} aria-hidden="true" />

          <div className="grid grid-cols-2 gap-10">
            <InputField label="Prénom" name="firstName" register={register} error={errors.firstName?.message}
              isFocused={focusedField === "firstName"} onFocus={() => setFocusedField("firstName")} onBlur={() => setFocusedField(null)} />
            <InputField label="Nom" name="lastName" register={register} error={errors.lastName?.message}
              isFocused={focusedField === "lastName"} onFocus={() => setFocusedField("lastName")} onBlur={() => setFocusedField(null)} />
          </div>

          <InputField label="Email de correspondance" name="email" type="email" register={register} error={errors.email?.message}
            isFocused={focusedField === "email"} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />

          <InputField label="Téléphone" name="phone" type="tel" register={register} error={errors.phone?.message}
            isFocused={focusedField === "phone"} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} />

          <InputField label="Mot de passe" name="password" type="password" register={register} error={errors.password?.message}
            isFocused={focusedField === "password"} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} />

          <InputField label="Confirmer le mot de passe" name="confirmPassword" type="password" register={register} error={errors.confirmPassword?.message}
            isFocused={focusedField === "confirmPassword"} onFocus={() => setFocusedField("confirmPassword")} onBlur={() => setFocusedField(null)} />

          <motion.div variants={fadeUpVariants} className="pt-8 flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !sessionChecked}
              className="group relative inline-flex items-center gap-6 cursor-pointer w-max disabled:opacity-50"
            >
              <span className="font-title text-2xl md:text-3xl tracking-widest text-white group-hover:italic transition-all duration-500">
                {isSubmitting ? "TRAITEMENT..." : "CREER LE COMPTE"}
              </span>
              <motion.div
                initial={{ width: "3rem" }}
                whileHover={{ width: "6rem" }}
                transition={{ ease: LUXURY_EASE, duration: 0.8 }}
                className="h-px bg-white"
              />
            </button>

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
  )
}

// --- PAGE PRINCIPALE (wrap Suspense pour useSearchParams) ---
const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-dark text-light-grey selection:bg-white selection:text-dark px-6 md:px-20 py-32 flex items-center justify-center font-mono">
      <Suspense fallback={
        <div className="text-[10px] tracking-widest text-white/50 uppercase">Chargement de l'archive...</div>
      }>
        <RegisterFormContent />
      </Suspense>
    </div>
  )
}

// --- COMPOSANT INPUT ATOMIQUE ---
const InputField = ({
  label, name, type = "text", register, error, isFocused, onFocus, onBlur,
}: {
  label: string; name: string; type?: string; register: any
  error?: string; isFocused: boolean; onFocus: () => void; onBlur: () => void
}) => (
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
)

export default RegisterPage