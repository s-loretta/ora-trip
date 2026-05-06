import { create } from 'zustand';
import { medusaClient } from '@/lib/medusa/client'; // Ajuste le chemin selon ton arborescence

// --- 1. TYPAGE STRICT ---
// On s'aligne sur les types réels renvoyés par @medusajs/medusa-js
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  has_account: boolean;
  created_at: Date | string; // Accepte Date (Medusa) ou string (sérialisation JSON potentielle)
  updated_at: Date | string;
}

interface UserState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Méthodes
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// --- 2. CRÉATION DU STORE ---
export const useUserStore = create<UserState>((set) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: true, // true par défaut pour vérifier au chargement initial
  error: null,

  clearError: () => set({ error: null }),

  // Vérifie si l'utilisateur a un cookie valide (à appeler dans un useEffect global)
  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const { customer } = await medusaClient.auth.getSession();
      
      // Conversion 'unknown' pour forcer l'override de type si les objets diffèrent trop
      // (Une sécurité supplémentaire courante avec Zustand et des SDKs externes)
      set({ 
        customer: (customer as unknown) as Customer, 
        isAuthenticated: !!customer, 
        isLoading: false 
      });
    } catch (error) {
      // Si la requête échoue (ex: 401 Unauthorized), la session n'existe pas ou est expirée
      set({ customer: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Connexion
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { customer } = await medusaClient.auth.authenticate({ email, password });
      
      set({ 
        customer: (customer as unknown) as Customer, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      // On catch l'erreur pour la UI
      set({ 
        error: "Accès refusé. Vérifiez vos identifiants.", 
        isLoading: false 
      });
      throw error; // On throw pour permettre au composant de déclencher l'animation "shake"
    }
  },

  // Déconnexion
  logout: async () => {
    set({ isLoading: true });
    try {
      await medusaClient.auth.deleteSession();
      set({ customer: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Erreur de déconnexion", error);
      set({ error: "Échec de la déconnexion.", isLoading: false });
    }
  }
}));