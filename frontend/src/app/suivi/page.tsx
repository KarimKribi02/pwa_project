'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Search, 
  Clock, 
  Hammer, 
  Truck, 
  FileDown, 
  MessageSquare,
  AlertCircle,
  Scissors,
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { getCommandeStatus } from '@/services/api';
import Link from 'next/link';

export default function OrderTracking() {
  const [orderCode, setOrderCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  const [validationError, setValidationError] = useState('');

  const commande = result;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = orderCode.trim();
    if (!code) return;

    // Validate the input using a broad alphanumeric layout (min 4 characters)
    const regex = /^[a-zA-Z0-9-]{4,}$/;
    if (!regex.test(code)) {
      setValidationError("Format Invalide. Le code de suivi doit comporter au moins 4 caractères (ex: MD-A8F9).");
      setResult(null);
      setError(false);
      return;
    }

    setValidationError('');
    setSearching(true);
    setResult(null);
    setError(false);

    try {
      const data = await getCommandeStatus(code);
      
      const statusMap: Record<string, number> = {
        'en attente': 0,
        'en cours': 1,
        'terminer': 2,
        'livré': 2
      };

      setResult({
        id: data.code_suivi || `MD-2026-${data.id}`,
        rawId: data.id,
        status: statusMap[data.statut?.toLowerCase()] ?? 0,
        statutLabel: data.statut || 'En attente',
        largeur: data.largeur || null,
        longueur: data.longueur || null,
        couleur: data.couleur || null,
        type_bois: data.type_bois || null,
        note: data.note || null,
        clientNom: data.clientNom || 'Client',
        clientTel: data.clientTel || 'Non renseigné',
        clientEmail: data.clientEmail || 'Non renseigné',
        adresse: data.adresse || 'Non renseignée',
        prix_total: data.prix_total || '0.00',
        items: data.items || [],
        hasFacture: data.hasFacture || (data.factures && data.factures.length > 0),
        facture: data.factures && data.factures.length > 0 ? data.factures[0] : null
      });
    } catch (err) {
      console.error("Tracking error:", err);
      setError(true);
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  const statusSteps = [
    { label: 'En attente', description: 'Validation de commande', icon: <Clock size={20} /> },
    { label: 'En fabrication', description: 'Atelier de menuiserie', icon: <Hammer size={20} /> },
    { label: 'Prêt pour Livraison / Livré', description: 'Création complétée', icon: <Truck size={20} /> },
  ];

  // Skeleton component for loading state
  const SkeletonLoader = () => (
    <div className="w-full space-y-8 animate-pulse">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-md border border-stone-100">
        <div className="h-6 bg-stone-200 rounded w-1/4 mx-auto mb-10"></div>
        <div className="relative flex justify-between items-center max-w-xl mx-auto py-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 z-0"></div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-200"></div>
              <div className="h-3 bg-stone-200 rounded w-16"></div>
              <div className="h-2 bg-stone-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
          <div className="h-6 bg-stone-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-stone-100 rounded-xl"></div>
            <div className="h-12 bg-stone-100 rounded-xl"></div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-stone-200 p-8 rounded-[2.5rem] h-48"></div>
          <div className="bg-stone-100 p-8 rounded-[2rem] h-32"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50/50 py-32 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2D5A27] italic font-semibold">
            Suivi de Commande
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto font-medium text-sm md:text-base leading-relaxed">
            Saisissez votre code unique pour suivre l'avancement de votre création artisanale au sein de notre atelier.
          </p>
        </header>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                required
                placeholder=" "
                id="orderCodeInput"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="peer w-full bg-white border border-stone-200/60 rounded-xl focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 outline-none px-6 py-4 pt-6 pb-2 font-serif text-sm font-semibold text-primary transition-all shadow-sm"
              />
              <label 
                htmlFor="orderCodeInput"
                className="absolute left-6 top-4 text-xs font-bold text-stone-400 uppercase tracking-widest transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-stone-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#2D5A27] peer-focus:font-extrabold"
              >
                Code de suivi (Ex: MD-2026-A8F9)
              </label>
            </div>
            <button 
              type="submit"
              disabled={searching}
              className="bg-[#2D5A27] hover:bg-[#22441D] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-xl shadow-[#2D5A27]/10 cursor-pointer shrink-0"
            >
              {searching ? 'Recherche...' : <><Search size={18} /> Suivre</>}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-3 text-amber-800 mb-12 max-w-xl mx-auto shadow-sm"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Format Incorrect</p>
                <p className="text-xs leading-relaxed font-medium">{validationError}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-start gap-3 text-rose-800 mb-12 max-w-xl mx-auto shadow-sm"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Commande Introuvable</p>
                <p className="text-xs leading-relaxed font-medium">Nous n'avons pas pu trouver de commande correspondant à ce code. Veuillez vérifier votre saisie ou contacter notre support.</p>
              </div>
            </motion.div>
          )}

          {searching && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonLoader />
            </motion.div>
          )}

          {commande && !searching && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* Stepper Card */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-lg border border-stone-100/80">
                <div className="text-center mb-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A67B5B] bg-[#A67B5B]/10 px-4 py-1.5 rounded-full inline-block">
                    Code de suivi : {commande.code_suivi || commande.id}
                  </span>
                  {commande.clientNom && (
                    <h2 className="text-lg font-serif text-stone-700 italic mt-3">
                      Suivi de commande pour {commande.clientNom} ({commande.clientTel || 'N/A'})
                    </h2>
                  )}
                </div>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center max-w-3xl mx-auto gap-8 md:gap-0 py-4">
                  {/* Progress Line */}
                  <div className="absolute left-[22px] md:left-0 top-0 md:top-1/2 w-1 md:w-full h-full md:h-0.5 bg-stone-100 md:-translate-y-1/2 z-0" />
                  <div 
                    className="absolute left-[22px] md:left-0 top-0 md:top-1/2 w-1 md:w-full h-0.5 bg-[#2D5A27] md:-translate-y-1/2 z-0 transition-all duration-1000 origin-top md:origin-left hidden md:block" 
                    style={{ width: `${(commande.status / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < commande.status;
                    const isActive = idx === commande.status;
                    return (
                      <div key={idx} className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border ${
                          isActive 
                            ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-lg shadow-[#2D5A27]/20 scale-110" 
                            : isCompleted 
                              ? "bg-[#A67B5B] text-white border-[#A67B5B] shadow-md shadow-[#A67B5B]/10"
                              : "bg-white text-stone-300 border-stone-100"
                        }`}>
                          {isCompleted ? <CheckCircle size={18} /> : step.icon}
                        </div>
                        <div className="flex flex-col md:items-center">
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isActive ? "text-[#2D5A27]" : isCompleted ? "text-[#A67B5B]" : "text-stone-400"
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium hidden md:block">
                            {step.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Breakdown */}
                <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100/80 shadow-md space-y-8">
                  <div>
                    <h3 className="text-xl font-serif text-[#2D5A27] font-semibold border-b border-stone-100 pb-4">
                      Détails de Fabrication
                    </h3>
                  </div>

                  {/* Custom Config Parameters */}
                  <div className="grid grid-cols-2 gap-6 bg-stone-50/50 p-6 rounded-2xl border border-stone-100/50">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Dimensions</p>
                      <p className="text-sm font-bold text-stone-700">
                        {commande.largeur && commande.longueur 
                          ? `${commande.largeur} x ${commande.longueur} cm` 
                          : 'Standard'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Essence de Bois</p>
                      <p className="text-sm font-bold text-stone-700">{commande.type_bois || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Finition & Couleur</p>
                      <p className="text-sm font-bold text-stone-700">{commande.couleur || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Statut Actuel</p>
                      <p className="text-sm font-bold text-[#2D5A27] capitalize">{commande.statutLabel}</p>
                    </div>
                  </div>

                  {/* Workshop Notes */}
                  {commande.note && (
                    <div className="bg-stone-50 p-5 rounded-2xl border-l-4 border-[#A67B5B]">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Notes de l'Atelier</p>
                      <p className="text-xs text-stone-600 italic font-medium">"{commande.note}"</p>
                    </div>
                  )}

                  {/* Articles Table */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-[#2D5A27] uppercase tracking-wider">
                      Composants Commande
                    </h4>
                    {commande.items && commande.items.length > 0 ? (
                      <div className="space-y-3">
                        {commande.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-3 px-4 bg-stone-50/30 rounded-xl border border-stone-100">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] font-bold text-xs">
                                {item.quantite}x
                              </span>
                              <span className="font-bold text-stone-700 text-sm">{item.produit?.nom || 'Création Unique'}</span>
                            </div>
                            <span className="text-stone-800 font-bold text-sm">
                              {item.produit?.prix 
                                ? `${(parseFloat(item.produit.prix) * (item.quantite ?? 1)).toFixed(2)} DH` 
                                : 'À définir'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-3 px-4 bg-stone-50/30 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] font-bold text-xs">
                            1x
                          </span>
                          <span className="font-bold text-stone-700 text-sm">Création Unique Sur Mesure</span>
                        </div>
                        <span className="text-stone-800 font-bold text-sm">
                          {commande.prix_total ? `${commande.prix_total} DH` : 'À définir'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Invoices */}
                  <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">TOTAL ESTIMATIF</p>
                      <p className="text-3xl font-serif text-[#2D5A27] font-semibold">{commande.prix_total} DH</p>
                    </div>

                    {/* Invoice Available Button */}
                    {commande.hasFacture ? (
                      <button 
                        onClick={handleDownloadInvoice}
                        className="bg-[#A67B5B] hover:bg-[#8F6647] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md text-sm cursor-pointer"
                      >
                        <FileCheck2 size={18} /> Facture Disponible (Imprimer)
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 italic">
                        Facture en attente de génération
                      </span>
                    )}
                  </div>
                </div>

                {/* Sidebar Card (Client Info) */}
                <div className="space-y-6">
                  <div className="bg-[#2D5A27] text-white p-8 rounded-[2.5rem] shadow-xl shadow-[#2D5A27]/10 space-y-6">
                    <h3 className="text-lg font-serif italic border-b border-white/10 pb-4">
                      Client & Livraison
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Destinataire</p>
                        <p className="font-bold text-sm">{commande.clientNom}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Téléphone</p>
                        <p className="text-xs font-semibold text-white/80">{commande.clientTel}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-xs font-semibold text-white/80">{commande.clientEmail}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Adresse de livraison</p>
                        <p className="text-xs font-medium text-white/80 leading-relaxed">{commande.adresse}</p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/contact"
                    className="block bg-white p-8 rounded-[2rem] border border-stone-100 text-center group transition-all hover:bg-[#2D5A27] shadow-sm"
                  >
                    <MessageSquare className="mx-auto text-[#2D5A27] group-hover:text-white transition-colors mb-3" size={28} />
                    <p className="text-[10px] font-extrabold text-[#2D5A27] group-hover:text-white uppercase tracking-widest transition-colors mb-1">Besoin d'aide ?</p>
                    <p className="font-serif text-stone-500 group-hover:text-white/80 transition-colors text-sm">Contacter notre atelier</p>
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
