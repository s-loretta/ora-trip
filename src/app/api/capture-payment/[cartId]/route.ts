import { sdk } from "@/lib/sdk"
import { NextRequest, NextResponse } from "next/server"

type Params = Promise<{ cartId: string }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { cartId } = await params
  const { origin, searchParams } = req.nextUrl

  const paymentIntent = searchParams.get("payment_intent")
  const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")
  const redirectStatus = searchParams.get("redirect_status") || ""

  // Récupérer le panier pour valider la session de paiement
  const { cart } = await sdk.store.cart.retrieve(cartId, {
    fields: "+payment_collection.payment_sessions.*"
  })

  if (!cart) {
    return NextResponse.redirect(`${origin}/shop`)
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (p: any) => p.data.id === paymentIntent
  )

  // Validation de sécurité : client_secret + statut redirect
  if (
    !paymentSession ||
    paymentSession.data.client_secret !== paymentIntentClientSecret ||
    !["pending", "succeeded"].includes(redirectStatus)
  ) {
    return NextResponse.redirect(`${origin}/checkout?error=payment_failed`)
  }

  // ✅ L'unique endroit qui crée la commande Medusa
  const response = await sdk.store.cart.complete(cartId)

  if (response.type !== "order") {
    return NextResponse.redirect(`${origin}/checkout?error=order_failed`)
  }

  const formatOrderId = `ORA-00${response.order.display_id}`;
  
  return NextResponse.redirect(
    `${origin}/checkout/success?order_ref=${formatOrderId}`
  );
}