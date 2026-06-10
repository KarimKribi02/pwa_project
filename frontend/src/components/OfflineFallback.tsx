'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    isCatalogCached().then(setHasCatalog);
    db.pendingOrders
      .where('status')
      .anyOf(['pending', 'failed'])
      .count()
      .then(setPendingCount);
  }, []);

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface px-6 text-center select-none py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl space-y-12"
      >
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <img src="/logom.png" alt="Menuiserie Digitale" className="w-14 h-14 object-contain" />
          <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full border shadow-sm">
            <WifiOff size={12} className="text-secondary" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif text-primary italic">Hors-Ligne temporaire</h1>
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleReload}
            disabled={isReloading}
            className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
            {isReloading ? 'Recherche réseau...' : 'Recharger'}
          </button>

          {hasCatalog && (
            <Link
              href="/catalog"
              className="w-full sm:w-auto bg-white text-primary border border-primary/10 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            >
              <Compass size={14} className="text-secondary" />
              Catalogue hors ligne
            </Link>
          )}

          <Link
            href="/suivi"
            className="w-full sm:w-auto bg-white text-primary border border-primary/10 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
          >
            Mes commandes
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflineFallback;
