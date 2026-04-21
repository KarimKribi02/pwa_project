'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Ruler, 
  Trees, 
  Palette, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Clock,
  Star,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const PRODUCTS_DATA = [
  { 
    id: 1, title: "Table Basse 'Atlas'", basePrice: 1250, category: "Mobilier", 
    description: "Une pièce maîtresse taillée dans le chêne le plus noble. Chaque plateau est unique, conservant les bords naturels du tronc pour une esthétique organique.",
    images: [
      "https://images.unsplash.com/photo-1554295405-abb8fd54f153?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622345426189-99464670081d?q=80&w=800&auto=format&fit=crop"
    ]
  },
  { 
    id: 2, title: "Fauteuil 'Signature'", basePrice: 2800, category: "Mobilier", 
    description: "Noyer noir sculpté & Finition huile naturelle. Un confort absolu allié à une structure sculpturale.",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop"
    ]
  },
  { 
    id: 3, title: "Table de Repas 'Horizon'", basePrice: 4500, category: "Mobilier", 
    description: "Plateau live-edge en Cèdre de l'Atlas. Le luxe de la nature brute dans votre salle à manger.",
    images: [
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop"
    ]
  }
];

const WOOD_TYPES = [
  { id: 'chene', name: 'Chêne Blond', factor: 1.2 },
  { id: 'noyer', name: 'Noyer Sombre', factor: 1.8 },
  { id: 'cedre', name: 'Cèdre de l\'Atlas', factor: 1.5 },
  { id: 'hetre', name: 'Hêtre Clair', factor: 1.0 },
];

const FINISHES = [
  { id: 'natural', name: 'Naturel', color: '#E5D3B3' },
  { id: 'dark', name: 'Sombre Bruni', color: '#4A3728' },
  { id: 'waxed', name: 'Cire d\'Abeille', color: '#D4AF37' },
];

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  
  // Find product by ID or use first one as fallback
  const product = PRODUCTS_DATA.find(p => p.id === Number(params.id)) || PRODUCTS_DATA[0];
  
  const [activeImg, setActiveImg] = useState(0);
  const [width, setWidth] = useState(180);
  const [length, setLength] = useState(90);
  const [wood, setWood] = useState(WOOD_TYPES[0]);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [estimatedPrice, setEstimatedPrice] = useState(product.basePrice);

  // Price Logic Simulation
  useEffect(() => {
    const area = (width * length) / 10000; // m2
    const newPrice = product.basePrice + (area * 300 * wood.factor);
    setEstimatedPrice(Math.round(newPrice));
  }, [width, length, wood, product]);

  const handleAddToCart = () => {
    const orderData = {
      product: product.title,
      price: estimatedPrice,
      customization: {
        dimensions: `${width}x${length} cm`,
        wood: wood.name,
        finish: finish.name
      },
      image: product.images[0]
    };
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/catalog" className="hover:text-primary transition-colors">Atelier</Link>
          <ChevronRight size={12} />
          <span className="text-primary">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-primary/5"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImg}
                  src={product.images[activeImg]} 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-secondary scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-secondary mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-2">Pillage Artisanal Certifié</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-primary italic mb-6">
                {product.title}
              </h1>
              <p className="text-stone-500 font-light leading-relaxed mb-8">
                {product.description}
              </p>
            </header>

            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-primary/5 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    <Ruler size={14} className="text-secondary" /> Dimensions (cm)
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Largeur</label>
                      <input 
                        type="number" 
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full bg-surface-low border-b-2 border-primary/10 focus:border-secondary outline-none px-2 py-3 font-bold text-primary transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-stone-400 uppercase font-bold block mb-1">Longueur</label>
                      <input 
                        type="number" 
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full bg-surface-low border-b-2 border-primary/10 focus:border-secondary outline-none px-2 py-3 font-bold text-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    <Trees size={14} className="text-secondary" /> Essence de Bois
                  </div>
                  <select 
                    value={wood.id}
                    onChange={(e) => setWood(WOOD_TYPES.find(w => w.id === e.target.value) || WOOD_TYPES[0])}
                    className="w-full bg-surface-low border-b-2 border-primary/10 focus:border-secondary outline-none px-2 py-3 font-bold text-primary appearance-none cursor-pointer"
                  >
                    {WOOD_TYPES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  <Palette size={14} className="text-secondary" /> Finition & Protection
                </div>
                <div className="flex flex-wrap gap-4">
                  {FINISHES.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFinish(f)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-full border-2 transition-all ${
                        finish.id === f.id 
                          ? "border-secondary bg-secondary/5 text-primary scale-105" 
                          : "border-gray-100 text-stone-400 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: f.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                    Prix Estimatif <Info size={10} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif text-primary font-bold">{estimatedPrice.toLocaleString()}</span>
                    <span className="text-lg font-serif text-primary italic">€</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary/20 group"
                >
                  <ShoppingCart size={20} className="group-hover:-translate-y-1 transition-transform" />
                  <span>Commander Directement</span>
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <ShieldCheck />, label: "Garantie 5 ans" },
                { icon: <Truck />, label: "Livraison Offerte" },
                { icon: <Clock />, label: "3-4 Semaines" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-white/40 rounded-2xl border border-primary/5">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                    {item.icon}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
