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
import { loadProductWithRevalidate } from '@/services/catalogSync';
import { useCartSync } from '@/services/useCartSync';

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
  const { addToCart } = useCartSync();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineEmpty, setOfflineEmpty] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [width, setWidth] = useState(180);
  const [length, setLength] = useState(90);
  const [wood, setWood] = useState(WOOD_TYPES[0]);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return;
      try {
        const result = await loadProductWithRevalidate(params.id as string, (data) => {
          setProduct(data);
          setEstimatedPrice(Number(data.prix) || 0);
        });
        if (result.product) {
          setProduct(result.product);
          setEstimatedPrice(Number(result.product.prix) || 0);
        } else if (result.isEmpty) {
          setOfflineEmpty(true);
          setError("Connectez-vous une fois pour télécharger ce produit");
        } else {
          setError("Produit introuvable");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Produit introuvable");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  // Price Logic Simulation
  useEffect(() => {
    if (!product) return;
    const basePrice = Number(product.prix) || 0;
    const area = (width * length) / 10000; // m2
    const newPrice = basePrice + (area * 300 * wood.factor);
    setEstimatedPrice(Math.round(newPrice));
  }, [width, length, wood, product]);

  const handleAddToCart = async () => {
    const orderData = {
      product_id: Number(product.id),
      product_name: product.nom,
      price: estimatedPrice,
      quantity: 1,
      customization: {
        dimensions: `${width}x${length} cm`,
        width,
        length,
        wood: wood.name,
        finish: finish.name
      },
      image: product.produits_images?.[0]?.url_image || "/product_door.png"
    };
    
    await addToCart(orderData);
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface pt-32 text-center px-6">
        <h1 className="text-2xl font-serif text-primary mb-4">{error || "Produit non trouvé"}</h1>
        {offlineEmpty && (
          <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
            Visitez le catalogue en ligne une première fois pour enregistrer les produits sur votre appareil.
          </p>
        )}
        <Link href="/catalog" className="text-secondary font-bold uppercase tracking-widest">Retour au catalogue</Link>
      </div>
    );
  }

  const images = product.produits_images?.length > 0 
    ? product.produits_images.map((img: any) => img.url_image) 
    : ["/product_door.png"];

  return (
    <div className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight size={12} />
          <Link href="/catalog" className="hover:text-primary transition-colors">Atelier</Link>
          <ChevronRight size={12} />
          <span className="text-primary">{product.nom}</span>
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
                  src={images[activeImg]} 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, i) => (
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
                {product.nom}
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
                      <label className="text-[9px] text-stone-500 uppercase font-bold block mb-1.5 ml-1">Largeur</label>
                      <input 
                        type="number" 
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full bg-[#fcf9f3] border border-stone-200/60 rounded-xl focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 outline-none px-4 py-3 font-bold text-primary transition-all text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-stone-500 uppercase font-bold block mb-1.5 ml-1">Longueur</label>
                      <input 
                        type="number" 
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full bg-[#fcf9f3] border border-stone-200/60 rounded-xl focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/5 outline-none px-4 py-3 font-bold text-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    <Trees size={14} className="text-secondary" /> Essence de Bois
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {WOOD_TYPES.map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWood(w)}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between h-20 cursor-pointer ${
                          wood.id === w.id
                            ? 'border-secondary bg-secondary/5 text-primary scale-[1.02] shadow-sm'
                            : 'border-stone-200/60 bg-transparent text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">{w.name}</span>
                        <span className="text-[9px] font-medium text-stone-400">Facteur: x{w.factor}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  <Palette size={14} className="text-secondary" /> Finition & Protection
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {FINISHES.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFinish(f)}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        finish.id === f.id 
                          ? "border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-bold" 
                          : "border-stone-200/60 text-stone-500 hover:border-stone-300"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full shrink-0 border border-stone-200" style={{ backgroundColor: f.color }} />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">{f.name}</span>
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
                    <span className="text-xs font-sans text-stone-500 font-bold uppercase">MAD</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-primary hover:bg-[#22441D] text-white px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 group cursor-pointer"
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
