'use client';

import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function BillingPage() {
  const invoices = [
    { id: 'FAC-2024-001', client: 'Amine El Fassi', amount: '1250,00', status: 'Payée', date: '12/04/2024', type: 'Virement' },
    { id: 'FAC-2024-002', client: 'Sonia Bennis', amount: '2100,00', status: 'Partiel', date: '08/04/2024', type: 'Espèces' },
    { id: 'FAC-2024-003', client: 'Archi Design SARL', amount: '5400,00', status: 'En attente', date: '01/04/2024', type: 'Virement' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif text-primary">Facturation</h2>
          <p className="text-stone-500 font-medium">Gérez vos documents comptables et le suivi des paiements.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/10">
          <FileText size={20} />
          Nouvelle Facture
        </button>
      </div>

      {/* Stats Cards Small */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Encaissé', amount: '24 500 €', icon: <CheckCircle2 className="text-green-500" /> },
          { label: 'En attente', amount: '8 200 €', icon: <Clock className="text-orange-500" /> },
          { label: 'Retards', amount: '1 450 €', icon: <Filter className="text-red-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-primary/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-surface-low rounded-lg flex items-center justify-center text-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h4 className="text-xl font-black text-primary">{stat.amount}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-low border-b border-primary/5 font-work">
              <th className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Facture</th>
              <th className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Client</th>
              <th className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Montant</th>
              <th className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">État</th>
              <th className="px-8 py-6 text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-low/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="text-primary font-bold text-sm tracking-tight">{inv.id}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">{inv.date}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-primary font-bold text-sm">{inv.client}</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Moyen: {inv.type}</p>
                </td>
                <td className="px-8 py-5 text-sm font-black text-primary">{inv.amount} €</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    inv.status === 'Payée' ? 'bg-green-50 text-green-600 border-green-100' : 
                    inv.status === 'Partiel' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <button className="text-primary hover:text-primary-high transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <Eye size={16} /> APERÇU
                    </button>
                    <button className="text-stone-400 hover:text-primary transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Action Hint */}
      <div className="bg-surface-low border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Filter size={18} />
          </div>
          <p className="text-sm font-medium text-primary">Utilisez les filtres pour générer un récapitulatif fiscal annuel.</p>
        </div>
        <button className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] hover:text-primary transition-colors underline">Télécharger le rapport annuel</button>
      </div>
    </div>
  );
}
