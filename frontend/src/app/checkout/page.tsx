'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft,
  CheckCircle2,
  Copy,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = true;
    if (!formData.phone) newErrors.phone = true;
    if (!formData.address) newErrors.address = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const code = `MD-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      setTrackingCode(code);
      setIsSuccess(true);
      setLoading(false);
      localStorage.removeItem('pendingOrder');
    }, 2000);
  };

  if (!order && !isSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8 text-center">
        <div>
          <Package size={64} className="text-secondary/20 mx-auto mb-8" />
          <h1 className="text-2xl font-serif text-primary mb-4 italic">Votre panier est vide</h1>
          <Link href="/catalog" className="text-accent font-bold hover:underline">Découvrir nos créations →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8">
      <AnimatePresence>
        {!isSuccess ? (
          <motion.div 
            key="checkout"
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Left Column: Form */}
              <div className="space-y-12">
                <header>
                  <Link href="/catalog" className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-8 hover:text-primary transition-colors">
                    <ChevronLeft size={14} /> Retour à l'Atelier
                  </Link>
                  <h1 className="text-4xl md:text-5xl font-serif text-primary italic leading-tight">
                    Finalisation de <br />votre Commande
                  </h1>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-primary/5 space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        <User size={14} className="text-secondary" /> Nom Complet
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Khalil Benjelloun"
                        className={`w-full bg-surface-low px-6 py-4 rounded-2xl outline-none border-2 transition-all ${
                          errors.name ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-secondary'
                        }`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        <Phone size={14} className="text-secondary" /> Téléphone (WhatsApp)
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+212 6 XX XX XX XX"
                        className={`w-full bg-surface-low px-6 py-4 rounded-2xl outline-none border-2 transition-all ${
                          errors.phone ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-secondary'
                        }`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        <MapPin size={14} className="text-secondary" /> Adresse de Livraison (Marrakech)
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Quartier, N° Villa/Appartement..."
                        className={`w-full bg-surface-low px-6 py-4 rounded-2xl outline-none border-2 transition-all resize-none ${
                          errors.address ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-secondary'
                        }`}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        <MessageSquare size={14} className="text-secondary" /> Notes & Demandes Spéciales
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Détails supplémentaires..."
                        className="w-full bg-surface-low px-6 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-secondary transition-all resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-full font-bold flex items-center justify-center gap-4 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Traitement en cours...
                      </span>
                    ) : (
                      <>Valider la Commande <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>

                {/* Trust Signals */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 border border-primary/5 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Paiement</p>
                      <p className="text-[10px] font-medium text-stone-400">À la Livraison</p>
                    </div>
                  </div>
                  <div className="bg-white/50 border border-primary/5 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Artisanat</p>
                      <p className="text-[10px] font-medium text-stone-400">Fait à Marrakech</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary */}
              <div className="sticky top-32">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-primary/5 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <Package size={80} className="text-secondary/5 rotate-12" />
                  </div>
                  
                  <h3 className="text-2xl font-serif text-primary border-b border-primary/5 pb-6 mb-8 italic">Votre Sélection</h3>
                  
                  <div className="flex gap-6 mb-8">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md">
                      <img src={order?.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-primary text-xl mb-2">{order?.product}</h4>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sur-Mesure</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center py-3 border-b border-surface-low text-sm font-medium">
                      <span className="text-stone-400">Dimensions</span>
                      <span className="text-primary">{order?.customization.dimensions}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-surface-low text-sm font-medium">
                      <span className="text-stone-400">Essence de Bois</span>
                      <span className="text-primary">{order?.customization.wood}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-surface-low text-sm font-medium">
                      <span className="text-stone-400">Finition</span>
                      <span className="text-primary">{order?.customization.finish}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 text-sm font-medium">
                      <span className="text-stone-400">Livraison</span>
                      <span className="text-secondary uppercase text-[10px] font-bold tracking-widest">Offerte</span>
                    </div>
                  </div>

                  <div className="bg-surface-low p-8 rounded-3xl flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Total Estimatif</span>
                    <span className="text-3xl font-serif text-primary font-bold">{order?.price.toLocaleString()} €</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto py-20 text-center"
          >
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6 italic">Félicitations !</h2>
            <p className="text-stone-500 mb-12 leading-relaxed">
              Votre commande a été reçue avec succès par nos artisans. <br />
              Un conseiller vous contactera sous peu pour finaliser les détails techniques.
            </p>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-secondary/20 relative overflow-hidden mb-12">
              <div className="absolute top-0 inset-x-0 h-1 bg-secondary" />
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Votre Code de Suivi</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-serif text-primary font-bold tracking-tight">{trackingCode}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(trackingCode)}
                  className="p-2 hover:bg-surface-low rounded-lg transition-colors text-secondary"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                href="/suivi"
                className="block bg-primary text-white py-5 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Suivre ma Fabrication
              </Link>
              <Link 
                href="/"
                className="block text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
              >
                Retour à l'Accueil
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
