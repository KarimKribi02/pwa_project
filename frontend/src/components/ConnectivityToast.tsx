'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ConnectivityToastProps {
  type: 'online' | 'offline' | 'syncing' | 'success' | 'failed';
  message?: string;
  onClose: () => void;
}

const ConnectivityToast: React.FC<ConnectivityToastProps> = ({ type, message, onClose }) => {
  // Auto-close transient statuses after 4 seconds
  useEffect(() => {
    if (type === 'online' || type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const config = {
    online: {
      bg: 'bg-white/95 border-emerald-500/20 text-emerald-950',
      icon: <Wifi size={18} className="text-emerald-600" />,
      title: 'Connexion Rétablie',
      desc: 'Vous êtes de retour en ligne.',
    },
    offline: {
      bg: 'bg-white/95 border-amber-500/20 text-amber-950',
      icon: <WifiOff size={18} className="text-amber-600 animate-pulse" />,
      title: 'Mode Hors-Ligne',
      desc: 'L\'Atelier reste accessible. Vos commandes seront synchronisées dès le retour du réseau.',
    },
    syncing: {
      bg: 'bg-white/95 border-primary/20 text-primary',
      icon: <RefreshCw size={18} className="text-primary animate-spin" />,
      title: 'Synchronisation',
      desc: message || 'Transmission de vos créations en cours...',
    },
    success: {
      bg: 'bg-white/95 border-emerald-500/20 text-emerald-950',
      icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      title: 'Synchronisé !',
      desc: message || 'Vos commandes ont été transmises à l\'atelier.',
    },
    failed: {
      bg: 'bg-white/95 border-red-500/20 text-red-950',
      icon: <AlertTriangle size={18} className="text-red-600" />,
      title: 'Erreur Sync',
      desc: message || 'Certaines commandes n\'ont pas pu être synchronisées.',
    }
  };

  const current = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-[1.5rem] border p-5 shadow-2xl backdrop-blur-md flex items-start gap-4 ${current.bg}`}
    >
      <div className="p-2.5 bg-stone-100 rounded-xl shrink-0">
        {current.icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest font-sans">{current.title}</h4>
        <p className="text-[11px] text-stone-500 font-medium leading-normal">{current.desc}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 hover:text-stone-700 cursor-pointer self-start"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default ConnectivityToast;
