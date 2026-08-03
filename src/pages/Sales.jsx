import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react';

const sampleSales = [
  { id: 'INV-0042', customer: 'Acme Corp', products: 3, total: 1250.00, paid: 1250.00, balance: 0, method: 'Bank Transfer', status: 'Paid', date: '2026-08-03' },
  { id: 'INV-0041', customer: 'Smith Trading', products: 5, total: 3400.00, paid: 2000.00, balance: 1400.00, method: 'Credit', status: 'Partially Paid', date: '2026-08-02' },
  { id: 'INV-0040', customer: 'Global Imports', products: 2, total: 890.00, paid: 0, balance: 890.00, method: 'Credit', status: 'Pending', date: '2026-08-01' },
  { id: 'INV-0039', customer: 'QuickMart', products: 8, total: 5620.00, paid: 5620.00, balance: 0, method: 'Cash', status: 'Paid', date: '2026-07-31' },
  { id: 'INV-0038', customer: 'Riverside Co', products: 1, total: 450.00, paid: 450.00, balance: 0, method: 'Mobile Money', status: 'Paid', date: '2026-07-30' },
];

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = sampleSales.filter(s =>
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Sales</h1><p className="page-subtitle">Record and track all business sales</p></div>
        <button className="btn btn-primary" id="record-sale-btn"><Plus size={18} /> Record Sale</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search sales…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="sales-search" /></div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="sales-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="cell-bold">{s.id}</td>
                <td>{s.customer}</td>
                <td className="numeric">{s.products}</td>
                <td className="numeric">${s.total.toFixed(2)}</td>
                <td className="numeric">${s.paid.toFixed(2)}</td>
                <td className="numeric">${s.balance.toFixed(2)}</td>
                <td>{s.method}</td>
                <td>{statusBadge(s.status)}</td>
                <td>{s.date}</td>
                <td className="cell-actions"><button className="icon-btn" aria-label="View"><Eye size={16} /></button><button className="icon-btn" aria-label="Edit"><Edit size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
