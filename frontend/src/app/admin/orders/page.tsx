'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  ChevronRight,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  Eye
} from 'lucide-react';
import { getAllOrders, getOrdersByStatus, deleteOrder, validateOrder } from '@/services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Toutes');

  const fetchOrders = async (status?: string) => {
    try {
      setLoading(true);
      let data;
      if (status && status !== 'Toutes') {
        // Map French status to API status
        const statusMap: { [key: string]: string } = {
          'En attente': 'en attente',
          'En cours': 'en cours',
          'Terminées': 'terminer'
        };
        data = await getOrdersByStatus(statusMap[status]);
      } else {
        data = await getAllOrders();
      }
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

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchOrders(filter);
  };

  const requestDelete = (id: string) => {
    setOrderToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await deleteOrder(orderToDelete);
      setOrders(orders.filter(order => order.id !== orderToDelete));
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleValidate = async (id: string, currentStatus: string) => {
    setValidating(id);
    try {
      let action: string;
      if (currentStatus === 'en attente') {
        action = 'start';
      } else if (currentStatus === 'en cours') {
        action = 'complete';
      } else {
        return; // Already completed
      }

      const updatedOrder = await validateOrder(id, action);
      setOrders(orders.map(order => 
        order.id === id ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Failed to validate order:', err);
    } finally {
      setValidating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en cours': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'terminer': return "bg-green-50 text-green-600 border-green-100";
      case 'en attente': return "bg-stone-100 text-stone-500 border-stone-200";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  const getProductNames = (order: any) => {
    if (order.produits?.nom) return order.produits.nom;
    return order.produits?.nom || 'Commande Sur Mesure';
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
          {['Toutes', 'En attente', 'En cours', 'Terminées'].map((filter) => (
            <button 
              key={filter} 
              onClick={() => handleFilterChange(filter)}
              className={`flex-1 md:flex-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeFilter === filter 
                  ? 'bg-white shadow-md text-primary' 
                  : 'text-gray-400 hover:text-primary hover:bg-white/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-400 font-medium">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 font-medium">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-low/50 border-b border-primary/5">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">N° Commande</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Téléphone</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Produit</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Quantite</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-secondary uppercase tracking-widest">Prix Total</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-primary/5 hover:bg-surface-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">MD-{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-primary font-serif font-bold text-sm">
                          {order.utilisateurs?.nom?.charAt(0) || 'C'}
                        </div>
                        <span className="font-medium text-primary">{order.utilisateurs?.nom || 'Client Anonyme'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-stone-600">{order.utilisateurs?.telephone || 'Non renseigné'}</span>
                    </td>
                    <td>{order.produits?.nom}</td>
                    <td>{order.quantite}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.statut)}`}>
                        {order.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{order.prix_total ? `${order.prix_total} DH` : 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Validate Button */}
                        {(order.statut === 'en attente' || order.statut === 'en cours') && (
                          <button 
                            onClick={() => handleValidate(order.id, order.statut)}
                            disabled={validating === order.id}
                            className="p-2 bg-green-600 text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                            title={order.statut === 'en attente' ? 'Démarrer la commande' : 'Terminer la commande'}
                          >
                            {validating === order.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        )}

                        {/* Delete Button */}
                        <button 
                          onClick={() => requestDelete(order.id)}
                          className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                          title="Supprimer la commande"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && orderToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!deleting) {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-primary p-10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Trash2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-white">Supprimer une commande</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                      Action irréversible
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteConfirm(false);
                      setOrderToDelete(null);
                    }
                  }}
                  className="text-white/50 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-800 text-sm font-bold">
                    Voulez-vous vraiment supprimer cette commande ?
                  </p>
                  <p className="text-red-700/70 text-xs mt-2">
                    Commande #{orderToDelete}
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!deleting) {
                        setShowDeleteConfirm(false);
                        setOrderToDelete(null);
                      }
                    }}
                    className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-primary/10 bg-white hover:bg-primary/5 transition-all"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-600/20 hover:brightness-110 transition-all"
                    disabled={deleting}
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}