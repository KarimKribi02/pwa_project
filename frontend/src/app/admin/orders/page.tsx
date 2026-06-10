'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  MapPin, 
  Phone, 
  User, 
  Calendar,
  Trash2,
  X,
  Eye,
  Mail
} from 'lucide-react';
import { getAllOrders, getOrdersByStatus, deleteOrder, updateOrder } from '@/services/api';

const STATUS_OPTIONS = [
  { value: 'en attente', label: 'En attente' },
  { value: 'en cours', label: 'En cours' },
  { value: 'terminer', label: 'Terminée' },
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

  const handleStatusChange = async (id: string, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(id);
    try {
      const updatedOrder = await updateOrder(id, { statut: newStatus });
      if (updatedOrder.email_notification && !updatedOrder.email_notification.sent) {
        alert(updatedOrder.email_notification.message);
      }
      setOrders(orders.map(order =>
        order.id === id ? updatedOrder : order
      ));
      if (selectedOrder?.id === id) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en cours': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'terminer': return "bg-green-50 text-green-600 border-green-100";
      case 'en attente': return "bg-stone-100 text-stone-500 border-stone-200";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  const renderStatusSelect = (order: any, compact = false) => (
    <select
      value={order.statut || 'en attente'}
      onChange={(e) => handleStatusChange(order.id, e.target.value, order.statut)}
      disabled={updatingStatus === order.id}
      className={`${compact ? 'w-full max-w-[108px] text-[9px] px-1.5 py-1 tracking-normal' : 'w-full sm:w-auto min-w-[120px] px-3 py-1.5 text-[10px] tracking-widest'} rounded-lg font-bold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${getStatusColor(order.statut)}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-primary/5 shadow-sm flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 bg-white border border-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
            <ShoppingCart size={24} className="sm:hidden" />
            <ShoppingCart size={28} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-serif text-primary">Gestion des Commandes</h2>
            <p className="text-stone-400 font-medium text-xs sm:text-sm">Suivez et mettez à jour l'état de vos fabrications.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex bg-surface-low p-1 rounded-xl w-full sm:w-auto gap-1 sm:gap-0">
          {['Toutes', 'En attente', 'En cours', 'Terminées'].map((filter) => (
            <button 
              key={filter} 
              onClick={() => handleFilterChange(filter)}
              className={`px-3 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
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


      {/* Orders List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-primary/5 shadow-sm">
        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-400 font-medium text-sm">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-stone-400 font-medium text-sm">Aucune commande trouvée.</p>
          </div>
        ) : (
          <>
            {/* Mobile & tablet cards */}
            <div className="lg:hidden divide-y divide-primary/5">
              {orders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6 space-y-4 hover:bg-surface-low/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-primary text-sm sm:text-base">MD-{order.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-surface-low flex items-center justify-center text-primary font-serif font-bold text-xs">
                          {order.utilisateurs?.nom?.charAt(0) || 'C'}
                        </div>
                        <span className="font-medium text-primary text-sm truncate">
                          {order.utilisateurs?.nom || 'Client Anonyme'}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-primary text-sm shrink-0">
                      {order.prix_total ? `${order.prix_total} DH` : 'N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Produit</p>
                      <p className="text-primary font-medium truncate">{order.produits?.nom || 'Commande Sur Mesure'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Téléphone</p>
                      <p className="text-stone-600">{order.utilisateurs?.telephone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Quantité</p>
                      <p className="text-stone-600">{order.quantite}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Statut</p>
                      {renderStatusSelect(order)}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-2 px-3 py-2 border border-primary/10 text-primary rounded-lg hover:bg-primary/5 transition-all text-xs font-bold"
                      title="Voir les détails"
                    >
                      <Eye size={16} />
                      <span className="sm:inline hidden">Détails</span>
                    </button>
                    <button
                      onClick={() => requestDelete(order.id)}
                      className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                      title="Supprimer la commande"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block w-full min-w-0">
              <table className="w-full table-fixed text-xs lg:text-sm">
                <thead className="bg-surface-low/50 border-b border-primary/5">
                  <tr>
                    <th className="w-[8%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">N°</th>
                    <th className="w-[19%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Client</th>
                    <th className="w-[11%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide hidden 2xl:table-cell">Tél.</th>
                    <th className="w-[21%] 2xl:w-[16%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Produit</th>
                    <th className="w-[5%] px-2 lg:px-3 py-3 text-center text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Qté</th>
                    <th className="w-[14%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Statut</th>
                    <th className="w-[12%] px-2 lg:px-3 py-3 text-left text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Prix</th>
                    <th className="w-[12%] px-2 lg:px-3 py-3 text-center text-[9px] lg:text-[10px] font-bold text-secondary uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-primary/5 hover:bg-surface-low/30 transition-colors">
                      <td className="px-2 lg:px-3 py-3">
                        <span className="font-bold text-primary whitespace-nowrap">MD-{order.id}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 lg:w-7 lg:h-7 shrink-0 rounded-full bg-surface-low flex items-center justify-center text-primary font-serif font-bold text-[10px] lg:text-xs">
                            {order.utilisateurs?.nom?.charAt(0) || 'C'}
                          </div>
                          <span className="font-medium text-primary truncate text-xs lg:text-sm">{order.utilisateurs?.nom || 'Client Anonyme'}</span>
                        </div>
                      </td>
                      <td className="px-2 lg:px-3 py-3 hidden 2xl:table-cell">
                        <span className="text-stone-600 truncate block text-xs">{order.utilisateurs?.telephone || '—'}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-3">
                        <span className="truncate block text-xs lg:text-sm">{order.produits?.nom || '—'}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-3 text-center text-xs lg:text-sm">{order.quantite}</td>
                      <td className="px-2 lg:px-3 py-3">
                        {renderStatusSelect(order, true)}
                      </td>
                      <td className="px-2 lg:px-3 py-3">
                        <span className="font-bold text-primary whitespace-nowrap text-xs lg:text-sm">{order.prix_total ? `${order.prix_total} DH` : 'N/A'}</span>
                      </td>
                      <td className="px-2 lg:px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 border border-primary/10 text-primary rounded-lg hover:bg-primary/5 transition-all"
                            title="Voir les détails"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => requestDelete(order.id)}
                            className="p-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                            title="Supprimer la commande"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
            >
              <div className="bg-primary p-5 sm:p-8 lg:p-10 flex justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-serif text-white">Commande MD-{selectedOrder.id}</h3>
                  <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 break-all">
                    {selectedOrder.code_suivi ? `Code suivi : ${selectedOrder.code_suivi}` : `Créée le ${formatDate(selectedOrder.created_at)}`}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white p-2 shrink-0">
                  <X size={24} className="sm:hidden" />
                  <X size={28} className="hidden sm:block" />
                </button>
              </div>

              <div className="p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6 overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl border border-primary/5 space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">Client</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-primary" />
                      <div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase">Nom</p>
                        <p className="text-sm font-bold text-primary">{selectedOrder.utilisateurs?.nom || 'Client Anonyme'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-primary" />
                      <div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase">Téléphone</p>
                        <p className="text-sm font-bold text-primary">{selectedOrder.utilisateurs?.telephone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    {selectedOrder.utilisateurs?.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-primary" />
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Email</p>
                          <p className="text-sm font-bold text-primary">{selectedOrder.utilisateurs.email}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.adresse && (
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-primary" />
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Adresse</p>
                          <p className="text-sm font-bold text-primary">{selectedOrder.adresse}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-primary/5 space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">Produit</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-primary break-words">{selectedOrder.produits?.nom || 'Commande Sur Mesure'}</p>
                      <p className="text-xs text-stone-500 mt-1">Quantité : {selectedOrder.quantite || 1}</p>
                    </div>
                    <p className="font-bold text-primary shrink-0">{selectedOrder.prix_total ? `${selectedOrder.prix_total} DH` : 'N/A'}</p>
                  </div>
                  {(selectedOrder.largeur || selectedOrder.longueur || selectedOrder.couleur || selectedOrder.type_bois) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-primary/5">
                      {selectedOrder.largeur && (
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Largeur</p>
                          <p className="text-sm font-medium text-primary">{selectedOrder.largeur}</p>
                        </div>
                      )}
                      {selectedOrder.longueur && (
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Longueur</p>
                          <p className="text-sm font-medium text-primary">{selectedOrder.longueur}</p>
                        </div>
                      )}
                      {selectedOrder.couleur && (
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Couleur</p>
                          <p className="text-sm font-medium text-primary">{selectedOrder.couleur}</p>
                        </div>
                      )}
                      {selectedOrder.type_bois && (
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Type de bois</p>
                          <p className="text-sm font-medium text-primary">{selectedOrder.type_bois}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.note && (
                    <div className="pt-2 border-t border-primary/5">
                      <p className="text-[9px] text-stone-400 font-bold uppercase mb-1">Note</p>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{selectedOrder.note}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] text-stone-400 font-bold uppercase">Date de commande</p>
                      <p className="text-sm font-bold text-primary">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                  </div>
                  {renderStatusSelect(selectedOrder)}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-primary/10 bg-white hover:bg-primary/5 transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && orderToDelete && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
              className="bg-surface w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-primary p-5 sm:p-8 lg:p-10 flex justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Trash2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif text-white">Supprimer une commande</h3>
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

              <div className="p-5 sm:p-8 lg:p-10 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-800 text-sm font-bold">
                    Voulez-vous vraiment supprimer cette commande ?
                  </p>
                  <p className="text-red-700/70 text-xs mt-2">
                    Commande #{orderToDelete}
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
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