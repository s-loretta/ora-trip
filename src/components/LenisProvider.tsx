"use client";

import React from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  
  // La prop "root" indique à Lenis de prendre le contrôle de la page entière
  return (
    <ReactLenis root options={{ 
      lerp: 0.08,        // Contrôle l'inertie (0.05 à 0.12 idéal pour le luxe)
      duration: 1.5,     // Durée du glissement
      smoothWheel: true, // Active la fluidité à la souris
    }}>
      {children}
    </ReactLenis>
  );
}