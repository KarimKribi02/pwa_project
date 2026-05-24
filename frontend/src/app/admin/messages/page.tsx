'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, Check, CheckCircle2, Trash2, X, Search, Calendar, Phone, User, MessageSquare } from 'lucide-react';
import { getContactMessages, updateContactStatus } from '@/services/api';

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (e) {
      console.error('Failed to fetch contact messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return messages;

    return messages.filter((msg) => {
      return (
        (msg.nom || '').toLowerCase().includes(q) ||
        (msg.email || '').toLowerCase().includes(q) ||
        (msg.telephone || '').toLowerCase().includes(q) ||
        (msg.objet || '').toLowerCase().includes(q) ||
        (msg.message || '').toLowerCase().includes(q)
      );
    });
  }, [messages, searchTerm]);

  const handleToggleStatus = async (msg: any) => {
    setUpdatingId(msg.id);
    const newStatus = msg.statut === 'Non lu' ? 'Lu' : 'Traité';
    try {
      await updateContactStatus(msg.id, newStatus);
      await fetchMessages();
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, statut: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAsReadDirect = async (id: string) => {
    try {
      await updateContactStatus(id, 'Lu');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Messages & Demandes</h2>
            <p className="text-stone-500 text-sm">
              {messages.filter(m => m.statut === 'Non lu').length} messages non lus / {messages.length} au total
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, objet ou message..."
            className="w-full bg-white border border-primary/5 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low border-b border-primary/5">
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Expéditeur</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Objet / Date</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Aperçu du Message</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-5 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500 font-medium">
                  Chargement des messages...
                </td>
              </tr>
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500 font-medium">
                  Aucun message reçu pour le moment
                </td>
              </tr>
            ) : (
              filteredMessages.map((msg) => {
                const isNonLu = msg.statut === 'Non lu';
                const isLu = msg.statut === 'Lu';
                const isTraite = msg.statut === 'Traité';

                return (
                  <tr key={msg.id} className={`hover:bg-surface-low/50 transition-colors ${isNonLu ? 'bg-primary/5' : ''}`}>
                    <td className="px-8 py-4">
                      <div>
                        <p className="text-primary font-bold text-sm leading-tight">{msg.nom}</p>
                        <p className="text-[10px] font-semibold text-stone-400 mt-1">{msg.email}</p>
                        {msg.telephone && (
                          <p className="text-[10px] font-semibold text-stone-400">{msg.telephone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div>
                        <span className="text-xs font-bold text-primary">{msg.objet}</span>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">{formatDate(msg.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 max-w-xs truncate">
                      <p className="text-sm text-stone-600 truncate">{msg.message}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isNonLu 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : isLu 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-50 text-stone-600 border border-stone-200'
                      }`}>
                        {msg.statut}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (isNonLu) {
                              handleMarkAsReadDirect(msg.id);
                            }
                          }}
                          title="Voir le message"
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {isNonLu && (
                          <button
                            onClick={() => handleToggleStatus(msg)}
                            disabled={updatingId === msg.id}
                            title="Marquer comme Lu"
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        
                        {isLu && (
                          <button
                            onClick={() => handleToggleStatus(msg)}
                            disabled={updatingId === msg.id}
                            title="Marquer comme Traité"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Message Detail View */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedMessage(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-primary p-10 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-serif text-white italic">Message de {selectedMessage.nom}</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                    Reçu le {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="text-white/50 hover:text-white p-2 cursor-pointer">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto">
                {/* Client Contact Info */}
                <div className="bg-white p-6 rounded-2xl border border-primary/5 space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#A67B5B] mb-2">Informations de contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-primary" />
                      <div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase">Nom complet</p>
                        <p className="text-sm font-bold text-primary">{selectedMessage.nom}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-primary" />
                      <div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase">Adresse Email</p>
                        <p className="text-sm font-bold text-primary">{selectedMessage.email}</p>
                      </div>
                    </div>
                    {selectedMessage.telephone && (
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-primary" />
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase">Téléphone</p>
                          <p className="text-sm font-bold text-primary">{selectedMessage.telephone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-primary" />
                      <div>
                        <p className="text-[9px] text-stone-400 font-bold uppercase">Objet de la demande</p>
                        <p className="text-sm font-bold text-primary">{selectedMessage.objet}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-secondary ml-1">Message</h4>
                  <div className="bg-white p-8 rounded-3xl border border-primary/5 min-h-[150px] text-stone-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedMessage(null)} 
                    className="flex-1 py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                    Fermer
                  </button>
                  
                  {selectedMessage.statut === 'Non lu' && (
                    <button 
                      type="button" 
                      onClick={() => handleToggleStatus(selectedMessage)}
                      className="flex-[2] bg-[#A67B5B] hover:bg-[#8F6647] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#A67B5B]/20 transition-all cursor-pointer"
                    >
                      Marquer comme Lu
                    </button>
                  )}
                  
                  {selectedMessage.statut === 'Lu' && (
                    <button 
                      type="button" 
                      onClick={() => handleToggleStatus(selectedMessage)}
                      className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all cursor-pointer"
                    >
                      Marquer comme Traité
                    </button>
                  )}

                  {selectedMessage.statut === 'Traité' && (
                    <button 
                      type="button" 
                      onClick={async () => {
                        await updateContactStatus(selectedMessage.id, 'Non lu');
                        await fetchMessages();
                        setSelectedMessage(null);
                      }}
                      className="flex-[2] bg-stone-100 hover:bg-stone-200 text-stone-600 py-4 rounded-2xl font-bold transition-all cursor-pointer"
                    >
                      Remettre en Non lu
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
