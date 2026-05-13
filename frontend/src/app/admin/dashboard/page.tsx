'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Download
} from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { getProducts, getAllOrders } from '@/services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import RecentOrders from './recent-orders';

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsData, ordersData] = await Promise.all([
          getProducts(),
          getAllOrders()
        ]);

        setProducts(productsData);
        setOrders(ordersData);

        const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (Number(order.prix_total) || 0), 0);
        const pendingOrders = ordersData.filter((o: any) => o.statut?.toLowerCase() === 'en attente').length;
        const completedOrders = ordersData.filter((o: any) => o.statut?.toLowerCase() === 'complétée').length;

        setStats([
          { label: 'Total Produits', value: productsData.length.toString(), icon: <Package /> },
          { label: 'Commandes', value: ordersData.length.toString(), icon: <ShoppingCart /> },
          { label: 'Chiffre d\'Affaires', value: `${(totalRevenue / 1000).toFixed(1)}K MAD`, icon: <TrendingUp /> },
          { label: 'En attente', value: pendingOrders.toString(), icon: <Clock /> },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`rapport-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  const salesData = [40, 70, 45, 90, 65, 80, 50];

  return (
    <div ref={reportRef} className="space-y-12 p-8 bg-white">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-primary">Vue d'ensemble</h2>
          <p className="text-stone-500 font-medium">Bon retour au sein de l'atelier, voici vos dernières performances.</p>
        </div>
        <button 
          onClick={generatePDF}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/10 transition-all"
        >
          Générer Rapport <Download size={18} />
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
            className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-surface-low rounded-xl flex items-center justify-center text-primary">
                {stat.icon}
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

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}
