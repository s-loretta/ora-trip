// src/services/checkout.service.ts
import { sdk } from "@/lib/sdk"

export interface ShippingData {
  first_name: string
  last_name: string
  address_1: string
  city: string
  postal_code: string
  country_code: string
  email: string
  phone?: string
}

export const CheckoutService = {

  // Fonction de sauvegarde d'adresse
  async saveAddressToCustomerIfNeeded(addressPayload: any) {
    try {
      const { customer } = await sdk.store.customer.retrieve({
        fields: "id,*addresses" 
      });

      if (!customer) return; 

      const addressExists = customer.addresses?.some((addr: any) => 
        addr.address_1.toLowerCase() === addressPayload.address_1.toLowerCase() &&
        addr.postal_code === addressPayload.postal_code
      );

      if (!addressExists) {
        await sdk.store.customer.createAddress({
          address_name: "Nouvelle Adresse",
          first_name: addressPayload.first_name,
          last_name: addressPayload.last_name,
          address_1: addressPayload.address_1,
          city: addressPayload.city,
          postal_code: addressPayload.postal_code,
          country_code: addressPayload.country_code,
          phone: addressPayload.phone || ""
        });
      }
    } catch (error) {
      console.warn("Information : L'adresse n'a pas pu être sauvegardée sur le compte.", error);
    }
  },

  async syncCartAndAddress(cartId: string | null, shippingData: ShippingData) {
    try {
      if (!cartId) throw new Error("Votre session de commande a expiré.");

      const pureAddressPayload = {
        first_name: shippingData.first_name,
        last_name: shippingData.last_name,
        address_1: shippingData.address_1,
        city: shippingData.city,
        postal_code: shippingData.postal_code,
        country_code: shippingData.country_code,
        phone: shippingData.phone 
      }

      // ⚡️ OPTIMISATION 1 : Sauvegarde en arrière-plan (Non-bloquant)
      // En retirant le 'await', la page n'attend plus que l'adresse soit sauvegardée dans le profil pour continuer.
      // Cela fait gagner environ 1.5 à 2 secondes de chargement pur !
      this.saveAddressToCustomerIfNeeded(pureAddressPayload).catch(console.error);

      // ⚡️ On met à jour le panier IMMÉDIATEMENT
      const { cart: updatedCart } = await sdk.store.cart.update(cartId, {
        email: shippingData.email,
        shipping_address: pureAddressPayload,
      })
      
      return updatedCart
    } catch (error) {
      console.error("Erreur de synchronisation :", error)
      throw new Error("Impossible de valider la destination.")
    }
  },

  async getShippingOptions(cartId: string) {
    try {
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
        cart_id: cartId,
      })
      return shipping_options || []
    } catch (error) {
      console.error("Erreur options de livraison :", error)
      throw new Error("Impossible de charger les modes de livraison.")
    }
  },

  async initializePayment(cartId: string, shippingOptionId: string) {
    try {
      // ⚡️ OPTIMISATION 2 : addShippingMethod nous renvoie déjà le panier mis à jour !
      const { cart } = await sdk.store.cart.addShippingMethod(cartId, {
        option_id: shippingOptionId,
      })

      // ⚡️ OPTIMISATION 3 : On supprime la requête 'retrieve' inutile (Gain: ~1 seconde).
      // On passe directement le 'cart' qu'on vient de recevoir à Stripe.
      const { payment_collection } = await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: "pp_stripe_stripe",
      })

      const stripeSession = payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === "pp_stripe_stripe"
      )

      if (!stripeSession?.data?.client_secret) {
        throw new Error("L'intégration Stripe n'a pas renvoyé de clé de chiffrement.")
      }

      return stripeSession.data.client_secret as string
    } catch (error) {
      console.error("Erreur initialisation paiement :", error)
      throw new Error("Le module de paiement sécurisé est indisponible.")
    }
  },

  async completeCart(cartId: string) {
    try {
      const response = await sdk.store.cart.complete(cartId)

      if (response.type === "cart") {
        const reason = (response as any).error || "Paiement non autorisé par Medusa."
        console.error("[completeCart] Échec :", reason)
        throw new Error(reason)
      }

      return response
    } catch (error: any) {
      console.error("[completeCart] Erreur :", error)
      throw new Error(error.message || "Impossible de finaliser la commande.")
    }
  },
}