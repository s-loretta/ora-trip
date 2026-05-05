// src/utils/formatPrice.ts

/**
 * Formate un montant (généralement en centimes) en un format monétaire européen.
 * @param amount Le montant à formater (ex: 7500 pour 75€, ou 75000 si ton backend renvoie déjà par 1000)
 * @param currencyCode Le code de la devise (par défaut 'EUR')
 * @returns Une chaîne formatée (ex: "75 €" ou "75,00 €")
 */
export const formatPrice = (amount: number, currencyCode: string = 'EUR') => {
  // --- AJUSTEMENT DE SÉCURITÉ ---
  // Si ton backend (ou Medusa plus tard) te renvoie VRAIMENT 75000 au lieu de 7500, 
  // tu devras diviser par 1000 ici.
  // Standard (Medusa/Stripe) : division par 100.
  const valueInUnits = amount / 100; // Transforme 7500 en 75

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2,
  }).format(valueInUnits);
};