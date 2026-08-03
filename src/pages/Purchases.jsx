import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react';

const samplePurchases = [
  { id: 'PO-0018', supplier: 'TechCo', products: 4, total: 2800.00, status: 'Paid', date: '2026-08-02' },
  { id: 'PO-0017', supplier: 'WireCorp', products: 2, total: 1200.00, status: 'Partially Paid', date: '2026-07-29' },
  { id: 'PO-0016', supplier: 'ConnectPlus', products: 6, total: 4500.00, status: 'Pending', date: '2026-07-25' },
  { id: 'PO-0015', supplier: 'InputTech', products: 3, total: 900.00, status: 'Paid', date: '2026-07-20' },
];

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = samplePurchases.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Purchases</h1><p className="page-subtitle">Track all purchases from suppliers</p></div>
        <button className="btn btn-primary" id="record-purchase-btn"><Plus size={18} /> Record Purchase</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search purchases…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="purchases-search" /></div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="purchases-table">
          <thead><tr><th>PO Number</th><th>Supplier</th><th>Items</th><th>Total Cost</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="cell-bold">{p.id}</td>
                <td>{p.supplier}</td>
                <td className="numeric">{p.products}</td>
                <td className="numeric">${p.total.toFixed(2)}</td>
                <td>{statusBadge(p.status)}</td>
                <td>{p.date}</td>
                <td className="cell-actions"><button className="icon-btn" aria-label="View"><Eye size={16} /></button><button className="icon-btn" aria-label="Edit"><Edit size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
