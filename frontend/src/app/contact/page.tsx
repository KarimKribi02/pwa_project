'use client';

import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
        
        {/* Contact Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-12"
        >
          <div>
            <h1 className="text-5xl font-serif text-primary italic mb-6">Parlons de votre projet.</h1>
            <p className="text-stone-500 font-light text-lg">Un devis, une question technique ou simplement une envie de sur-mesure ? Notre équipe vous répond sous 24h.</p>
          </div>

          <form className="space-y-8 bg-white p-12 rounded-[3rem] shadow-xl border border-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Nom Complet</label>
                <input type="text" placeholder="Jean Dupont" className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Email</label>
                <input type="email" placeholder="jean@example.com" className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Téléphone</label>
                <input type="tel" placeholder="+212 6... " className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Objet</label>
                <select className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-primary font-bold">
                  <option>Demande de Devis</option>
                  <option>Question Technique</option>
                  <option>Suivi de Commande</option>
                  <option>Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block">Message</label>
              <textarea placeholder="Décrivez votre projet ici..." className="w-full bg-surface-low border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium min-h-[150px] resize-none"></textarea>
            </div>

            <button className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
              ENVOYER LA DEMANDE <Send size={18} />
            </button>
          </form>
        </motion.div>

        {/* Sidebar Info Section */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-96 space-y-8"
        >
          {/* Info Card */}
          <div className="bg-primary text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <h3 className="text-2xl font-serif mb-10 italic">L'Atelier Marrakech</h3>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">LOCALISATION</p>
                  <p className="text-sm font-medium leading-relaxed">48 Lot IGUIDER, Allal El Fasi, Marrakech, Maroc</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">WHATSAPP</p>
                  <p className="text-sm font-medium">+212 6 12 34 56 78</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">DIRECT EMAIL</p>
                  <p className="text-sm font-medium">contact@menuiserie.digital</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-12 bg-secondary py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10">
              OUVRIR DANS MAPS
            </button>
          </div>

          {/* Placeholder for Map */}
          <div className="aspect-square rounded-[3rem] bg-surface-low border border-primary/5 relative overflow-hidden flex flex-col items-center justify-center text-primary/30 text-center p-8 group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gray-gears.png')] opacity-20 group-hover:opacity-30 transition-opacity" />
             <MapPin size={48} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">Aperçu Google Maps <br /> en attente de clé API</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
