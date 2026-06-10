'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { submitContact } from '@/services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    objet: 'Demande de Devis',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.email || !formData.objet || !formData.message) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setError('');
    setSubmitting(true);
    setSuccess(false);
    try {
      await submitContact(formData);
      setSuccess(true);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        objet: 'Demande de Devis',
        message: ''
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de votre message.');
    } finally {
      setSubmitting(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-12 rounded-[3rem] shadow-xl border border-primary/5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-start gap-3 text-rose-800 shadow-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-xs leading-relaxed font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-start gap-3 text-emerald-800 shadow-sm">
                <Send className="shrink-0 mt-0.5 text-emerald-600" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">Message Envoyé</p>
                  <p className="text-xs leading-relaxed font-medium">Votre message a été transmis avec succès. Nous vous répondrons sous 24h.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Nom Complet *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nom complet" 
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 text-primary text-sm font-semibold transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Email *</label>
                <input 
                  type="email" 
                  required
                  placeholder="email@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 text-primary text-sm font-semibold transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Téléphone</label>
                <input 
                  type="tel" 
                  placeholder="+212 6... " 
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 text-primary text-sm font-semibold transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Objet *</label>
                <div className="relative">
                  <select 
                    value={formData.objet}
                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                    className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 text-primary text-sm font-semibold transition-all appearance-none cursor-pointer"
                  >
                    <option>Demande de Devis</option>
                    <option>Question Technique</option>
                    <option>Suivi de Commande</option>
                    <option>Autre</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Message *</label>
              <textarea 
                required
                placeholder="Décrivez votre projet ici..." 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 text-primary text-sm font-semibold transition-all min-h-[150px] resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:bg-[#22441D] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'ENVOI EN COURS...' : <><span className="uppercase">Envoyer la demande</span> <Send size={18} /></>}
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

            <button className="w-full mt-12 bg-secondary py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 cursor-pointer">
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
