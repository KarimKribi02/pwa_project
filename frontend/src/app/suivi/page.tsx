'use client';

import { useMemo, useState, useEffect, useCallback, Suspense } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
  FileCheck2,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import {
  trackOrderWithCache,
  getPendingOrdersForDisplay,
  getRecentSyncedOrders,
} from '@/services/orderCache';

function mapTrackingData(data: Record<string, unknown>) {
  const statusMap: Record<string, number> = {
    'en attente': 0,
    'en attente (sync)': 0,
    'en cours': 1,
    terminer: 2,
    livré: 2,
  };
  const factures = data.factures as unknown[] | undefined;

  return {
    id: (data.code_suivi as string) || `MD-2026-${data.id}`,
    rawId: data.id,
    status: statusMap[String(data.statut || '').toLowerCase()] ?? 0,
    statutLabel: (data.statut as string) || 'En attente',
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
    hasFacture: Boolean(data.hasFacture) || Boolean(factures?.length),
    facture: factures?.length ? factures[0] : null,
    fromCache: Boolean(data._pending),
  };
}

function SuiviContent() {
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const commande = result;

  const loadLocalOrders = useCallback(async () => {
    const [pending, recent] = await Promise.all([
      getPendingOrdersForDisplay(),
      getRecentSyncedOrders(),
    ]);
    setPendingOrders(pending);
    setRecentOrders(recent);
  }, []);

  useEffect(() => {
    loadLocalOrders();
    window.addEventListener('menuiserie-sync-status', loadLocalOrders);
    return () => window.removeEventListener('menuiserie-sync-status', loadLocalOrders);
  }, [loadLocalOrders]);

  const searchByCode = async (code: string) => {
    setValidationError('');
    setSearching(true);
    setResult(null);
    setError(false);

    try {
      const { order } = await trackOrderWithCache(code);
      setResult(mapTrackingData(order as Record<string, unknown>));
    } catch (err) {
      console.error('Tracking error:', err);
      setError(true);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setOrderCode(codeFromUrl);
      searchByCode(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = orderCode.trim();
    if (!code) return;

    const regex = /^[a-zA-Z0-9-]{4,}$/;
    if (!regex.test(code)) {
      setValidationError(
        'Format Invalide. Le code de suivi doit comporter au moins 4 caractères (ex: MD-A8F9).',
      );
      setResult(null);
      setError(false);
      return;
    }

    await searchByCode(code);
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  const statusSteps = useMemo(
    () => [
      { label: 'En attente', description: 'Validation de commande', icon: <Clock size={20} /> },
      { label: 'En fabrication', description: 'Atelier de menuiserie', icon: <Hammer size={20} /> },
      {
        label: 'Prêt pour Livraison / Livré',
        description: 'Création complétée',
        icon: <Truck size={20} />,
      },
    ],
    [],
  );

  const statusMaxIndex = Math.max(1, statusSteps.length - 1);
  const progressRatio = Math.max(0, Math.min(1, commande?.status / statusMaxIndex));

  // Skeleton component for loading state

  const SkeletonLoader = () => (
    <div className="w-full space-y-6 sm:space-y-8 animate-pulse">
      <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-md border border-stone-100">
        <div className="h-5 sm:h-6 bg-stone-200 rounded w-2/3 sm:w-1/4 mx-auto mb-8 sm:mb-10"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center max-w-xl mx-auto py-4 sm:py-6 gap-6 md:gap-0">
          <div className="absolute left-[22px] md:left-0 top-0 md:top-1/2 w-1 md:w-full h-full md:h-0.5 bg-stone-100 md:-translate-y-1/2 z-0"></div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative z-10 flex md:flex-col items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-200 shrink-0"></div>
              <div className="h-3 bg-stone-200 rounded w-20 sm:w-16"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
          <div className="h-5 sm:h-6 bg-stone-200 rounded w-1/2 sm:w-1/3 mb-4 sm:mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-stone-100 rounded-xl"></div>
            <div className="h-12 bg-stone-100 rounded-xl"></div>
          </div>
        </div>
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-stone-200 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] h-40 sm:h-48"></div>
          <div className="bg-stone-100 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] h-28 sm:h-32"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50/50 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto w-full min-w-0">
        <header className="text-center mb-10 sm:mb-14 md:mb-16 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2D5A27] italic font-semibold px-2">
            Suivi de Commande
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto font-medium text-sm md:text-base leading-relaxed px-2">
            Saisissez votre code unique pour suivre l'avancement de votre création artisanale au sein de notre atelier.
          </p>
        </header>

        {(pendingOrders.length > 0 || recentOrders.length > 0) && (
          <div className="max-w-xl mx-auto mb-8 sm:mb-10 space-y-4 sm:space-y-6">
            {pendingOrders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 sm:p-6">
                <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 mb-4 flex items-center gap-2">
                  <RefreshCw size={14} />
                  Commandes en attente de synchronisation
                </h2>
                <ul className="space-y-2">
                  {pendingOrders.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderCode(o.localTrackingCode);
                          searchByCode(o.localTrackingCode);
                        }}
                        className="w-full text-left text-sm font-semibold text-primary hover:text-[#2D5A27] flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/25 rounded-lg p-2 -m-2 hover:bg-stone-50/60"

                      >
                        <WifiOff size={14} className="text-amber-600" />
                        {o.localTrackingCode}
                        <span className="text-[10px] text-stone-400 font-normal">
                          · {o.status === 'failed' ? 'échec sync' : 'en file'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recentOrders.length > 0 && (
              <div className="bg-white border border-stone-200/60 rounded-2xl p-4 sm:p-6">
                <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-4">
                  Commandes récentes (cache local)
                </h2>
                <ul className="space-y-2">
                  {recentOrders.map((o) => (
                    <li key={o.trackingCode}>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderCode(o.trackingCode);
                          searchByCode(o.trackingCode);
                        }}
                        className="w-full text-left text-sm font-semibold text-primary hover:text-[#2D5A27] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/25 rounded-lg p-2 -m-2 hover:bg-stone-50/60"

                      >
                        {o.trackingCode}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
            <div className="flex-1 relative min-w-0">
              <input 
                type="text" 
                required
                placeholder=" "
                id="orderCodeInput"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="peer w-full bg-white border border-stone-200/60 rounded-xl focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 outline-none px-4 sm:px-6 py-4 pt-6 pb-2 font-serif text-sm font-semibold text-primary transition-all shadow-sm"
              />
              <label 
                htmlFor="orderCodeInput"
                className="absolute left-4 sm:left-6 top-4 text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-widest transition-all pointer-events-none peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-stone-400 peer-focus:top-2 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-[#2D5A27] peer-focus:font-extrabold max-w-[calc(100%-2rem)] truncate"
              >
                Code de suivi (Ex: MD-2026-A8F9)
              </label>
            </div>
            <button 
              type="submit"
              disabled={searching}
              className="w-full sm:w-auto bg-[#2D5A27] hover:bg-[#22441D] text-white px-6 sm:px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-xl shadow-[#2D5A27]/10 cursor-pointer shrink-0"
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
              className="space-y-6 sm:space-y-8 md:space-y-10"
            >
              {/* Stepper Card */}
              <div className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-lg border border-stone-100/80">
                <div className="text-center mb-8 sm:mb-10">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#A67B5B] bg-[#A67B5B]/10 px-3 sm:px-4 py-1.5 rounded-full inline-block max-w-full break-all">
                    Code de suivi : {commande.code_suivi || commande.id}
                  </span>
                  {commande.clientNom && (
                    <h2 className="text-base sm:text-lg font-serif text-stone-700 italic mt-3 px-2 break-words">
                      Suivi de commande pour {commande.clientNom}
                      <span className="block sm:inline text-stone-500 not-italic text-sm mt-1 sm:mt-0 sm:ml-1">
                        ({commande.clientTel || 'N/A'})
                      </span>
                    </h2>
                  )}
                </div>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center max-w-3xl mx-auto gap-6 sm:gap-8 md:gap-0 py-2 sm:py-4 pl-1 md:pl-0">
                  {/* Progress Line — vertical on mobile, horizontal on desktop */}
                  <div className="absolute left-[22px] md:left-0 top-6 bottom-6 md:top-1/2 md:bottom-auto w-0.5 md:w-full h-auto md:h-0.5 bg-stone-100 md:-translate-y-1/2 z-0" />
                  <div
                    className="absolute left-[22px] top-6 w-0.5 bg-[#2D5A27] z-0 transition-all duration-1000 origin-top md:hidden"
                    style={{ height: `${progressRatio * 100}%` }}
                  />
                  <div
                    className="absolute left-0 top-1/2 w-full h-0.5 bg-[#2D5A27] -translate-y-1/2 z-0 transition-all duration-700 ease-out origin-left hidden md:block"
                    style={{ width: `${progressRatio * 100}%` }}
                  />


                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx < commande.status;
                    const isActive = idx === commande.status;
                    return (
                      <div key={idx} className="relative z-10 flex md:flex-col items-center md:items-center gap-3 sm:gap-4 md:gap-3 w-full md:w-auto md:flex-1">
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 border ${
                          isActive 
                            ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-lg shadow-[#2D5A27]/20 scale-105 sm:scale-110" 
                            : isCompleted 
                              ? "bg-[#A67B5B] text-white border-[#A67B5B] shadow-md shadow-[#A67B5B]/10"
                              : "bg-white text-stone-300 border-stone-100"
                        }`}>
                          {isCompleted ? <CheckCircle size={18} /> : step.icon}
                        </div>
                        <div className="flex flex-col md:items-center text-left md:text-center min-w-0 flex-1 md:flex-none">
                          <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                            isActive ? "text-[#2D5A27]" : isCompleted ? "text-[#A67B5B]" : "text-stone-400"
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {step.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Details Breakdown */}
                <div className="lg:col-span-2 bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] border border-stone-100/80 shadow-md space-y-6 sm:space-y-8 min-w-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif text-[#2D5A27] font-semibold border-b border-stone-100 pb-3 sm:pb-4">
                      Détails de fabrication
                    </h3>

                  </div>

                  {/* Custom Config Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-stone-50/50 p-4 sm:p-6 rounded-2xl border border-stone-100/50">
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
                      Composants de la commande
                    </h4>

                    {commande.items && commande.items.length > 0 ? (
                      <div className="space-y-3">
                        {commande.items.map((item: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 py-3 px-4 bg-stone-50/30 rounded-xl border border-stone-100">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-8 h-8 shrink-0 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] font-bold text-xs">
                                {item.quantite}x
                              </span>
                              <span className="font-bold text-stone-700 text-sm break-words">{item.produit?.nom || 'Création Unique'}</span>
                            </div>
                            <span className="text-stone-800 font-bold text-sm shrink-0 pl-11 sm:pl-0">
                              {item.produit?.prix 
                                ? `${(parseFloat(item.produit.prix) * (item.quantite ?? 1)).toFixed(2)} DH` 
                                : 'À définir'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 py-3 px-4 bg-stone-50/30 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 shrink-0 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27] font-bold text-xs">
                            1x
                          </span>
                          <span className="font-bold text-stone-700 text-sm">Création Unique Sur Mesure</span>
                        </div>
                        <span className="text-stone-800 font-bold text-sm shrink-0 pl-11 sm:pl-0">
                          {commande.prix_total ? `${commande.prix_total} DH` : 'À définir'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Invoices */}
                  <div className="pt-5 sm:pt-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">TOTAL ESTIMATIF</p>
                      <p className="text-2xl sm:text-3xl font-serif text-[#2D5A27] font-semibold">{commande.prix_total} DH</p>
                    </div>

                    {/* Invoice Available Button */}
                    {commande.hasFacture ? (
                      <button 
                        onClick={handleDownloadInvoice}
                        className="w-full sm:w-auto bg-[#A67B5B] hover:bg-[#8F6647] text-white px-5 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm cursor-pointer"
                      >
                        <FileCheck2 size={18} /> Facture Disponible (Imprimer)
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 italic text-center sm:text-left">
                        Facture en attente de génération
                      </span>
                    )}
                  </div>
                </div>

                {/* Sidebar Card (Client Info) */}
                <div className="space-y-4 sm:space-y-6 min-w-0">
                  <div className="bg-[#2D5A27] text-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl shadow-[#2D5A27]/10 space-y-5 sm:space-y-6">
                    <h3 className="text-lg font-serif italic border-b border-white/10 pb-4">
                      Client & livraison
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Destinataire</p>
                        <p className="font-bold text-sm break-words">{commande.clientNom}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Téléphone</p>
                        <p className="text-xs font-semibold text-white/80 break-all">{commande.clientTel}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-xs font-semibold text-white/80 break-all">{commande.clientEmail}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Adresse de livraison</p>
                        <p className="text-xs font-medium text-white/80 leading-relaxed break-words">{commande.adresse}</p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/contact"
                    className="block bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-stone-100 text-center group transition-all hover:bg-[#2D5A27] shadow-sm"
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

export default function OrderTracking() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 sm:pt-32 text-center text-stone-500 px-4">Chargement...</div>
      }
    >
      <SuiviContent />
    </Suspense>
  );
}
