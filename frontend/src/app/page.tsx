'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Hammer, DoorOpen, Utensils, Table, Search, Sofa, Layout, DraftingCompass, ChevronDown, ArrowRight,
  Truck, ShieldCheck, Award, Headset, ShoppingCart, CheckCircle, Users, Star, Calendar 
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  loadFeaturedWithRevalidate,
  loadCategoriesWithRevalidate,
} from "@/services/catalogSync";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Portes");
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          loadFeaturedWithRevalidate(setFeaturedProducts),
          loadCategoriesWithRevalidate(),
        ]);
        setCategories(categoriesResult.data);
        if (productsResult.isEmpty) {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section: The Cinematic Atelier */}
      <section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Video / Image */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            poster="/hero_workshop.png"
            className="w-full h-full object-cover brightness-[0.6] transition-all duration-1000"
          >
            <source src="https://res.cloudinary.com/digfptrqs/video/upload/v1776807476/Menuiserie_-_Le_travail_d_un_passionn_du_bois_x9ofgd.mp4" type="video/mp4" />
          </video>
          {/* Subtle Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 px-8 md:px-0 w-full max-w-6xl text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-sans font-bold leading-[1.1] text-white mb-16 tracking-tight"
          >
            Menuiserie Digitale, <span className="text-secondary italic">Excellence.</span><br />
            L'Art du Bois, <span className="text-secondary italic">Signature.</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-4xl"
          >
            {/* Search / Filter Container */}
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl p-2 md:p-4 overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
                {[
                  { id: "Portes", icon: <DoorOpen size={16} />, label: "PORTES" },
                  { id: "Cuisines", icon: <Utensils size={16} />, label: "CUISINES" },
                  { id: "Tables", icon: <Table size={16} />, label: "TABLES" },
                  { id: "Salons", icon: <Sofa size={16} />, label: "SALONS" },
                  { id: "Mobilier", icon: <Layout size={16} />, label: "MOBILIER" },
                  { id: "Concept", icon: <DraftingCompass size={16} />, label: "CONCEPT" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-bold tracking-widest transition-all whitespace-nowrap ${
                      activeTab === tab.id 
                        ? "text-primary bg-primary/5" 
                        : "text-gray-400 hover:text-primary/70"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex flex-col md:flex-row items-stretch gap-4 p-4">
                <div className="flex-1 flex flex-col items-start px-4 border-r-0 md:border-r border-gray-200">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">PROJET</span>
                  <div className="flex items-center justify-between w-full cursor-pointer group">
                    <span className="text-primary font-medium">Sélectionner un type...</span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-start px-4 border-r-0 md:border-r border-gray-200">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">MÉTRARE</span>
                  <div className="flex items-center justify-between w-full cursor-pointer group">
                    <span className="text-primary font-medium">Demander un devis</span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <div className="flex-[0.5] flex items-center justify-center pl-4">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 py-4 md:py-3 px-8 rounded-2xl md:rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                    <Search size={20} />
                    <span>Chercher</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1. Trust Bar (Immediately after Hero) */}
      <section className="bg-white border-b border-gray-100 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <Truck className="text-[#2D5A27]" size={28} />, title: "Livraison Rapide", detail: "Partout au Maroc" },
            { icon: <ShieldCheck className="text-[#2D5A27]" size={28} />, title: "Paiement Sécurisé", detail: "100% sécurisé" },
            { icon: <Award className="text-[#2D5A27]" size={28} />, title: "Garantie Artisanale", detail: "Sur toutes nos créations" },
            { icon: <Headset className="text-[#2D5A27]" size={28} />, title: "Service Client 24/7", detail: "À votre écoute" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left md:flex-row gap-4">
              <div className="p-3 bg-[#2D5A27]/5 rounded-full shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-gray-900">{item.title}</h4>
                <p className="font-sans text-xs text-gray-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Popular Categories (Circular Pattern) */}
      <section className="py-24 bg-[#fcfaf7] px-8 md:px-16 relative">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 uppercase tracking-[0.2em] font-bold">CATÉGORIES POPULAIRES</h2>
            <div className="h-1 w-24 bg-[#2D5A27] mx-auto" />
          </header>
          
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {loading ? (
              // Loading Skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center animate-pulse">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-gray-200 mb-8" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              ))
            ) : (
              categories.map((cat, i) => (
                <motion.div 
                  key={cat.id} 
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-white border border-gray-100 shadow-sm overflow-hidden mb-8 group-hover:shadow-xl group-hover:border-[#2D5A27]/30 transition-all p-3">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img 
                        src={cat.image || "/product_door.png"} 
                        alt={cat.nom} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-[#2D5A27]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="font-sans font-bold text-sm text-gray-700 uppercase tracking-[0.2em] group-hover:text-[#2D5A27] transition-colors">{cat.nom}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Featured Products (Nos Réalisations Phares) */}
      <section className="py-24 bg-white px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-10">
            <div>
              <span className="text-[#A67B5B] font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Sélection Exclusive</span>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 italic font-bold">Nos Réalisations Phares</h2>
            </div>
            <Link href="/catalog" className="group flex items-center gap-3 text-[#2D5A27] font-bold text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-all pb-1 border-b-2 border-transparent hover:border-[#2D5A27]">
              Découvrir la boutique <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                  <div className="aspect-[4/5] rounded-xl bg-gray-200 mb-6" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-6" />
                  <div className="h-10 w-full bg-gray-200 rounded" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => {
                const mainImage = product.produits_images?.find((img: any) => img.principale)?.url_image 
                                 || product.produits_images?.[0]?.url_image 
                                 || "/product_door.png";
                return (
                  <motion.div 
                    key={product.id} 
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative"
                  >
                    <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-gray-50">
                      {product.vedette && (
                        <div className="absolute top-4 left-4 z-10 bg-[#A67B5B] text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest">
                          VEDETTE
                        </div>
                      )}
                      <img 
                        src={mainImage} 
                        alt={product.nom} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </Link>
                    
                    <div className="flex flex-col flex-1 px-2">
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-1 group-hover:text-[#2D5A27] transition-colors leading-tight">{product.nom}</h3>
                      <p className="text-gray-400 font-sans text-xs mb-6 uppercase tracking-wider">{product.categories?.nom || "Artisanat"}</p>
                      
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Prix d'Atelier</span>
                          <span className="text-[#2D5A27] font-bold text-xl">{product.prix} MAD</span>
                        </div>
                        <button className="w-12 h-12 rounded-xl bg-[#2D5A27]/5 text-[#2D5A27] flex items-center justify-center hover:bg-[#2D5A27] hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-[#2D5A27]/20">
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us (Dark Contrast Section) */}
      <section className="py-32 bg-[#2D5A27] text-white overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-black/10 -skew-x-12 translate-x-32" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-white/60 font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block">Notre Engagement</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-[1.1] italic font-bold">POURQUOI CHOISIR <br /> L'ATELIER ATLAS ?</h2>
              <p className="text-white/80 text-lg font-light max-w-lg leading-relaxed">
                Depuis plus de 10 ans, nous perpétuons l'excellence de la menuiserie marocaine en y intégrant les innovations technologiques les plus avancées pour un résultat sans compromis.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/20"
            >
              <ul className="space-y-8">
                {[
                  "Produits de qualité premium",
                  "Meilleur prix garanti",
                  "Installation à domicile",
                  "Artisanat 100% Marocain"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-6 group">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#2D5A27] transition-all duration-500">
                      <CheckCircle size={24} />
                    </div>
                    <span className="text-xl md:text-2xl font-sans font-medium tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Trust Metrics (Social Proof) */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              { icon: <Users size={40} />, value: "1000+", label: "Clients satisfaits" },
              { icon: <Star size={40} />, value: "4.9/5", label: "Note moyenne" },
              { icon: <Calendar size={40} />, value: "10+", label: "Ans d'expérience" },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="text-[#2D5A27] mb-8 group-hover:scale-110 transition-transform duration-500">
                  {stat.icon}
                </div>
                <div className="text-5xl font-serif font-bold text-gray-900 mb-3 tracking-tighter">{stat.value}</div>
                <div className="text-gray-400 font-sans uppercase tracking-[0.3em] text-[10px] font-black">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}



