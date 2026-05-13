'use client';

import { useState, useEffect } from 'react';
import { getAllOrders } from '@/services/api';
import { CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  client_id?: string;
  prix_total: number;
  statut: string;
  created_at: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data.slice(0, 5)); // Dernières 5 commandes
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusIcon = (statut: string) => {
    const status = statut?.toLowerCase() || '';
    if (status === 'complétée') return <CheckCircle2 size={18} className="text-green-600" />;
    if (status === 'en attente') return <Clock size={18} className="text-yellow-600" />;
    return <AlertCircle size={18} className="text-red-600" />;
  };

  const getStatusColor = (statut: string) => {
    const status = statut?.toLowerCase() || '';
    if (status === 'complétée') return 'bg-green-50 text-green-700';
    if (status === 'en attente') return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8">
      <h3 className="text-xl font-serif text-primary mb-6">Dernières Commandes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left py-3 px-4 font-bold text-primary uppercase tracking-widest text-[10px]">ID</th>
              <th className="text-left py-3 px-4 font-bold text-primary uppercase tracking-widest text-[10px]">Montant</th>
              <th className="text-left py-3 px-4 font-bold text-primary uppercase tracking-widest text-[10px]">Statut</th>
              <th className="text-left py-3 px-4 font-bold text-primary uppercase tracking-widest text-[10px]">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-primary/5 hover:bg-surface-low transition">
                <td className="py-4 px-4 font-medium text-primary">#{order.id.slice(0, 8)}</td>
                <td className="py-4 px-4 font-bold text-primary">{Number(order.prix_total).toFixed(2)} MAD</td>
                <td className="py-4 px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(order.statut)}`}>
                    {getStatusIcon(order.statut)}
                    <span className="text-xs font-bold capitalize">{order.statut}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-secondary text-xs">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
