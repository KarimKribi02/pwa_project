'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function QuickOrder() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => router.push('/'), 3000);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 size={80} className="text-green-600 mb-6 animate-bounce" />
        <h1 className="text-4xl font-serif mb-4">Merci pour votre commande !</h1>
        <p className="text-xl text-stone-600">Nous vous contacterons très prochainement pour finaliser les détails.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface py-24 px-8 md:px-16">
      <div className="max-w-4xl mx-auto">
        <header className="mb-24">
          <Link href="/catalog" className="font-work text-[10px] uppercase tracking-[0.4em] text-secondary font-black mb-12 block">
            ← Retour à l'Atelier
          </Link>
          <h1 className="text-[3.5rem] md:text-[5rem] font-serif leading-[1.1] text-on-surface mb-8 italic">Sécurisez votre <br /> pièce unique</h1>
          <p className="text-stone-400 font-sans text-xl font-light italic leading-loose">Notre artisan vous contactera directement pour finaliser les détails techniques et la livraison.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
          <form onSubmit={handleSubmit} className="space-y-16">
            <div className="flex flex-col gap-6">
              <label className="font-work text-[10px] uppercase tracking-widest text-on-surface/40 font-black">Nom & Prénom</label>
              <input 
                type="text" 
                required 
                placeholder="Youssef El-Amrani"
                className="input-minimalist text-xl font-serif italic text-secondary placeholder:text-outline"
              />
            </div>

            <div className="flex flex-col gap-6">
              <label className="font-work text-[10px] uppercase tracking-widest text-on-surface/40 font-black">WhatsApp / Mobile</label>
              <input 
                type="tel" 
                required 
                placeholder="+212 600..."
                className="input-minimalist text-xl font-serif italic text-secondary placeholder:text-outline"
              />
            </div>

            <div className="flex flex-col gap-6">
              <label className="font-work text-[10px] uppercase tracking-widest text-on-surface/40 font-black">Adresse de Livraison</label>
              <input 
                type="text" 
                required 
                placeholder="Derb El Horra, Marrakech Medina"
                className="input-minimalist text-xl font-serif italic text-secondary placeholder:text-outline"
              />
            </div>

            <div className="flex flex-col gap-6">
              <label className="font-work text-[10px] uppercase tracking-widest text-on-surface/40 font-black">Note Spécifique</label>
              <textarea 
                rows={3}
                placeholder="Préférences de grain de bois..."
                className="input-minimalist text-lg font-serif italic text-secondary placeholder:text-outline resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="btn-primary w-full py-8 text-lg flex items-center justify-center gap-4 group"
            >
              Envoyer la demande <Send size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          {/* Tonal Sidebar for Summary */}
          <div className="bg-surface-low p-12 rounded-[0.5rem] space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rotate-45 translate-x-16 -translate-y-16" />
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 rounded-[0.375rem] overflow-hidden border border-outline/5">
                <img src="https://images.unsplash.com/photo-1577146333359-b9f4b304cf55?w=200" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-on-surface italic leading-tight">Table de Repas Atlas</h3>
                <span className="font-work text-[8px] uppercase tracking-widest text-on-surface/40">Configuration Sur-Mesure</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                <span className="font-work text-[10px] uppercase tracking-widest text-on-surface/40">Total Estimé</span>
                <span className="text-3xl font-serif italic text-secondary">4,200 MAD</span>
              </div>
              <p className="text-[10px] text-stone-400 leading-relaxed font-medium italic">
                * Le règlement s'effectue après confirmation des détails techniques par notre maître artisan.
              </p>
            </div>

            <div className="pt-12 border-t border-outline/10">
              <p className="font-work text-[10px] uppercase tracking-widest text-secondary font-black mb-4">Garantie Atelier</p>
              <p className="text-xs text-stone-400 leading-loose">Chaque pièce est accompagnée d'un certificat d'authenticité et d'une garantie structurelle de 10 ans sur les assemblages traditionnels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
