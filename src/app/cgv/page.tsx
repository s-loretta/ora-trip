"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-dark text-light-grey px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-title text-5xl md:text-7xl italic text-white mb-6">Conditions Générales de Vente</h1>
          <p className="text-[10px] tracking-widest uppercase text-light-grey/60 mb-12">Dernière mise à jour : Mai 2026</p>

          <div className="space-y-12 text-sm font-light leading-relaxed">
            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">1. Objet</h2>
              <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ORA TRIP (ci-après "le Vendeur") et toute personne effectuant un achat (ci-après "le Client") sur le site www.oratrip.fr.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">2. Produits et Disponibilité</h2>
              <p>ORA TRIP propose des articles d'archive et des pièces exclusives. Chaque article est décrit avec la plus grande précision possible. L'offre de produits est valable dans la limite des stocks disponibles. En cas d'indisponibilité après passation de commande, le Client sera informé et remboursé intégralement.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">3. Prix</h2>
              <p>Les prix de nos produits sont indiqués en euros (€), toutes taxes comprises (TTC), hors frais de traitement et d'expédition. ORA TRIP se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">4. Paiement</h2>
              <p>Le règlement des achats s'effectue par carte bancaire via la plateforme sécurisée Stripe. La commande ne sera expédiée qu'après confirmation de l'encaissement du règlement.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">5. Livraison</h2>
              <p>Les produits sont livrés à l'adresse de livraison indiquée lors du processus de commande. Les délais de livraison indiqués sont estimatifs. ORA TRIP ne saurait être tenu responsable des retards de livraison imputables au transporteur.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}