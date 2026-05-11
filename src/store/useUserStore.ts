// src/store/useUserStore.ts
// Implémentation selon https://docs.medusajs.com/resources/storefront-development/customers/register

import { create } from "zustand"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { sdk } from "@/lib/sdk"

// On utilise le type officiel Medusa plutôt qu'une interface custom
export type Customer = HttpTypes.StoreCustomer

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

interface UserState {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  register: (data: RegisterPayload) => Promise<void>
  checkSession: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  // --- INSCRIPTION ---
  // Flow exact selon https://docs.medusajs.com/resources/storefront-development/customers/register
  register: async (data: RegisterPayload) => {
    set({ isLoading: true, error: null })
    try {
      // Étape 1 : Obtenir le token de registration via le SDK
      // Le SDK appelle POST /auth/customer/emailpass/register
      try {
        await sdk.auth.register("customer", "emailpass", {
          email: data.email,
          password: data.password,
        })
      } catch (error) {
        const fetchError = error as FetchError

        // Cas spécial doc : une identité admin avec le même email existe déjà
        // → on tente un login pour récupérer un token valide à la place
        if (
          fetchError.statusText === "Unauthorized" ||
          fetchError.message === "Identity with email already exists"
        ) {
          const loginResponse = await sdk.auth
            .login("customer", "emailpass", {
              email: data.email,
              password: data.password,
            })
            .catch(() => null)

          if (!loginResponse || typeof loginResponse !== "string") {
            throw new Error("Cet email est déjà utilisé avec un mot de passe différent.")
          }
          // loginResponse est le token → le SDK l'a stocké, on continue
        } else {
          throw new Error(fetchError.message || "Erreur lors de la création du compte.")
        }
      }

      // Étape 2 : Créer le profil client
      // Le SDK appelle POST /store/customers avec le Bearer token automatiquement
      const { customer } = await sdk.store.customer.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        ...(data.phone ? { phone: data.phone } : {}),
      })

      set({ customer, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      const message = error instanceof FetchError
        ? error.message
        : error?.message || "Erreur inattendue."
      set({ error: message, isLoading: false })
      throw error
    }
  },

  // --- CONNEXION ---
  // Flow selon https://docs.medusajs.com/resources/storefront-development/customers/login
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // Le SDK appelle POST /auth/customer/emailpass et stocke le JWT
      const result = await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })

      // Si result est un objet avec location → auth tierce partie (hors scope)
      if (typeof result !== "string") {
        throw new Error("Méthode d'authentification non supportée.")
      }

      // Récupération du profil connecté
      const { customer } = await sdk.store.customer.retrieve()

      set({ customer, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      const message = error instanceof FetchError
        ? "Accès refusé. Vérifiez vos identifiants."
        : error?.message || "Erreur de connexion."
      set({ error: message, isLoading: false })
      throw error
    }
  },

  // --- VÉRIFICATION DE SESSION ---
  checkSession: async () => {
    set({ isLoading: true, error: null })
    try {
      // Le SDK envoie automatiquement le JWT stocké dans localStorage
      const { customer } = await sdk.store.customer.retrieve()
      set({ customer, isAuthenticated: !!customer, isLoading: false })
    } catch {
      // 401 → session absente ou expirée, état neutre
      set({ customer: null, isAuthenticated: false, isLoading: false })
    }
  },

  // --- DÉCONNEXION ---
  // Selon https://docs.medusajs.com/resources/storefront-development/customers/log-out
  logout: async () => {
    set({ isLoading: true })
    
    try {
      // 1. On prévient le serveur Medusa pour qu'il invalide la session côté backend
      await sdk.auth.logout() 
    } catch (error) {
      // 2. Si le serveur répond 401 (déjà expiré), on intercepte l'erreur silencieusement
      console.warn("La session serveur était déjà expirée ou introuvable.");
    } finally {
      // 3. QUOI QU'IL ARRIVE : On purge le frontend pour garantir la déconnexion visuelle
      set({ customer: null, isAuthenticated: false, isLoading: false })
    }
  }
}))