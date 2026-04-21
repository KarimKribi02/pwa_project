'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MoveRight, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_PRODUCTS = [
  { 
    id: 1, name: "Table Basse 'Atlas'", price: 1250, category: "Mobilier", 
    image: "https://images.unsplash.com/photo-1554295405-abb8fd54f153?q=80&w=800&auto=format&fit=crop",
    desc: "Chêne massif & Assemblages à queues d'aronde",
    woodType: "Chêne", color: "#d2b48c", colorName: "Chêne Clair"
  },
  { 
    id: 2, name: "Fauteuil 'Signature'", price: 2800, category: "Mobilier", 
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
    desc: "Noyer noir sculpté & Finition huile naturelle",
    woodType: "Noyer", color: "#4b3621", colorName: "Ebène"
  },
  { 
    id: 3, name: "Table de Repas 'Horizon'", price: 4500, category: "Mobilier", 
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=800&auto=format&fit=crop",
    desc: "Plateau live-edge en Cèdre de l'Atlas",
    woodType: "Cèdre", color: "#8b4513", colorName: "Marron Chaud"
  },
  { 
    id: 4, name: "Bibliothèque 'Modu'", price: 4500, category: "Mobilier", 
    image: "https://images.unsplash.com/photo-1594142461623-2895f5ba90cd?q=80&w=800&auto=format&fit=crop",
    desc: "Structure modulaire en Chêne & Eclairage intégré",
    woodType: "Chêne", color: "#7c5639", colorName: "Noyer Foncé"
  },
  { 
    id: 5, name: "Set de Bureau 'Organique'", price: 850, category: "Mobilier", 
    image: "https://images.unsplash.com/photo-1622345426189-99464670081d?q=80&w=800&auto=format&fit=crop",
    desc: "Accessoires en bois de Santal taillés main",
    woodType: "Santal", color: "#a0522d", colorName: "Sienne"
  },
  { 
    id: 6, name: "Porte 'Heritage'", price: 7200, category: "Portes", 
    image: "https://images.unsplash.com/photo-1513584684374-8bdb74838a0f?q=80&w=800&auto=format&fit=crop",
    desc: "Cèdre massif sculpté, motifs traditionnels",
    woodType: "Cèdre", color: "#7c5639", colorName: "Marron"
  },
];

const WOOD_TYPES = ["Tous", "Cèdre", "Chêne", "Noyer", "Acajou", "Santal"];
const COLORS = [
  { name: "Tous", hex: "transparent" },
  { name: "Clair", hex: "#d2b48c" },
  { name: "Moyen", hex: "#7c5639" },
  { name: "Foncé", hex: "#4b3621" }
];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [activeWood, setActiveWood] = useState("Tous");
  const [activeColor, setActiveColor] = useState("Tous");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchCat = activeCategory === "Tous" || p.category === activeCategory;
      const matchWood = activeWood === "Tous" || p.woodType === activeWood;
      const matchColor = activeColor === "Tous" || p.colorName.includes(activeColor);
      const matchPrice = p.price <= maxPrice;
      return matchCat && matchWood && matchColor && matchPrice;
    });
  }, [activeCategory, activeWood, activeColor, maxPrice]);

  return (
    <div className="flex-1 bg-[#fcfaf7] py-32 relative">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <header className="flex flex-col mb-16 gap-12">
          <div className="flex justify-between items-end">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-4xl md:text-5xl font-serif text-on-surface leading-tight italic">Le Catalogue de l'Atelier</h1>
             </motion.div>
             <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 px-8 py-3 bg-white border border-outline/10 rounded-none font-work text-[10px] uppercase tracking-[0.2em] font-black hover:bg-surface-highest transition-all shadow-sm">
               <Filter size={14} /> Filtres Avancés
             </button>
          </div>

          <div className="flex gap-12 border-b border-outline/10 pb-4">
            {["Tous", "Portes", "Mobilier", "Cuisines"].map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`font-work text-[10px] uppercase tracking-[0.3em] font-black transition-all relative py-2 ${activeCategory === cat ? 'text-primary' : 'text-on-surface/30 hover:text-on-surface'}`}>
                {cat}
                {activeCategory === cat && <motion.div layoutId="catActive" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={product.id} className="group relative">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative h-[450px] overflow-hidden bg-white mb-8 border border-outline/5">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                    <div className="absolute top-6 right-6 bg-white shadow-xl px-4 py-2 flex flex-col items-center z-20">
                       <span className="text-[8px] uppercase tracking-widest font-black text-on-surface/40 mb-1">Prix Estimatif</span>
                       <span className="text-lg font-serif">{product.price.toLocaleString()} €</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                  </div>
                  
                  <div className="flex justify-between items-start pr-4">
                    <div>
                      <h3 className="text-2xl font-serif text-on-surface mb-3 italic">{product.name}</h3>
                      <p className="text-stone-400 font-sans text-xs italic font-light max-w-[250px] leading-relaxed">{product?.desc}</p>
                    </div>
                    <div className="w-10 h-10 bg-white border border-outline/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                       <MoveRight size={16} />
                    </div>
                  </div>
                </Link>

                {/* Hover Quick Action */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-30">
                   <button className="bg-[#3e5f32] text-white px-8 py-4 flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform rounded-none">
                      <div className="border-r border-white/20 pr-4 flex flex-col items-start leading-none">
                         <span className="text-[7px] uppercase tracking-widest opacity-60 mb-1">Disponibilité</span>
                         <span className="text-[10px] font-bold uppercase tracking-tighter">Atelier Marrakech</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-black">Commander Directement</span>
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Advanced Filter Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 40, stiffness: 400 }} className="fixed right-0 top-0 bottom-0 w-full max-w-[450px] bg-white z-[101] shadow-2xl p-16 flex flex-col gap-12">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-serif italic">Filtres</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 rounded-full border border-outline/20 flex items-center justify-center hover:bg-surface-highest transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-12">
                <section>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mb-6 block">Essence de Bois</label>
                  <div className="flex flex-wrap gap-3">
                    {WOOD_TYPES.map(wood => (
                      <button key={wood} onClick={() => setActiveWood(wood)} className={`px-6 py-2.5 rounded-none border text-[11px] font-bold tracking-widest transition-all ${activeWood === wood ? 'bg-primary border-primary text-white' : 'border-outline/20 hover:border-primary text-on-surface/50 hover:text-on-surface'}`}>
                        {wood}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400 mb-6 block">Nuance & Teinte</label>
                  <div className="flex gap-4">
                    {COLORS.map(color => (
                      <button key={color.name} onClick={() => setActiveColor(color.name)} className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${activeColor === color.name ? 'border-primary' : 'border-transparent hover:scale-110'}`} title={color.name}>
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.hex, border: color.name === 'Tous' ? '1px dashed #ccc' : 'none' }} />
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400">Budget Max</label>
                    <span className="font-serif text-xl">{maxPrice.toLocaleString()} €</span>
                  </div>
                  <input type="range" min="500" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-surface-highest rounded-none appearance-none cursor-pointer" />
                </section>
              </div>

              <button onClick={() => setIsSidebarOpen(false)} className="mt-auto bg-[#3e5f32] text-white w-full py-5 rounded-none uppercase tracking-[0.3em] text-[10px] font-black shadow-2xl shadow-primary/30">
                Appliquer les Filtres
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
