'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center backdrop-blur-sm border transition-all duration-300 ${
          isOpaque
            ? "bg-primary text-white border-primary/20" 
            : "bg-white/20 text-white border-white/30"
        } group-hover:rotate-6`}>
          <span className="font-serif text-xl md:text-2xl">M</span>
        </div>
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
 
      <div className="flex items-center">
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
