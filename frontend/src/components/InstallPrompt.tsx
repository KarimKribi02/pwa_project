'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, WifiOff, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'menuiserie_install_prompt_seen';

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const seen = localStorage.getItem(STORAGE_KEY);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (!seen && !standalone) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 bg-white rounded-[2rem] shadow-2xl border border-primary/10 p-6"
        >
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>

          <h3 className="text-lg font-serif text-primary italic mb-3 pr-8">
            Installer Menuiserie Digitale
          </h3>

          <ul className="space-y-2 mb-5 text-[11px] text-stone-500">
            <li className="flex items-center gap-2">
              <WifiOff size={14} className="text-amber-600 shrink-0" />
              Consultez le catalogue hors ligne
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw size={14} className="text-primary shrink-0" />
              Vos commandes se synchronisent automatiquement
            </li>
          </ul>

          {isIOS && !deferredPrompt ? (
            <p className="text-[10px] text-stone-400 mb-4 leading-relaxed">
              Sur iOS : touchez Partager → « Sur l&apos;écran d&apos;accueil » pour installer l&apos;app.
            </p>
          ) : null}

          <div className="flex gap-3">
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Installer
              </button>
            )}
            <button
              onClick={dismiss}
              className="flex-1 border border-primary/20 text-primary py-3 rounded-full text-[10px] font-bold uppercase tracking-widest"
            >
              Plus tard
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
