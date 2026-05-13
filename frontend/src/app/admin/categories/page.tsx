'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Edit3, Trash2, X } from 'lucide-react';
import { getCategories, addCategorie, deleteCategorie, updateCategorie } from '@/services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    nom: '',
    slug: '',
    description: ''
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((cat) => {
      return (
        (cat.nom || '').toString().toLowerCase().includes(q) ||
        (cat.slug || '').toString().toLowerCase().includes(q) ||
        (cat.description || '').toString().toLowerCase().includes(q)
      );
    });
  }, [categories, searchTerm]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // slug optionnel
      const payload = {
        nom: newCategory.nom,
        slug: newCategory.slug || newCategory.nom.toLowerCase().replace(/\s+/g, '-'),
        ...(newCategory.description?.trim() ? { description: newCategory.description } : {})
      };

      await addCategorie(payload);
      setShowAddForm(false);
      setNewCategory({ nom: '', slug: '', description: '' });
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to add category:', err);
      alert(`Erreur lors de la création de la catégorie: ${err?.message || 'inconnue'}`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await updateCategorie(editingCategory.id, {
        nom: editingCategory.nom,
        slug: editingCategory.slug,
        description: editingCategory.description
      });

      setShowEditForm(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      console.error('Failed to update category:', err);
      alert(`Erreur lors de la modification de la catégorie: ${err?.message || 'inconnue'}`);
    }
  };

  const requestDelete = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await deleteCategorie(categoryToDelete);
      await fetchCategories();
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(`Erreur lors de la suppression de la catégorie: ${err?.message || 'inconnue'}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Gestion des Catégories</h2>
            <p className="text-stone-500 text-sm">{categories.length} catégories au total</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/10 transition-all"
        >
          <Plus size={20} />
          Ajouter une catégorie
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher (nom, slug, description...)"
            className="w-full bg-white border border-primary/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low border-b border-primary/5">
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Catégorie</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Slug</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-10">
                  Chargement...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10">
                  Aucune catégorie trouvée
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-low/50 transition-colors">
                  <td className="px-8 py-4">
                    <div>
                      <p className="text-primary font-bold text-sm leading-tight">{cat.nom}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-1">ID: #{cat.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{cat.slug || '-'}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory({ ...cat });
                          setShowEditForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => requestDelete(cat.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add */}
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
                  <h3 className="text-2xl font-serif text-white italic">Ajouter une catégorie</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Détails</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-white/50 hover:text-white p-2">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-10 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">NOM</label>
                    <input
                      required
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={newCategory.nom}
                      onChange={(e) => setNewCategory({ ...newCategory, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">SLUG (optionnel)</label>
                    <input
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">DESCRIPTION (optionnel)</label>
                    <textarea
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium resize-none"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                    Annuler
                  </button>
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit */}
      <AnimatePresence>
        {showEditForm && editingCategory && (
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
                  <h3 className="text-2xl font-serif text-white italic">Modifier la catégorie</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Mise à jour</p>
                </div>
                <button onClick={() => setShowEditForm(false)} className="text-white/50 hover:text-white p-2">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-10 space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">NOM</label>
                    <input
                      required
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={editingCategory.nom}
                      onChange={(e) => setEditingCategory({ ...editingCategory, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">SLUG</label>
                    <input
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={editingCategory.slug}
                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 block ml-1">DESCRIPTION</label>
                    <textarea
                      className="w-full bg-white border border-primary/10 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] font-medium resize-none"
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowEditForm(false)} className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                    Annuler
                  </button>
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all">
                    Mettre à jour
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete */}
      <AnimatePresence>
        {showDeleteConfirm && categoryToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!deleting) {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
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
                    <h3 className="text-2xl font-serif text-white">Supprimer une catégorie</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Action irréversible</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteConfirm(false);
                      setCategoryToDelete(null);
                    }
                  }}
                  className="text-white/50 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-800 text-sm font-bold">Voulez-vous vraiment supprimer cette catégorie ?</p>
                  <p className="text-red-700/70 text-xs mt-2">ID: #{categoryToDelete}</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!deleting) {
                        setShowDeleteConfirm(false);
                        setCategoryToDelete(null);
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
    </div>
  );
}

