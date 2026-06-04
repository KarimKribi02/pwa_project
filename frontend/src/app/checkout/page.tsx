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
  MessageSquare,
  WifiOff
} from 'lucide-react';
import { createOrder, getUserByEmail } from '@/services/api';
import Link from 'next/link';
import { useCartSync } from '@/services/useCartSync';

export default function CheckoutPage() {
  const { cartItems, queueOfflineOrder, clearCart } = useCartSync();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineSuccess, setIsOfflineSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (cartItems.length > 0) {
      const latestItem = cartItems[cartItems.length - 1];
      setOrder({
        product_id: latestItem.product_id,
        product: latestItem.product_name,
        price: latestItem.price,
        customization: latestItem.customization,
        image: latestItem.image
      });
    } else {
      const savedOrder = localStorage.getItem('pendingOrder');
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        setOrder({
          product_id: parsed.product_id,
          product: parsed.product_name,
          price: parsed.price,
          customization: parsed.customization,
          image: parsed.image
        });
      }
    }
  }, [cartItems]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = true;
    if (!formData.email) newErrors.email = true;
    if (!formData.phone) newErrors.phone = true;
    if (!formData.address) newErrors.address = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    let width = order.customization?.width?.toString() || '';
    let length = order.customization?.length?.toString() || '';
    if ((!width || !length) && order.customization?.dimensions) {
      const match = order.customization.dimensions.match(/(\d+)\s*x\s*(\d+)/i);
      if (match) {
        width = match[1];
        length = match[2];
      }
    }

    // If offline, store in Dexie queue and show success screen directly
    if (!navigator.onLine) {
      try {
        const payload = {
          id_utilisateur: undefined,
          clientNom: formData.name || null,
          clientTel: formData.phone || null,
          clientEmail: formData.email || null,
          adresse: formData.address || null,
          statut: 'en attente',
          note: formData.notes || null,
          largeur: width || null,
          longueur: length || null,
          couleur: order.customization?.finish || null,
          type_bois: order.customization?.wood || null,
          prix_total: order.price,
          id_produit: order.product_id ? order.product_id.toString() : (order.id ? order.id.toString() : ''),
          quantite: 1
        };

        const pendingId = await queueOfflineOrder(payload);
        setTrackingCode(`MD-PENDING-${pendingId}`);
        setIsOfflineSuccess(true);
        setIsSuccess(true);
        
        await clearCart();
        localStorage.removeItem('pendingOrder');
      } catch (err) {
        console.error("Offline order queueing failed:", err);
        alert("Une erreur est survenue lors de la mise en attente de votre commande.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Get or Create User (Online Flow)
      let userId;
      try {
        const user = await getUserByEmail(formData.email);
        userId = user.id;
      } catch (err) {
        // User not found, create one
        const newUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/addUtilisateur`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: formData.name,
            email: formData.email,
            mot_passe: Math.random().toString(36).slice(-8), // Random pass for guest
            role: 'user'
          }),
        }).then(r => r.json());
        userId = newUser.id;
      }

      const payload = {
        id_utilisateur: userId ? userId.toString() : undefined,
        clientNom: formData.name || null,
        clientTel: formData.phone || null,
        clientEmail: formData.email || null,
        adresse: formData.address || null,
        statut: 'en attente',
        note: formData.notes || null,
        largeur: width || null,
        longueur: length || null,
        couleur: order.customization?.finish || null,
        type_bois: order.customization?.wood || null,
        prix_total: order.price,
        id_produit: order.product_id ? order.product_id.toString() : (order.id ? order.id.toString() : undefined),
        quantite: 1
      };

      const orderRes = await createOrder(payload);

      setTrackingCode(orderRes.code_suivi || `MD-${orderRes.id}`);
      setIsSuccess(true);
      
      await clearCart();
      localStorage.removeItem('pendingOrder');
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Une erreur est survenue lors de la validation de votre commande.");
    } finally {
      setLoading(false);
    }
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
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-amber-50/55 border border-amber-200 p-5 rounded-2xl flex items-start gap-3 text-amber-800 shadow-sm">
                      <ShieldCheck className="shrink-0 mt-0.5 text-amber-600 animate-pulse" size={20} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1">Champs Requis Manquants</p>
                        <p className="text-xs leading-relaxed font-medium">Veuillez remplir tous les champs marqués comme obligatoires pour finaliser votre commande artisanale.</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-primary/5 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block ml-1">
                        Nom Complet *
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: Khalil Benjelloun"
                        className={`w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border transition-all text-sm font-semibold text-primary focus:ring-2 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] ${
                          errors.name ? 'border-red-300 bg-red-50/30' : 'border-stone-200/60'
                        }`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block ml-1">
                        Email *
                      </label>
                      <input 
                        type="email" 
                        placeholder="khalil@example.com"
                        className={`w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border transition-all text-sm font-semibold text-primary focus:ring-2 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] ${
                          errors.email ? 'border-red-300 bg-red-50/30' : 'border-stone-200/60'
                        }`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block ml-1">
                        Téléphone (WhatsApp) *
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+212 6 XX XX XX XX"
                        className={`w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border transition-all text-sm font-semibold text-primary focus:ring-2 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] ${
                          errors.phone ? 'border-red-300 bg-red-50/30' : 'border-stone-200/60'
                        }`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block ml-1">
                        Adresse de Livraison (Marrakech) *
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Quartier, N° Villa/Appartement..."
                        className={`w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border transition-all text-sm font-semibold text-primary focus:ring-2 focus:ring-[#2D5A27]/5 focus:border-[#2D5A27] resize-none ${
                          errors.address ? 'border-red-300 bg-red-50/30' : 'border-stone-200/60'
                        }`}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest block ml-1">
                        Notes & Demandes Spéciales
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Détails supplémentaires..."
                        className="w-full bg-[#fcf9f3] px-6 py-4 rounded-xl outline-none border border-stone-200/60 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 transition-all text-sm font-semibold text-primary resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-[#22441D] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 cursor-pointer"
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
            
            {isOfflineSuccess ? (
              <div className="max-w-md mx-auto bg-[#fdfaf3] border border-amber-200/50 p-6 rounded-[2rem] text-stone-700 text-left mb-10 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl shrink-0 text-amber-600">
                  <WifiOff size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-primary">En attente de connexion</h4>
                  <p className="text-[11px] leading-relaxed font-medium text-stone-500">
                    Votre commande a été enregistrée en toute sécurité en local. Elle sera automatiquement envoyée à l'Atelier dès que vous serez connecté au réseau.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 mb-12 leading-relaxed text-sm">
                Votre commande a été reçue avec succès par nos artisans. <br />
                Un conseiller vous contactera sous peu pour finaliser les détails techniques.
              </p>
            )}

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
