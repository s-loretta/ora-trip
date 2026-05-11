// src/services/checkout.service.ts
import { sdk } from "@/lib/sdk"; 

export interface ShippingData {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string; // Ex: 'fr'
  email: string;
}

export const CheckoutService = {
  /**
   * Étape 1 & 2 : Crée le panier Medusa (s'il n'existe pas) et met à jour l'adresse.
   */
  async syncCartAndAddress(localItems: any[], shippingData: ShippingData, existingCartId?: string) {
    try {
      let cart;

      // ✅ CORRECTIF : On crée un objet purement dédié à l'adresse (sans l'email)
      const pureAddressPayload = {
        first_name: shippingData.first_name,
        last_name: shippingData.last_name,
        address_1: shippingData.address_1,
        city: shippingData.city,
        postal_code: shippingData.postal_code,
        country_code: shippingData.country_code,
      };

      if (!existingCartId) {
        // 1. Création du panier via SDK V2
        const { cart: newCart } = await sdk.store.cart.create({
          items: localItems.map(item => ({
            variant_id: item.variantId, // L'ID du variant Medusa
            quantity: item.quantity
          })),
          email: shippingData.email, // L'email va au niveau du panier
          shipping_address: pureAddressPayload, // 👈 L'adresse purifiée
        });
        cart = newCart;
      } else {
        // 2. Mise à jour si le panier existe déjà via SDK V2
        const { cart: updatedCart } = await sdk.store.cart.update(existingCartId, {
          email: shippingData.email, // L'email va au niveau du panier
          shipping_address: pureAddressPayload, // 👈 L'adresse purifiée
        });
        cart = updatedCart;
      }

      return cart;
    } catch (error) {
      console.error("Erreur de synchronisation de l'archive :", error);
      throw new Error("Impossible de valider la destination.");
    }
  },

  

  async getShippingOptions(cartId: string) {
    try {
      // ✅ La méthode officielle et typée ! 
      // Le Fulfillment Module croise l'adresse de ton panier (ex: "fr") 
      // avec tes Service Zones ("Europe") pour te renvoyer les bonnes options.
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
        cart_id: cartId,
      });
      
      return shipping_options || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des modes de livraison :", error);
      throw new Error("Impossible de charger les modes de livraison.");
    }
  },
  /**
   * Étape 3 & 4 : Ajoute la méthode de livraison et initialise Stripe
   */
  async initializePayment(cartId: string, shippingOptionId: string) {
    try {
      await sdk.store.cart.addShippingMethod(cartId, {
        option_id: shippingOptionId,
      });

      const { cart } = await sdk.store.cart.retrieve(cartId);

      // 1. On demande le bon ID à Medusa
      const { payment_collection } = await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe", // ✅ CORRECTION ICI
      });

      // 2. On cherche le bon ID dans la réponse
      const stripeSession = payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === "pp_stripe_stripe" // ✅ CORRECTION ICI
      );

      if (!stripeSession || !stripeSession.data?.client_secret) {
        throw new Error("L'intégration Stripe n'a pas renvoyé de clé de chiffrement.");
      }

      return stripeSession.data.client_secret as string;
    } catch (error) {
      console.error("Erreur d'initialisation du paiement :", error);
      throw new Error("Le module de paiement sécurisé est indisponible.");
    }
  }
};