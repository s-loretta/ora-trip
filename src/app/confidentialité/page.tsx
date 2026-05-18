"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-dark text-light-grey px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-title text-5xl md:text-7xl italic text-white mb-6">Confidentialité</h1>

          <div className="space-y-12 text-sm font-light leading-relaxed mt-12">
            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Protection de vos données</h2>
              <p>ORA TRIP s'engage à ce que la collecte et le traitement de vos données soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Données collectées</h2>
              <p>Nous collectons les données strictement nécessaires au traitement de vos commandes et à la gestion de votre compte : nom, prénom, adresse e-mail, adresse postale, numéro de téléphone et historique d'achats. Les données de paiement sont traitées de manière sécurisée et chiffrée par notre partenaire Stripe et ne sont jamais stockées sur nos serveurs.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Vos Droits</h2>
              <p>Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Vous pouvez exercer ces droits depuis votre Espace Client, ou en nous contactant à : contact@oratrip.fr.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}