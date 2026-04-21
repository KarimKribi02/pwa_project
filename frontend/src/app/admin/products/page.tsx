'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Ruler
} from 'lucide-react';

export default function ProductsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [products, setProducts] = useState([
    { id: 1, name: 'Porte Atlas en Cèdre', category: 'Portes', dimensions: '210x90cm', price: '1250', image: 'https://images.unsplash.com/photo-1513584684374-8bdb74838a0f?q=80&w=200&auto=format&fit=crop' },
    { id: 2, name: 'Table Basse Majorelle', category: 'Tables', dimensions: '120x60cm', price: '450', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=200&auto=format&fit=crop' },
    { id: 3, name: 'Cuisine Signature Bois de Rose', category: 'Cuisines', dimensions: 'Sur mesure', price: '4500', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=200&auto=format&fit=crop' },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Gestion des Produits</h2>
            <p className="text-stone-500 text-sm">{products.length} articles au total</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/10 transition-all"
        >
          <Plus size={20} />
          Ajouter un Produit
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un produit (nom, catégorie...)" 
            className="w-full bg-white border border-primary/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="bg-white border border-primary/5 rounded-xl px-6 py-4 text-primary font-bold outline-none focus:ring-2 focus:ring-primary/20">
          <option>Toutes les Catégories</option>
          <option>Portes</option>
          <option>Tables</option>
          <option>Cuisines</option>
        </select>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low border-b border-primary/5">
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Produit</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Catégorie</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Dimensions</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Prix</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-surface-low/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-primary/5">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-primary font-bold text-sm leading-tight">{product.name}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-1">ID: #00{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 bg-surface-highest rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/5">
                    {product.category}
                  </span>
                </td>
                <td className="px-8 py-4 text-sm font-medium text-stone-600">{product.dimensions}</td>
                <td className="px-8 py-4 text-sm font-black text-primary">{product.price} €</td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary p-10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-serif text-white italic">Ajouter un Produit</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Informations sur l'article</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-white/50 hover:text-white p-2">
                  <X size={28} />
                </button>
              </div>

              <form className="p-10 space-y-8 overflow-y-auto">
                {/* Visual Image Placeholder */}
                <div className="h-48 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center gap-2 text-primary/40 group cursor-pointer hover:border-primary/40 transition-all">
                  <ImageIcon size={40} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Uploader une image du produit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">NOM DU PRODUIT</label>
                      <input type="text" className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="Ex: Porte Nomade..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">CATÉGORIE</label>
                      <select className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                        <option>Portes</option>
                        <option>Tables</option>
                        <option>Cuisines</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1">
                        <Ruler size={10} /> DIMENSIONS (LxH)
                      </label>
                      <input type="text" className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="Ex: 210x90cm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">PRIX (€)</label>
                      <input type="number" className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-black" placeholder="990.00" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">DESCRIPTION</label>
                  <textarea className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium resize-none" placeholder="Décrivez l'origine du bois, le style de sculpture..."></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px]">Annuler</button>
                  <button type="button" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                    Enregistrer le Produit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
