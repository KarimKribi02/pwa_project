'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Filter, X, ChevronRight, ShoppingBag, ChevronDown, Star, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts, getCategories } from "@/services/api";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [activeWood, setActiveWood] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Nouveautés");

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories([{ id: "Tous", nom: "Tous" }, ...categoriesData]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const woodTypes = useMemo(() => {
    const types = new Set<string>(["Tous"]);
    products.forEach(p => {
      // Assuming wood type might be in description or a specific field if added later
      // For now we use the static ones or extract from existing products if they had it
    });
    return ["Tous", "Cèdre", "Chêne", "Noyer", "Santal", "Frêne"];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchCat = activeCategory === "Tous" || p.categories?.nom === activeCategory;
      const matchSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = Number(p.prix) <= maxPrice;
      return matchCat && matchSearch && matchPrice;
    });

    if (sortBy === "Prix croissant") {
      filtered.sort((a, b) => Number(a.prix) - Number(b.prix));
    } else if (sortBy === "Prix décroissant") {
      filtered.sort((a, b) => Number(b.prix) - Number(a.prix));
    }

    return filtered;
  }, [products, activeCategory, searchQuery, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] pt-28 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-sans">
          <Link href="/" className="hover:text-[#2D5A27]">Accueil</Link>
          <ChevronRight size={14} />
          <Link href="/catalog" className="hover:text-[#2D5A27]">Boutique</Link>
          {activeCategory !== "Tous" && (
            <>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium">{activeCategory}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Boutique</h1>
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm"
            >
              <Filter size={16} /> Filtres
            </button>
          </div>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-10">
              <div>
                <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Parcourir les catégories</h2>
                <ul className="space-y-3 font-sans">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button 
                        onClick={() => setActiveCategory(cat.nom)}
                        className={`w-full text-left transition-colors ${activeCategory === cat.nom ? "text-[#2D5A27] font-semibold" : "text-gray-600 hover:text-[#2D5A27]"}`}
                      >
                        {cat.nom}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">Essence de Bois</h2>
                <div className="flex flex-wrap gap-2">
                  {woodTypes.map(wood => (
                    <button 
                      key={wood} 
                      onClick={() => setActiveWood(wood)} 
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        activeWood === wood 
                          ? 'bg-[#2D5A27] border-[#2D5A27] text-white' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#2D5A27] hover:text-[#2D5A27]'
                      }`}
                    >
                      {wood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 flex justify-between">
                  <span>Budget Max</span>
                  <span className="text-[#A67B5B] text-base">{maxPrice.toLocaleString()} MAD</span>
                </h2>
                <input 
                  type="range" 
                  min="1000" 
                  max="150000" 
                  step="1000" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                  className="w-full accent-[#2D5A27] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-sans">
                  <span>1 000 MAD</span>
                  <span>150 000 MAD</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Sorting Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 pl-12 pr-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#2D5A27]/30 transition-all font-sans text-sm"
                />
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                <p className="text-sm text-gray-500 font-sans hidden sm:block">
                  <span className="font-semibold text-gray-900">{filteredProducts.length}</span> résultats
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-sans">Trier par:</span>
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-xl">
                      {sortBy} <ChevronDown size={14} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      {["Nouveautés", "Prix croissant", "Prix décroissant"].map(option => (
                        <button 
                          key={option}
                          onClick={() => setSortBy(option)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${sortBy === option ? 'text-[#2D5A27] font-semibold' : 'text-gray-700'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid - 4 Columns */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="p-5 space-y-4">
                      <div className="h-4 w-1/4 bg-gray-200 rounded" />
                      <div className="h-6 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-10 w-full bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => {
                    const mainImage = product.produits_images?.find((img: any) => img.principale)?.url_image 
                                     || product.produits_images?.[0]?.url_image 
                                     || "/product_door.png";
                    return (
                      <motion.div 
                        layout 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        key={product.id} 
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col"
                      >
                        <Link href={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden">
                          {product.vedette && (
                            <div className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md bg-[#A67B5B] text-white">
                              VEDETTE
                            </div>
                          )}
                          <img 
                            src={mainImage} 
                            alt={product.nom} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </Link>
                        
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{product.categories?.nom || "Artisanat"}</span>
                            <div className="flex text-amber-400">
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                            </div>
                          </div>
                          <Link href={`/product/${product.id}`}>
                            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1 leading-tight group-hover:text-[#2D5A27] transition-colors">{product.nom}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-1">{product.description || "Une création unique de l'Atelier Atlas."}</p>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                            <div>
                              <span className="text-xs text-gray-500 block mb-0.5">À partir de</span>
                              <span className="text-xl font-bold text-[#2D5A27]">{Number(product.prix).toLocaleString()} MAD</span>
                            </div>
                            
                            <Link 
                              href={`/product/${product.id}`}
                              className="w-full bg-[#2D5A27] hover:bg-[#21431d] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-colors shadow-md shadow-[#2D5A27]/20"
                            >
                              <ShoppingBag size={16} /> Personnaliser
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="text-gray-400" size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos filtres pour voir plus de résultats.</p>
                <button 
                  onClick={() => {
                    setActiveCategory("Tous");
                    setActiveWood("Tous");
                    setMaxPrice(150000);
                  }}
                  className="px-6 py-3 bg-[#2D5A27] text-white rounded-xl font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden" 
            />
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed left-0 top-0 bottom-0 w-full max-w-xs bg-white z-[101] shadow-2xl p-6 flex flex-col lg:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Filtres</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <div>
                  <h3 className="text-base font-serif font-bold text-gray-900 mb-3">Catégories</h3>
                  <ul className="space-y-2">
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <button 
                          onClick={() => setActiveCategory(cat.nom)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeCategory === cat.nom ? "bg-[#2D5A27]/10 text-[#2D5A27] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {cat.nom}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-gray-900 mb-3">Essence de Bois</h3>
                  <div className="flex flex-wrap gap-2">
                    {woodTypes.map(wood => (
                      <button 
                        key={wood} 
                        onClick={() => setActiveWood(wood)} 
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          activeWood === wood 
                            ? 'bg-[#2D5A27] border-[#2D5A27] text-white' 
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {wood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-serif font-bold text-gray-900 mb-3 flex justify-between">
                    <span>Budget Max</span>
                    <span className="text-[#A67B5B] text-sm">{maxPrice.toLocaleString()} MAD</span>
                  </h3>
                  <input 
                    type="range" 
                    min="1000" 
                    max="150000" 
                    step="1000" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                    className="w-full accent-[#2D5A27] h-1.5 bg-gray-200 rounded-full appearance-none" 
                  />
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="w-full bg-[#2D5A27] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#2D5A27]/30"
                >
                  Voir {filteredProducts.length} produits
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
