'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Compass, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { isCatalogCached } from '@/services/catalogSync';
import { db } from '@/services/db';

interface OfflineFallbackProps {
  reason?: 'navigation' | 'data' | 'custom';
}

const OfflineFallback: React.FC<OfflineFallbackProps> = ({ reason = 'navigation' }) => {
  const [isReloading, setIsReloading] = useState(false);
  const [hasCatalog, setHasCatalog] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Logo: on force un "pré-chargement" visuel côté UI.
  // Le SW doit aussi être capable de le servir offline (image en cache).
  const logoSrc = useMemo(() => '/logom.png', []);

  useEffect(() => {
    isCatalogCached().then(setHasCatalog);
    db.pendingOrders
      .where('status')
      .anyOf(['pending', 'failed'])
      .count()
      .then(setPendingCount);

    // Précharge le logo dans le cache HTTP du navigateur (si possible)
    // pour éviter un "flash" si l’image arrive tard.
    const img = new Image();
    img.src = logoSrc;
  }, [logoSrc]);

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface px-6 text-center select-none py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/70 backdrop-blur-sm shadow-sm border border-stone-200/60" />
            <img
              src={logoSrc}
              alt="Menuiserie Digitale"
              className="relative w-14 h-14 object-contain"
              draggable={false}
            />

            <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full border shadow-sm">
              <WifiOff size={12} className="text-secondary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif text-primary italic font-semibold">
              Hors-Ligne temporaire
            </h1>
            <p className="text-sm text-stone-500 font-light max-w-md mx-auto leading-relaxed">
              {reason === 'navigation'
                ? 'Cette page nécessite une connexion. Votre panier et vos commandes en attente restent sauvegardés.'
                : 'Impossible de contacter le serveur. Vos commandes seront synchronisées au retour du réseau.'}
            </p>
            {pendingCount > 0 && (
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                {pendingCount} commande(s) en attente de synchronisation
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
              <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                Connexion interrompue
              </p>
            </div>
            <p className="mt-2 text-xs text-stone-500 leading-relaxed">
              Vous pouvez continuer à explorer les créations, et vos commandes seront transmises automatiquement dès
              que le réseau revient.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
              {isReloading ? 'Recherche réseau...' : 'Recharger'}
            </button>

            {hasCatalog && (
              <Link
                href="/catalog"
                className="w-full sm:w-auto bg-white text-primary border border-primary/10 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors shadow-sm"
              >
                <Compass size={14} className="text-secondary" />
                Catalogue hors ligne
              </Link>
            )}

            <Link
              href="/suivi"
              className="w-full sm:w-auto bg-white text-primary border border-primary/10 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors shadow-sm"
            >
              Mes commandes
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflineFallback;

