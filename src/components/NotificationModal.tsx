"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function NotificationModal() {
  const { isOpen, message, hideNotification } = useNotificationStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center pointer-events-none px-4 w-full md:w-auto"
        >
          {/* La boîte de notification */}
          <div className="bg-dark/90 border border-light-grey/20 px-8 py-5 flex items-center gap-6 shadow-2xl backdrop-blur-md">
            {/* Petit point clignotant pour attirer l'œil subtilement */}
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white">
              {message}
            </span>
            
            {/* Bouton pour fermer manuellement si l'utilisateur est pressé */}
            <button 
              onClick={hideNotification} 
              className="pointer-events-auto text-[9px] text-light-grey/40 hover:text-white transition-colors ml-4 uppercase tracking-[0.2em]"
            >
              [ X ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}