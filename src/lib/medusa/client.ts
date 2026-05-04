import Medusa from "@medusajs/medusa-js";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string;

if (!PUBLISHABLE_KEY) {
  console.error("Clé de publication Medusa manquante. L'accès à la galerie est rompu.");
}

// Initialisation de l'instance Medusa qui sera utilisée dans tous nos services
export const medusaClient = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
  publishableApiKey: PUBLISHABLE_KEY,
});