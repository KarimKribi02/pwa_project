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
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [newProduct, setNewProduct] = useState({
    nom: '',
    categorie_id: '',
    prix: '',
    description: '',
    vedette: false
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraImagesPreviews, setExtraImagesPreviews] = useState<string[]>([]);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // Pour éviter les erreurs possibles: limiter la mémoire/URL
  // (On ne révoque pas ici, mais on limite l'UI à 3.
  // TODO: ajouter URL.revokeObjectURL si nécessaire)



  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingProductImage, setEditingProductImage] = useState<File | null>(null);
  const [editingProductImagePreview, setEditingProductImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // 3 images supplémentaires (non principales)
  const [editingExtraImages, setEditingExtraImages] = useState<File[]>([]);
  const [editingExtraImagesPreviews, setEditingExtraImagesPreviews] = useState<string[]>([]);
  const handleEditingExtraImageChange = (idx: number, file: File | undefined) => {
    if (!file) return;
    const nextFiles = [...editingExtraImages];
    nextFiles[idx] = file;
    setEditingExtraImages(nextFiles.filter(Boolean).slice(0, 3));

    const nextPreviews = [...editingExtraImagesPreviews];
    nextPreviews[idx] = URL.createObjectURL(file);
    setEditingExtraImagesPreviews(nextPreviews.filter(Boolean).slice(0, 3));
  };


  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchTerm
      ? true
      : (product.nom || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categories?.nom || '').toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter
      ? true
      : (product.categorie_id?.toString() === categoryFilter || product.categories?.id?.toString() === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const fetchProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      // DEBUG
      console.log('DEBUG produitsData (refresh):', productsData);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setExtraImages(files.slice(0, 3));
    setExtraImagesPreviews(files.slice(0, 3).map((f) => URL.createObjectURL(f)));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating product with data:', {
        ...newProduct,
        categorie_id: Number(newProduct.categorie_id),
        prix: Number(newProduct.prix)
      });

      const createdProduct = await addProduct({
        ...newProduct,
        categorie_id: Number(newProduct.categorie_id),
        prix: Number(newProduct.prix)
      });

      console.log('Product created:', createdProduct);

      if (!createdProduct?.id) {
        throw new Error('Produit créé sans id');
      }

      if (!mainImage) {
        alert('Veuillez sélectionner une image principale.');
        return;
      }

      // 1) Image principale
      await addImage(createdProduct.id, mainImage, true);

      // 2) 3 images supplémentaires
      for (const img of extraImages.slice(0, 3)) {
        await addImage(createdProduct.id, img, false);
      }

      setShowAddForm(false);
      setNewProduct({ nom: '', categorie_id: '', prix: '', description: '', vedette: false });
      setMainImage(null);
      setMainImagePreview(null);
      setExtraImages([]);
      setExtraImagesPreviews([]);
      fetchProducts();
    } catch (err: any) {
      console.error("Failed to add product:", err);
      alert(`Erreur lors de la création du produit: ${err?.message || err}`);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDelete = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete);
      await fetchProducts();
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Erreur lors de la suppression du produit');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct({
      id: product.id,
      nom: product.nom,
      categorie_id: product.categorie_id.toString(),
      prix: product.prix,
      description: product.description,
      vedette: product.vedette
    });

    const images = product.produits_images || [];
    const mainImage = images.find((img: any) => img.principale)?.url_image 
                      || images[0]?.url_image;

    const extraUrls = images
      .filter((img: any) => !img.principale)
      .slice(0, 3)
      .map((img: any) => img.url_image)
      .filter(Boolean);

    setEditingProductImagePreview(mainImage || null);
    setEditingProductImage(null);

    // Préremplir l’UI avec les URLs existantes des images supplémentaires
    setEditingExtraImages([]);
    setEditingExtraImagesPreviews([...extraUrls]);

    setShowEditForm(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditingProductImage(file);
      setEditingProductImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating product:', editingProduct.id);

      const updated = await updateProduct(editingProduct.id, {
        nom: editingProduct.nom,
        categorie_id: Number(editingProduct.categorie_id),
        prix: Number(editingProduct.prix),
        description: editingProduct.description,
        vedette: editingProduct.vedette
      });
      console.log('✅ Product updated:', updated);

      // Image principale (si remplacée)
      if (editingProductImage) {
        try {
          await addImage(editingProduct.id, editingProductImage, true);
        } catch (imageError: any) {
          console.error('Failed to update main image:', imageError);
          alert(`Produit modifié mais erreur lors de la mise à jour d'image principale: ${imageError.message}`);
        }
      }

      // 3 images supplémentaires (si sélectionnées)
      for (const img of editingExtraImages.slice(0, 3)) {
        if (!img) continue;
        try {
          await addImage(editingProduct.id, img, false);
        } catch (imageError: any) {
          console.error('Failed to add extra image:', imageError);
          alert(`Produit modifié mais erreur lors de l'ajout d'une image supplémentaire: ${imageError.message}`);
        }
      }

      // Rafraîchir
      await fetchProducts();
      setShowEditForm(false);
      setEditingProduct(null);
      setEditingProductImage(null);
      setEditingProductImagePreview(null);
      setEditingExtraImages([]);
      setEditingExtraImagesPreviews([]);
    } catch (err: any) {
      console.error("Failed to update product:", err);
      alert(`Erreur lors de la modification du produit: ${err.message}`);
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
        <select 
          className="bg-white border border-primary/5 rounded-xl px-6 py-4 text-primary font-bold outline-none focus:ring-2 focus:ring-primary/20"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les Catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nom}
            </option>
          ))}
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
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10">Aucun produit trouvé</td></tr>
            ) : (
              filteredProducts.map((product) => {
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
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => requestDelete(product.id)}
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
                  {mainImagePreview ? (
                    <>
                      <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                  onChange={handleMainImageChange}
                />

                {/* Extra images upload */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0,1,2].map((idx) => {
                    const preview = extraImagesPreviews[idx];
                    return (
                      <div
                        key={idx}
                        className="h-32 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center gap-2 text-primary/40 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative"
                      >
                        <label className="w-full h-full flex items-center justify-center cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const nextImages = [...extraImages];
                              nextImages[idx] = file;
                              setExtraImages(nextImages.filter(Boolean).slice(0,3));

                              const url = URL.createObjectURL(file);
                              const nextPreviews = [...extraImagesPreviews];
                              nextPreviews[idx] = url;
                              setExtraImagesPreviews(nextPreviews.filter(Boolean).slice(0,3));
                            }}
                          />
                          {preview ? (
                            <img src={preview} alt={`Extra image ${idx+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon size={26} className="group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Image {idx+1}</span>
                            </>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && productToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!deleting) {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="bg-primary p-10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Trash2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-white">Supprimer un produit</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                      Action irréversible
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteConfirm(false);
                      setProductToDelete(null);
                    }
                  }}
                  className="text-white/50 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-800 text-sm font-bold">
                    Voulez-vous vraiment supprimer ce produit ?
                  </p>
                  <p className="text-red-700/70 text-xs mt-2">
                    ID: #{productToDelete}
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!deleting) {
                        setShowDeleteConfirm(false);
                        setProductToDelete(null);
                      }
                    }}
                    className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-primary/10 bg-white hover:bg-primary/5 transition-all"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-600/20 hover:brightness-110 transition-all"
                    disabled={deleting}
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditForm && editingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowEditForm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary p-10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-serif text-white italic">Modifier le Produit</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Mettez à jour les informations</p>
                </div>
                <button onClick={() => setShowEditForm(false)} className="text-white/50 hover:text-white p-2">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="p-10 space-y-8 overflow-y-auto">
                {/* Image Upload */}
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="h-48 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center gap-2 text-primary/40 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative"
                >
                  {editingProductImagePreview ? (
                    <>
                      <img src={editingProductImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-primary px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Changer l'image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={40} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Uploader une nouvelle image</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={editFileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleEditImageChange}
                />

                {/* Extra images upload (modifier) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0,1,2].map((idx) => {
                    const preview = editingExtraImagesPreviews[idx];
                    return (
                      <div
                        key={idx}
                        className="h-32 rounded-3xl border-2 border-dashed border-primary/20 bg-white flex flex-col items-center justify-center gap-2 text-primary/40 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative"
                      >
                        <label className="w-full h-full flex items-center justify-center cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleEditingExtraImageChange(idx, file);
                            }}
                          />
                          {preview ? (
                            <img src={preview} alt={`Extra image ${idx+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon size={26} className="group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Image {idx+1}</span>
                            </>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">NOM DU PRODUIT</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium" 
                        placeholder="Ex: Porte Nomade..." 
                        value={editingProduct.nom}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nom: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">CATÉGORIE</label>
                      <select 
                        required
                        className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        value={editingProduct.categorie_id}
                        onChange={(e) => setEditingProduct({ ...editingProduct, categorie_id: e.target.value })}
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
                          checked={editingProduct.vedette}
                          onChange={(e) => setEditingProduct({ ...editingProduct, vedette: e.target.checked })}
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
                        value={editingProduct.prix}
                        onChange={(e) => setEditingProduct({ ...editingProduct, prix: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">DESCRIPTION</label>
                  <textarea 
                    className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium resize-none" 
                    placeholder="Décrivez l'origine du bois, le style de sculpture..."
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowEditForm(false)} className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px]">Annuler</button>
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                    Mettre à Jour
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
