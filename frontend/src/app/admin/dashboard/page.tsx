'use client';

import { useState } from "react";
import { Package, ClipboardList, Check, Trash, Plus, User } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([
    { id: 101, customer: "Karim Alami", item: "Table en Cèdre", status: "En attente", date: "31 Mars 2026", price: "3200 MAD" },
    { id: 102, customer: "Sara Benani", item: "Porte Sculptée", status: "Terminé", date: "30 Mars 2026", price: "4500 MAD" },
  ]);

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-charcoal text-cream flex flex-col p-8 border-r border-white/5">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-12 h-12 bg-oak-warm rounded-2xl flex items-center justify-center text-cream">
            <span className="font-serif text-3xl">M</span>
          </div>
          <span className="font-serif text-2xl">Artisan Studio</span>
        </div>

        <nav className="space-y-4 flex-1">
          <NavItem icon={<ClipboardList size={20} />} label="Tableau de bord" active />
          <NavItem icon={<Package size={20} />} label="Produits" />
          <NavItem icon={<User size={20} />} label="Clients" />
        </nav>

        <div className="p-6 bg-white/5 rounded-3xl">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Session Artisan</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-oak-warm" />
            <div>
              <p className="font-bold text-sm">Maître Karim</p>
              <p className="text-white/30 text-xs">Atelier Marrakech</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl font-serif text-charcoal mb-2">Commandes Récentes</h1>
            <p className="text-stone-400">Gérez vos projets et suivez l'avancement des travaux.</p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-forest text-cream rounded-full font-bold hover:shadow-xl shadow-forest/20 transition-all">
            <Plus size={20} /> Nouveau Projet
          </button>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <section className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-charcoal/5 border border-oak-warm/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest">Client</th>
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest">Article</th>
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest">Date</th>
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest">Prix</th>
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest">Status</th>
                    <th className="pb-6 text-stone-300 font-bold text-xs uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-cream/30 transition-colors">
                      <td className="py-8 font-bold text-charcoal text-lg">{order.customer}</td>
                      <td className="py-8 text-stone-500 font-medium">{order.item}</td>
                      <td className="py-8 text-stone-400">{order.date}</td>
                      <td className="py-8 font-bold text-oak-deep">{order.price}</td>
                      <td className="py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Terminé' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-forest hover:bg-forest/10 rounded-xl"><Check size={20} /></button>
                          <button className="p-2 text-stone-400 hover:bg-stone-100 rounded-xl"><Trash size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
      active ? 'bg-oak-warm text-cream shadow-lg shadow-oak-warm/20' : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}>
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

