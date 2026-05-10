'use client';

import { useState, useEffect } from 'react';
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
import { getProducts, getCategories, addProduct, deleteProduct, updateProduct, addImage } from '@/services/api';
import { useRef } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState({
    nom: '',
    categorie_id: '',
    prix: '',
    description: '',
    vedette: false
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdProduct = await addProduct({
        ...newProduct,
        categorie_id: Number(newProduct.categorie_id),
        prix: Number(newProduct.prix)
      });

      if (selectedImage && createdProduct.id) {
        await addImage({
          produit_id: createdProduct.id,
          url_image: selectedImage,
          principale: true
        });
      }

      setShowAddForm(false);
      setNewProduct({ nom: '', categorie_id: '', prix: '', description: '', vedette: false });
      setSelectedImage(null);
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

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
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">Chargement...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10">Aucun produit trouvé</td></tr>
            ) : (
              products.map((product) => {
                const mainImage = product.produits_images?.find((img: any) => img.principale)?.url_image 
                                 || product.produits_images?.[0]?.url_image 
                                 || "/product_door.png";
                return (
                  <tr key={product.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border border-primary/5">
                          <img src={mainImage} alt={product.nom} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-primary font-bold text-sm leading-tight">{product.nom}</p>
                          <p className="text-[10px] font-medium text-gray-400 mt-1">ID: #{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-surface-highest rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/5">
                        {product.categories?.nom || 'Artisanat'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-stone-600">Standard / Sur mesure</td>
                    <td className="px-8 py-4 text-sm font-black text-primary">{product.prix} MAD</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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

              <form onSubmit={handleAddProduct} className="p-10 space-y-8 overflow-y-auto">
                {/* Functional Image Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-48 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center gap-2 text-primary/40 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-primary px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Changer l'image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={40} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Uploader une image du produit</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">NOM DU PRODUIT</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" 
                        placeholder="Ex: Porte Nomade..." 
                        value={newProduct.nom}
                        onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">CATÉGORIE</label>
                      <select 
                        required
                        className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={newProduct.categorie_id}
                        onChange={(e) => setNewProduct({ ...newProduct, categorie_id: e.target.value })}
                      >
                        <option value="">Sélectionner...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1">
                        <Ruler size={10} /> VEDETTE ?
                      </label>
                      <div className="flex items-center gap-4 py-4">
                        <input 
                          type="checkbox" 
                          className="w-6 h-6 accent-primary"
                          checked={newProduct.vedette}
                          onChange={(e) => setNewProduct({ ...newProduct, vedette: e.target.checked })}
                        />
                        <span className="text-sm font-medium">Mettre en avant ce produit</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">PRIX (MAD)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-black" 
                        placeholder="990.00" 
                        value={newProduct.prix}
                        onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">DESCRIPTION</label>
                  <textarea 
                    className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium resize-none" 
                    placeholder="Décrivez l'origine du bois, le style de sculpture..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px]">Annuler</button>
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
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
