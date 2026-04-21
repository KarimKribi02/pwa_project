'use client';

import { useState } from 'react';
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { 
      id: "CMD-2401", 
      customer: "Amine El Fassi", 
      phone: "+212 6 12 34 56 78", 
      address: "Moscou, Guéliz, Marrakech", 
      product: "Table Chêne Artisanale", 
      date: "12 Avril 2024", 
      status: "En fabrication", 
      color: "bg-orange-50 text-orange-600 border-orange-100"
    },
    { 
      id: "CMD-2402", 
      customer: "Sonia Bennis", 
      phone: "+212 6 98 76 54 32", 
      address: "Avenue Mohamed V, Casablanca", 
      product: "Porte Sculptée Tradition", 
      date: "10 Avril 2024", 
      status: "Livré", 
      color: "bg-green-50 text-green-600 border-green-100"
    },
    { 
      id: "CMD-2403", 
      customer: "Khalid Mansour", 
      phone: "+212 6 11 22 33 44", 
      address: "Palmeraie, Villa 45, Marrakech", 
      product: "Meuble TV Concept", 
      date: "08 Avril 2024", 
      status: "En attente", 
      color: "bg-stone-100 text-stone-500 border-stone-200"
    },
  ]);

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
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all p-8 flex flex-col xl:flex-row gap-8 items-stretch">
            {/* Left: Customer Info */}
            <div className="xl:w-1/3 flex flex-col justify-between border-r-0 xl:border-r border-primary/5 pr-0 xl:pr-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center text-primary font-serif font-bold text-xl">
                  {order.customer.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-primary">{order.customer}</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Client Privilégié</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-stone-500 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  {order.phone}
                </div>
                <div className="flex items-center gap-3 text-stone-500 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  {order.address}
                </div>
              </div>
            </div>

            {/* Middle: Order Details */}
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none">Référence Commande</p>
                  <h3 className="text-lg font-serif text-primary">{order.id}</h3>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.color}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="bg-surface-low/50 p-6 rounded-2xl border border-primary/5">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">ARTICLE À FABRIQUER</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary">{order.product}</p>
                  <Calendar size={18} className="text-primary/30" />
                </div>
                <p className="text-[11px] font-medium text-stone-400 mt-2 italic">Commandé le {order.date}</p>
              </div>
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
        ))}
      </div>
    </div>
  );
}
