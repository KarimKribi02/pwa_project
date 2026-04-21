'use client';

import Link from 'next/link';
import { 
  Camera, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Hammer, 
  Wallet 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-24 pb-12 px-8 overflow-hidden relative">
      {/* Decorative Wood Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-center lg:text-left">
          {/* Column 1: Brand */}
          <div className="space-y-8 flex flex-col items-center lg:items-start">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl">
                <span className="font-serif text-3xl">M</span>
              </div>
              <span className="font-serif text-2xl tracking-tight">Menuiserie Digitale</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              L'excellence de la menuiserie marocaine au cœur de Marrakech. L'alliance parfaite entre le savoir-faire ancestral du Maâlem et la précision technologique.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Camera size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Share2 size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Navigation</h4>
            <nav className="flex flex-col gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-secondary transition-colors">Accueil</Link>
              <Link href="/catalog" className="hover:text-secondary transition-colors">Atelier / Catalogue</Link>
              <Link href="/about" className="hover:text-secondary transition-colors">À Propos de nous</Link>
              <Link href="/suivi" className="hover:text-secondary transition-colors">Suivi de Commande</Link>
              <Link href="/contact" className="hover:text-secondary transition-colors">Contact Expert</Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Coordoonées</h4>
            <div className="flex flex-col gap-6 text-sm">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <MapPin className="text-secondary shrink-0" size={20} />
                <p className="text-white/80">48 Lot IGUIDER, Allal El Fasi, Marrakech</p>
              </div>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <Phone className="text-secondary shrink-0" size={20} />
                <p className="text-white/80">+212 6 12 34 56 78</p>
              </div>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <Mail className="text-secondary shrink-0" size={20} />
                <p className="text-white/80">contact@menuiserie.digital</p>
              </div>
            </div>
          </div>

          {/* Column 4: Trust/Badges */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Engagement</h4>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/10 group hover:border-secondary transition-colors">
                <ShieldCheck className="text-secondary" size={24} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">PWA DISPONIBLE</p>
                  <p className="text-[11px] text-white/50">Installation mobile instantanée</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/10 group hover:border-secondary transition-colors">
                <Hammer className="text-secondary" size={24} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">100% ARTISANAL</p>
                  <p className="text-[11px] text-white/50">Bois massif & Savoir-faire</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/10 group hover:border-secondary transition-colors">
                <Wallet className="text-secondary" size={24} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">PAIEMENT SÉCURISÉ</p>
                  <p className="text-[11px] text-white/50">Acompte ou devis gratuit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Copyright © 2026 Menuiserie Digitale. All rights reserved.
          </p>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            Made with Craft by <span className="text-white/70">C-Digital Marrakech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
