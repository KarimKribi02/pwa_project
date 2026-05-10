'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getAllOrders } from '@/services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en fabrication': return "bg-orange-50 text-orange-600 border-orange-100";
      case 'livré': return "bg-green-50 text-green-600 border-green-100";
      case 'en attente': return "bg-stone-100 text-stone-500 border-stone-200";
      case 'en cours de livraison': return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white border border-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
            <ShoppingCart size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Gestion des Commandes</h2>
            <p className="text-stone-400 font-medium text-sm">Suivez et mettez à jour l'état de vos fabrications.</p>
          </div>
        </div>
        <div className="flex bg-surface-low p-1 rounded-xl w-full md:w-auto">
          {['Toutes', 'En cours', 'Terminées'].map((filter, i) => (
            <button key={filter} className={`flex-1 md:flex-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              i === 0 ? 'bg-white shadow-md text-primary' : 'text-gray-400 hover:text-primary'
            }`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-400 font-medium">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-primary/5 shadow-sm">
            <p className="text-stone-400 font-medium">Aucune commande trouvée.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all p-8 flex flex-col xl:flex-row gap-8 items-stretch">
              {/* Left: Customer Info */}
              <div className="xl:w-1/3 flex flex-col justify-between border-r-0 xl:border-r border-primary/5 pr-0 xl:pr-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center text-primary font-serif font-bold text-xl">
                    {order.utilisateurs?.nom?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{order.utilisateurs?.nom || 'Client Anonyme'}</h4>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Client Atlas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-stone-500 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    {order.utilisateurs?.telephone || 'Non renseigné'}
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-sm">
                    <MapPin size={14} className="text-gray-400" />
                    {order.utilisateurs?.adresse || 'Marrakech'}
                  </div>
                </div>
              </div>

              {/* Middle: Order Details */}
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Référence Commande</p>
                    <h3 className="text-lg font-serif text-primary">MD-{order.id}</h3>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.statut)}`}>
                    {order.statut}
                  </div>
                </div>
                
                <div className="bg-surface-low/50 p-6 rounded-2xl border border-primary/5">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">ARTICLES & PERSONNALISATION</p>
                  <div className="space-y-2">
                    {order.articles_commandes?.length > 0 ? order.articles_commandes.map((art: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="font-bold text-primary">{art.produits?.nom || 'Produit'}</p>
                        <span className="text-xs font-medium text-stone-400">{art.quantite}x</span>
                      </div>
                    )) : (
                      <p className="font-bold text-primary">Commande Sur Mesure</p>
                    )}
                    <div className="flex gap-4 text-[10px] font-medium text-stone-400 mt-2">
                      <span>{order.type_bois}</span>
                      <span>{order.largeur}x{order.longueur}cm</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-stone-400 italic">Commandée le {new Date(order.date_commande || Date.now()).toLocaleDateString('fr-FR')}</p>
              </div>

              {/* Right: Actions */}
              <div className="xl:w-48 flex flex-col gap-3 justify-center items-center xl:border-l border-primary/5 pl-0 xl:pl-8">
                <button className="w-full bg-primary text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2">
                  MODIFIER <ChevronRight size={14} />
                </button>
                <button className="w-full border border-primary/10 text-primary py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all">
                  DÉTAILS
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
