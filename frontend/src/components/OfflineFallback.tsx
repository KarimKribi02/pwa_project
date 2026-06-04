'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Compass, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface OfflineFallbackProps {
  reason?: 'navigation' | 'data' | 'custom';
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({ reason = 'navigation' }) => {
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface px-6 text-center select-none py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl space-y-12"
      >
        {/* Animated Brand Emblem / Offline Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-secondary/5 border border-secondary/10"
          />
          <img 
            src="/logom.png" 
            alt="Menuiserie Digitale Logo" 
            className="w-14 h-14 object-contain relative z-10"
          />
          <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full border border-secondary/20 shadow-sm z-20 flex items-center justify-center">
            <WifiOff size={12} className="text-secondary" />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-4">
          <span className="text-secondary font-bold text-[9px] uppercase tracking-[0.5em] block">
            Atelier Atlas — Marrakech
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-primary italic leading-tight">
            Hors-Ligne temporaire
          </h1>
          <p className="text-sm text-stone-500 font-light max-w-md mx-auto leading-relaxed">
            {reason === 'navigation' 
              ? "Cette page requiert une connexion internet active pour charger les derniers modèles. Cependant, votre panier et vos commandes en cours restent sauvegardés."
              : "Nous ne parvenons pas à contacter nos serveurs. Vos créations ont été sécurisées en local et seront synchronisées dès le retour de votre connexion."}
          </p>
        </div>

        {/* Accent wood block line */}
        <div className="h-0.5 w-16 bg-secondary/30 mx-auto" />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="w-full sm:w-auto bg-primary hover:bg-[#22441D] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-widest"
          >
            <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
            <span>{isReloading ? 'Recherche réseau...' : 'Recharger la page'}</span>
          </button>
          
          <Link
            href="/catalog"
            className="w-full sm:w-auto bg-white hover:bg-stone-50 text-primary border border-primary/10 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md cursor-pointer text-xs uppercase tracking-widest"
          >
            <Compass size={14} className="text-secondary" />
            <span>Explorer le Catalogue</span>
          </Link>
        </div>

        {/* Mini Guide */}
        <p className="text-[10px] text-stone-400 font-medium tracking-wide">
          Note: Le suivi de commande et le catalogue précédemment visité sont consultables en mode hors-ligne.
        </p>
      </motion.div>
    </div>
  );
};

export default OfflineFallback;
