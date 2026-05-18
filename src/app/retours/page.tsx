"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function RetoursPage() {
  return (
    <div className="min-h-screen bg-dark text-light-grey px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-title text-5xl md:text-7xl italic text-white mb-6">Retours & Échanges</h1>

          <div className="space-y-12 text-sm font-light leading-relaxed mt-12">
            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Délai de rétractation</h2>
              <p>Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Conditions de retour</h2>
              <p>Pour être accepté, l'article retourné doit être dans son état d'origine, non porté, non lavé, avec toutes ses étiquettes attachées et dans son emballage d'origine. ORA TRIP se réserve le droit de refuser un retour si l'article présente des signes d'usure ou d'altération.</p>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Procédure</h2>
              <p>Pour initier un retour, veuillez nous contacter à contact@oratrip.fr en indiquant votre numéro de commande. Les frais de retour sont [à votre charge / offerts]. Une fois l'article reçu et inspecté, le remboursement sera effectué sous 7 jours ouvrés sur le moyen de paiement utilisé lors de l'achat.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}