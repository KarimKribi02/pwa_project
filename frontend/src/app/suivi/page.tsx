'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Clock, 
  Hammer, 
  Truck, 
  CheckCircle2, 
  FileDown, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { getOrder } from '@/services/api';
import Link from 'next/link';

export default function OrderTracking() {
  const [orderCode, setOrderCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode) return;
    
    setSearching(true);
    setResult(null);
    setError(false);

    try {
      // Extract numeric ID from MD-X format if needed
      const numericId = orderCode.replace('MD-', '');
      const data = await getOrder(numericId);
      
      // Map backend status to index
      const statusMap: Record<string, number> = {
        'en attente': 0,
        'en fabrication': 1,
        'en cours de livraison': 2,
        'livré': 3
      };

      setResult({
        id: `MD-${data.id}`,
        status: statusMap[data.statut?.toLowerCase()] || 0,
        items: data.produits ? [{
          name: data.produits.nom || 'Produit Sur Mesure',
          qty: data.quantite || 1,
          price: `${data.produits.prix || data.prix_total} MAD`
        }] : [{
          name: 'Produit Sur Mesure',
          qty: 1,
          price: `${data.prix_total || 'À définir'} MAD`
        }],
        total: `${data.prix_total || 'En attente'} MAD`,
        address: data.utilisateurs?.adresse || 'Non renseignée',
        client: data.utilisateurs?.nom || 'Client'
      });
    } catch (err) {
      console.error("Tracking error:", err);
      setError(true);
    } finally {
      setSearching(false);
    }
  };

  const statusSteps = [
    { label: 'En attente', icon: <Clock size={20} /> },
    { label: 'En fabrication', icon: <Hammer size={20} /> },
    { label: 'En cours de livraison', icon: <Truck size={20} /> },
    { label: 'Livré', icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-surface py-32 px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Suivi de Commande</h1>
          <p className="text-stone-500 max-w-xl mx-auto">Saisissez votre code unique pour suivre l'avancement de votre création artisanale au sein de notre atelier.</p>
        </header>

        {/* Search Input */}
        <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-primary/5 mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="flex-1 px-6 flex items-center gap-3">
              <Package className="text-primary/30" />
              <input 
                type="text" 
                placeholder="Ex: MD-2024-XXXX" 
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="w-full bg-transparent outline-none py-4 text-primary font-serif italic text-lg"
              />
            </div>
            <button 
              type="submit"
              disabled={searching}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {searching ? 'Recherche...' : <><Search size={20} /> Suivre</>}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-600 mb-12 max-w-2xl mx-auto"
            >
              <AlertCircle />
              <p className="text-sm font-bold uppercase tracking-widest leading-none">Code introuvable. Veuillez vérifier votre email de confirmation.</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-primary/5 overflow-hidden">
                <div className="relative flex justify-between">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-low -translate-y-1/2 z-0" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000" 
                    style={{ width: `${(result.status / (statusSteps.length - 1)) * 100}%` }}
                  />
                  
                  {statusSteps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-4 group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        idx <= result.status 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                          : "bg-surface text-gray-300"
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hidden md:block ${
                        idx <= result.status ? "text-primary" : "text-gray-400"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Info & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm space-y-8">
                  <h3 className="text-xl font-serif text-primary border-b border-primary/5 pb-4">Articles en fabrication</h3>
                  <div className="space-y-4">
                    {result.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface-low rounded-lg flex items-center justify-center text-primary font-bold">{item.qty}x</div>
                          <p className="font-bold text-stone-700">{item.name}</p>
                        </div>
                        <p className="text-primary font-black">{item.price}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-primary/5 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">TOTAL DE LA COMMANDE</p>
                      <p className="text-3xl font-serif text-primary">{result.total}</p>
                    </div>
                    <button className="bg-surface-low hover:bg-surface-highest text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                      <FileDown size={18} /> Facture PDF
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/10">
                    <h3 className="text-lg font-serif mb-6">Livraison</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">DESTINATAIRE</p>
                        <p className="font-bold">{result.client}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">ADRESSE</p>
                        <p className="text-sm font-medium text-white/80 leading-relaxed">{result.address}</p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/contact"
                    className="block bg-white p-8 rounded-[2rem] border border-primary/5 text-center group transition-all hover:bg-primary"
                  >
                    <MessageSquare className="mx-auto text-primary group-hover:text-white transition-colors mb-4" size={32} />
                    <p className="text-[10px] font-bold text-primary group-hover:text-white uppercase tracking-widest transition-colors leading-none mb-1">BESOIN D'AIDE ?</p>
                    <p className="font-serif text-primary group-hover:text-white transition-colors">Contacter le support</p>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
