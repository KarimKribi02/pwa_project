'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { getProducts, getAllOrders } from '@/services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, orders] = await Promise.all([
          getProducts(),
          getAllOrders()
        ]);

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (Number(order.prix_total) || 0), 0);
        const pendingOrders = orders.filter((o: any) => o.statut?.toLowerCase() === 'en attente').length;

        setStats([
          { label: 'Total Produits', value: products.length.toString(), icon: <Package />, change: '+12%', isPositive: true },
          { label: 'Commandes', value: orders.length.toString(), icon: <ShoppingCart />, change: '+5%', isPositive: true },
          { label: 'Chiffre d\'Affaires', value: `${(totalRevenue / 1000).toFixed(1)}K MAD`, icon: <TrendingUp />, change: '+18%', isPositive: true },
          { label: 'En attente', value: pendingOrders.toString(), icon: <Clock />, change: '-2%', isPositive: false },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const salesData = [40, 70, 45, 90, 65, 80, 50]; // Still sample heights for bars for visualization

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-primary">Vue d'ensemble</h2>
          <p className="text-stone-500 font-medium">Bon retour au sein de l'atelier, voici vos dernières performances.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/10">
          Générer Rapport <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-surface-low rounded-xl flex items-center justify-center text-primary">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-primary mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-primary/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif text-primary">Ventes hebdomadaires</h3>
            <select className="bg-surface-low border-none rounded-lg text-xs font-bold text-primary px-3 py-2 outline-none">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4">
            {salesData.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className="w-full bg-surface-low rounded-t-lg relative transition-all group-hover:bg-primary/20"
                  style={{ height: `${height}%` }}
                >
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 left-0 w-full bg-primary rounded-t-lg"
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.floor(height * 150)}€
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Jour {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <h3 className="text-xl font-serif mb-8 relative z-10">Activité Récente</h3>
          <div className="space-y-6 relative z-10">
            {[
              { text: 'Nouvelle commande de Marie Dupont', time: 'il y a 2h' },
              { text: 'Produit "Table Chêne" ajouté', time: 'il y a 5h' },
              { text: 'Facture #442 générée', time: 'Hier' },
              { text: 'Mise à jour des stocks effectuée', time: '2 jours' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/90 leading-snug">{activity.text}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-12 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-xs font-bold tracking-widest transition-all">
            VOIR TOUT LE LOG
          </button>
        </div>
      </div>
    </div>
  );
}
