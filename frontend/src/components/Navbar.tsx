'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useConnectivity } from './ConnectivityProvider';

const NAV_LINKS = [
  { href: '/catalog', label: 'Atelier' },
  { href: '/about', label: 'À Propos' },
  { href: '/suivi', label: 'Suivi', badge: true },
  { href: '/contact', label: 'Contact' },
] as const;

export default function Navbar() {
  const { pendingOrdersCount } = useConnectivity();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone;
      setIsInstalled(!!isStandalone);
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as typeof deferredPrompt);
      setIsInstalled(false);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    setMobileOpen(false);
  };

  if (pathname.startsWith('/admin')) return null;

  const isOpaque = !isHome || scrolled;

  const shellClass = isOpaque
    ? 'bg-[#fcf9f3]/90 shadow-xl border-[#2D5A27]/10'
    : 'bg-white/10 border-white/20';

  const textClass = isOpaque ? 'text-primary' : 'text-white';
  const mutedClass = isOpaque ? 'text-primary/90' : 'text-white/90';

  const installBtnClass = isOpaque
    ? 'bg-transparent text-[#2D5A27] border-[#2D5A27] hover:bg-[#2D5A27]/5'
    : 'bg-white/10 text-white border-white/30 hover:bg-white/20';

  const loginBtnClass = isOpaque
    ? 'bg-[#2D5A27] text-white border-[#2D5A27] hover:bg-[#22441D] shadow-lg shadow-[#2D5A27]/15'
    : 'bg-white/20 text-white border-white/40 hover:bg-white/30';

  const NavLink = ({
    href,
    label,
    showBadge,
    onClick,
    className = '',
  }: {
    href: string;
    label: string;
    showBadge?: boolean;
    onClick?: () => void;
    className?: string;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`relative whitespace-nowrap hover:text-secondary transition-colors ${mutedClass} ${className}`}
    >
      {label}
      {showBadge && pendingOrdersCount > 0 && (
        <span className="absolute -top-2 -right-3 min-w-[1rem] h-4 px-1 bg-amber-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
          {pendingOrdersCount}
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header
        className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[95%] max-w-7xl rounded-full border backdrop-blur-md transition-all duration-500 ${shellClass}`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 min-h-[52px] sm:min-h-[56px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0 min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src="/logom.webp"
              alt="Menuiserie Digitale"
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain rounded-lg transition-transform duration-300 group-hover:rotate-6"
            />
            <span
              className={`font-serif text-base sm:text-lg lg:text-xl tracking-tight truncate hidden sm:block transition-colors duration-300 ${textClass} ${isOpaque ? 'font-bold' : ''}`}
            >
              <span className="hidden md:inline">Menuiserie Digitale</span>
              <span className="md:hidden">Menuiserie</span>
            </span>
          </Link>

          {/* Desktop nav — lg and up */}
          <nav
            className={`hidden lg:flex items-center justify-center flex-1 gap-6 xl:gap-10 font-sans text-xs uppercase tracking-[0.12em] font-medium ${mutedClass}`}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                showBadge={'badge' in link}
              />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className={`hidden sm:flex px-3 lg:px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full border items-center gap-1.5 transition-all ${installBtnClass}`}
                aria-label="Installer l'application"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">Installer</span>
              </button>
            )}

            <Link
              href="/admin/login"
              className={`px-3 sm:px-4 lg:px-6 py-2 text-[10px] uppercase font-bold tracking-widest rounded-full border transition-all whitespace-nowrap ${loginBtnClass}`}
            >
              <span className="hidden sm:inline">Connexion</span>
              <span className="sm:hidden">Login</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className={`lg:hidden p-2.5 rounded-full border transition-colors ${
                isOpaque
                  ? 'border-primary/15 text-primary hover:bg-primary/5'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-[4.25rem] sm:top-[4.75rem] left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[min(24rem,calc(100%-2rem))] lg:hidden rounded-3xl border border-[#2D5A27]/15 bg-[#fcf9f3] shadow-2xl overflow-hidden"
            >
              <nav className="flex flex-col p-3 gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[13px] font-extrabold uppercase tracking-[0.15em] transition-colors ${
                      isActive
                        ? 'bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20'
                        : 'text-[#1a3d16] hover:bg-[#2D5A27]/10 hover:text-[#2D5A27]'
                    }`}
                  >
                    {link.label}
                    {'badge' in link && pendingOrdersCount > 0 && (
                      <span className="min-w-[1.25rem] h-5 px-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </Link>
                  );
                })}
              </nav>

              {deferredPrompt && !isInstalled && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-200/80">
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                  >
                    <Download size={16} />
                    Installer l&apos;application
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
