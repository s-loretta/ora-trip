"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-dark text-light-grey px-6 md:px-20 pt-40 pb-32 font-mono">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-title text-5xl md:text-7xl italic text-white mb-6">Mentions Légales</h1>

          <div className="space-y-12 text-sm font-light leading-relaxed mt-12">
            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Éditeur du site</h2>
              <p>Le site ORA TRIP (www.oratrip.fr) est édité par :</p>
              <ul className="mt-4 space-y-2">
                <li><strong>Nom / Société :</strong> [TON NOM OU NOM DE TON ENTREPRISE]</li>
                <li><strong>Statut juridique :</strong> [EX: Auto-entrepreneur, SASU, SAS...]</li>
                <li><strong>Adresse :</strong> [TON ADRESSE COMPLÈTE]</li>
                <li><strong>SIRET :</strong> [TON NUMÉRO DE SIRET]</li>
                <li><strong>Email de contact :</strong> contact@oratrip.fr</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Hébergement</h2>
              <p>Le site est hébergé par :</p>
              <ul className="mt-4 space-y-2">
                <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, USA</li>
                <li><strong>Site web :</strong> vercel.com</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-white mb-4 uppercase tracking-widest">Propriété Intellectuelle</h2>
              <p>L'ensemble des éléments figurant sur le site ORA TRIP (textes, images, photographies, logos, charte graphique) sont protégés par le droit d'auteur et la propriété intellectuelle. Toute reproduction, totale ou partielle, est strictement interdite sans autorisation préalable.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}