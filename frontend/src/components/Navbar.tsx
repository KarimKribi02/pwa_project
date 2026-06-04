'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Check if the app is running in standalone mode (installed app context)
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsInstalled(!!isStandalone);
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // Hide Navbar on Admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // On other pages, we always want the "scrolled" (opaque) look
  const isOpaque = !isHome || scrolled;

  return (
    <header 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full transition-all duration-500 w-[95%] max-w-7xl px-8 py-3 flex justify-between items-center backdrop-blur-md ${
        isOpaque 
          ? "bg-[#fcf9f3]/80 shadow-xl border border-[#2D5A27]/10 py-3" 
          : "bg-white/10 border border-white/20 py-4"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <img 
          src="/logom.png" 
          alt="Menuiserie Digitale" 
          className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg transition-transform duration-300 group-hover:rotate-6"
        />
        <span className={`font-serif text-lg md:text-xl tracking-tight hidden sm:block transition-colors duration-300 ${
          isOpaque ? "text-primary font-bold" : "text-white"
        }`}>
          Menuiserie Digitale
        </span>
      </Link>
      
      <nav className={`flex items-center gap-6 md:gap-8 font-sans text-[10px] md:text-xs uppercase tracking-[0.1em] font-medium transition-colors duration-300 ${
        isOpaque ? "text-primary" : "text-white/90"
      }`}>
        <Link href="/catalog" className="hover:text-secondary transition-colors">Atelier</Link>
        <Link href="/about" className="hover:text-secondary transition-colors">À Propos</Link>
        <Link href="/suivi" className="hover:text-secondary transition-colors">Suivi</Link>
        <Link href="/contact" className="hover:text-secondary transition-colors">Contact</Link>
      </nav>
 
      <div className="flex items-center gap-3">
        {deferredPrompt && !isInstalled && (
          <button 
            onClick={handleInstallClick}
            className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded-full border flex items-center gap-2 ${
              isOpaque
                ? "bg-transparent text-[#2D5A27] border-[#2D5A27] hover:bg-[#2D5A27]/5" 
                : "bg-white/10 text-white border-white/30 hover:bg-white/20"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Installer
          </button>
        )}
        <Link 
          href="/admin/login"
          className={`px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded-full border ${
            isOpaque
              ? "bg-[#2D5A27] text-white border-[#2D5A27] hover:bg-[#22441D] shadow-lg shadow-[#2D5A27]/15" 
              : "bg-white/20 text-white border-white/40 hover:bg-white/30"
          }`}
        >
          Connexion
        </Link>
      </div>
    </header>
  );
}
