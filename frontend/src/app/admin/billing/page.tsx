'use client';

import { useEffect, useState, FormEvent } from 'react';
import {
  Download,
  Eye,
  Search,
  Trash2,
  X,
  Printer,
  Plus,
} from 'lucide-react';
import { getAllFactures, getAllOrders, addFacture, deleteFacture } from '@/services/api';

function formatCurrency(value: string | number | null | undefined) {
  const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : typeof value === 'number' ? value : 0;
  if (Number.isNaN(amount)) return '0,00';
  return amount.toFixed(2).replace('.', ',');
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR');
}

export default function BillingPage() {
  const [factures, setFactures] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().slice(0, 10));
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().slice(0, 10));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeFacture, setActiveFacture] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facturesData, ordersData] = await Promise.all([getAllFactures(), getAllOrders()]);
      setFactures(facturesData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!selectedOrderId) {
      setErrorMessage('Veuillez sélectionner un numéro de commande.');
      return;
    }

    const order = orders.find((order) => order.id === selectedOrderId);
    if (!order) {
      setErrorMessage('Commande introuvable.');
      return;
    }

    setCreating(true);
    try {
      const facture = await addFacture({
        id_commande: Number(selectedOrderId),
        id_utilisateur: Number(order.client_id ?? order.utilisateur_id ?? 0),
        date_emission: dateEmission,
        date_paiement: datePaiement,
      });
      setFactures([facture, ...factures]);
      setSelectedOrderId('');
      setDateEmission(new Date().toISOString().slice(0, 10));
      setDatePaiement(new Date().toISOString().slice(0, 10));
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create facture:', error);
      setErrorMessage('Impossible de créer la facture. Réessayez.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Supprimer cette facture définitivement ?')) return;
    try {
      await deleteFacture(id);
      setFactures(factures.filter((facture) => facture.id !== id));
    } catch (error) {
      console.error('Failed to delete facture:', error);
    }
  };

  const handleOpenDetails = (facture: any) => {
    setActiveFacture(facture);
    setShowDetails(true);
  };

  const filteredFactures = factures.filter((facture) =>
    facture.numero_facture?.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  const createPrintableInvoice = (facture: any) => {
    const customerName = facture.nomcomplete || facture.utilisateurs?.nom || 'Client';
    const address = facture.adresse || facture.utilisateurs?.adresse || 'Adresse non renseignée';
    const phone = facture.telephone || facture.utilisateurs?.telephone || 'Téléphone non renseigné';
    const email = facture.email || facture.utilisateurs?.email || 'Email non renseigné';
    const orderLabel = facture.commandes ? `MD-${facture.commandes.id}` : 'Commande inconnue';
    const productLines = facture.commandes?.articles || facture.commandes?.produits || [];

    const html = `
      <html>
        <head>
          <title>Facture ${facture.numero_facture}</title>
          <style>
            body { font-family: Inter, sans-serif; color: #111827; padding: 36px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
            .title { font-size: 28px; font-weight: 800; margin: 0; }
            .badge { background: #eff6ff; color: #1d4ed8; padding: 8px 14px; border-radius: 999px; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
            .section { margin-bottom: 24px; }
            .section h3 { margin-bottom: 12px; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: .12em; }
            .card { border: 1px solid #e5e7eb; border-radius: 24px; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; }
            th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: #6b7280; }
            .total { font-weight: 800; font-size: 18px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <p class="title">Facture</p>
              <p style="margin: 8px 0 0 0; color: #4b5563;">${facture.numero_facture}</p>
            </div>
            <div class="badge">${facture.statut || 'En attente'}</div>
          </div>

          <div class="section card">
            <h3>Informations client</h3>
            <p><strong>${customerName}</strong></p>
            <p>${address}</p>
            <p>${phone}</p>
            <p>${email}</p>
          </div>

          <div class="section card">
            <h3>Détails de la commande</h3>
            <p><strong>Commande</strong> : ${orderLabel}</p>
            <p><strong>Date d'émission</strong> : ${formatDate(facture.date_emission)}</p>
            <p><strong>Date de paiement</strong> : ${formatDate(facture.date_paiement)}</p>
          </div>

          <div class="section card">
            <h3>Produits</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix</th>
                </tr>
              </thead>
              <tbody>
                ${productLines
                  .map((item: any) => `
                    <tr>
                      <td>${item.nom || 'Produit'}</td>
                      <td>${item.quantite || 1}</td>
                      <td>${item.prix ? parseFloat(item.prix).toFixed(2).replace('.', ',') : '0,00'} Dh</td>
                    </tr>
                  `)
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="section card">
            <h3>Récapitulatif</h3>
            <p class="total">Montant total : ${formatCurrency(facture.montant_totale)} Dh</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif text-primary">Facturation</h2>
          <p className="text-stone-500 font-medium">Gérez vos factures professionnelles et générez un PDF prêt à imprimer.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">Créer une facture</p>
            <h3 className="text-2xl font-serif text-primary">Nouvelle facture</h3>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-3xl bg-primary px-6 py-4 text-white font-bold shadow-lg shadow-primary/10 transition hover:brightness-110"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            Ajouter une facture
          </button>
        </div>
        <p className="text-sm text-stone-600">
          Créez une facture à partir d'une commande existante et gérez vos documents professionnels avec efficacité.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-primary/5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Factures</p>
            <h3 className="text-2xl font-serif text-primary">Liste des factures</h3>
          </div>
          <label className="flex items-center gap-3 rounded-3xl border border-primary/10 bg-surface-low px-4 py-3 text-sm text-secondary w-full md:w-auto">
            <Search size={18} />
            <input
              type="text"
              placeholder="Filtrer par numéro de facture"
              className="w-full bg-transparent outline-none"
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
            />
          </label>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-400 font-medium">Chargement des factures...</p>
          </div>
        ) : filteredFactures.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            {filterQuery ? 'Aucune facture ne correspond à ce filtre.' : 'Aucune facture disponible pour le moment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-surface-low border-b border-primary/5">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Facture</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Commande</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Client</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Montant</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Téléphone</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-secondary uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.map((facture) => (
                  <tr key={facture.id} className="border-b border-primary/5 hover:bg-surface-low/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-primary font-bold">{facture.numero_facture}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.18em] mt-1">{formatDate(facture.created_at)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-primary">MD-{facture.id_commande}</p>
                      <p className="text-[10px] text-stone-500 mt-1">{facture.commandes?.statut || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-primary">{facture.nomcomplete || facture.utilisateurs?.nom || 'Client'}</p>
                    </td>
                    <td className="px-8 py-5 font-bold text-primary">{formatCurrency(facture.montant_totale)} DH</td>
                    <td className="px-8 py-5">{facture.telephone || facture.utilisateurs?.telephone || '-'}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          aria-label="Voir les détails"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-primary/10 bg-white text-primary transition hover:bg-primary/5"
                          onClick={() => handleOpenDetails(facture)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          aria-label="Télécharger la facture"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-primary/10 bg-white text-secondary transition hover:text-primary hover:bg-surface-low"
                          onClick={() => createPrintableInvoice(facture)}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          aria-label="Supprimer la facture"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-red-50 text-red-600 border border-red-100 transition hover:bg-red-100"
                          onClick={() => handleDeleteInvoice(facture.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-primary/5 px-8 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Nouvelle facture</p>
                <h2 className="text-3xl font-serif text-primary">Ajouter une facture</h2>
              </div>
              <button className="rounded-full border border-primary/10 p-3 text-secondary hover:bg-primary/5" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <form className="space-y-5" onSubmit={(event) => {
                handleCreateInvoice(event);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Numéro de commande</span>
                    <select
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low focus:border-primary focus:outline-none"
                      value={selectedOrderId}
                      onChange={(event) => setSelectedOrderId(event.target.value)}
                    >
                      <option value="">Sélectionnez une commande</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          MD-{order.id} — {order.utilisateurs?.nom || 'Client'} — {order.prix_total ? `${formatCurrency(order.prix_total)} DH` : '0,00 DH'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Date d'émission</span>
                    <input
                      type="date"
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low focus:border-primary focus:outline-none"
                      value={dateEmission}
                      onChange={(event) => setDateEmission(event.target.value)}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Date de paiement</span>
                    <input
                      type="date"
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low focus:border-primary focus:outline-none"
                      value={datePaiement}
                      onChange={(event) => setDatePaiement(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Client</span>
                    <input
                      type="text"
                      value={selectedOrder?.utilisateurs?.nom || ''}
                      disabled
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low text-stone-500"
                    />
                  </label>
                </div>

                {selectedOrder?.produits && (
                  <div className="rounded-3xl border border-primary/10 bg-surface-low p-4 space-y-3">
                    <p className="text-sm font-medium text-secondary">Produits de la commande</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-3">
                        <div>
                          <p className="font-semibold text-primary">{selectedOrder.produits.nom || 'Produit'}</p>
                          <p className="text-xs text-stone-500">Quantité : {selectedOrder.quantite || 1}</p>
                        </div>
                        <p className="font-semibold text-primary">
                          {selectedOrder.produits.prix ? `${formatCurrency(selectedOrder.produits.prix)} DH` : '0,00 DH'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Email</span>
                    <input
                      type="text"
                      value={selectedOrder?.utilisateurs?.email || ''}
                      disabled
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low text-stone-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Téléphone</span>
                    <input
                      type="text"
                      value={selectedOrder?.utilisateurs?.telephone || ''}
                      disabled
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low text-stone-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-secondary">Montant estimé</span>
                    <input
                      type="text"
                      value={selectedOrder ? `${formatCurrency(selectedOrder.prix_total)} DH` : ''}
                      disabled
                      className="w-full rounded-3xl border border-primary/10 px-4 py-3 bg-surface-low text-stone-500"
                    />
                  </label>
                </div>

                {errorMessage && (
                  <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-4 text-white font-bold shadow-lg shadow-primary/10 transition hover:brightness-110 disabled:opacity-50"
                    disabled={creating}
                  >
                    <Plus size={18} />
                    {creating ? 'Enregistrement...' : 'Enregistrer la facture'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-primary/10 bg-white px-6 py-4 text-primary font-bold transition hover:bg-primary/5"
                    onClick={() => setShowAddModal(false)}
                  >
                    <X size={18} /> Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetails && activeFacture && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-primary/5 px-8 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Facture</p>
                <h2 className="text-3xl font-serif text-primary">{activeFacture.numero_facture}</h2>
              </div>
              <button className="rounded-full border border-primary/10 p-3 text-secondary transition hover:bg-primary/5" onClick={() => setShowDetails(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[0.65fr_0.35fr] gap-6 p-8">
              <div className="space-y-6">
                <div className="rounded-3xl border border-primary/5 bg-surface-low p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Client</p>
                      <p className="text-xl font-bold text-primary">{activeFacture.nomcomplete || activeFacture.utilisateurs?.nom}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">{activeFacture.statut || 'En attente'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-600">
                    <div>
                      <p className="font-semibold text-secondary">Téléphone</p>
                      <p>{activeFacture.telephone || activeFacture.utilisateurs?.telephone || '-'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Email</p>
                      <p>{activeFacture.email || activeFacture.utilisateurs?.email || '-'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-semibold text-secondary">Adresse</p>
                      <p>{activeFacture.adresse || activeFacture.utilisateurs?.adresse || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-primary/5 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-600">
                    <div>
                      <p className="font-semibold text-secondary">Commande</p>
                      <p>MD-{activeFacture.id_commande}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Date d'émission</p>
                      <p>{formatDate(activeFacture.date_emission)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Date paiement</p>
                      <p>{formatDate(activeFacture.date_paiement)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-secondary">Montant</p>
                      <p>{formatCurrency(activeFacture.montant_totale)} DH</p>
                    </div>
                  </div>
                </div>

                {activeFacture.commandes?.produits && (
                  <div className="rounded-3xl border border-primary/5 p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Produits associés</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4 rounded-3xl bg-surface-low p-4">
                        <div>
                          <p className="font-semibold text-primary">{activeFacture.commandes.produits.nom || 'Produit'}</p>
                          <p className="text-sm text-stone-500">Quantité: {activeFacture.commandes.quantite || 1}</p>
                        </div>
                        <p className="font-bold text-primary">{activeFacture.commandes.produits.prix ? `${formatCurrency(activeFacture.commandes.produits.prix)} DH` : '0,00 DH'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-primary/5 bg-surface-low p-6 h-fit space-y-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Total facture</p>
                  <p className="text-4xl font-serif text-primary">{formatCurrency(activeFacture.montant_totale)} DH</p>
                </div>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-primary px-6 py-4 text-white font-bold transition hover:brightness-110"
                  onClick={() => createPrintableInvoice(activeFacture)}
                >
                  <Printer size={18} /> Télécharger / imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
