import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, Eye, Edit } from 'lucide-react';

const sampleCustomers = [
  { id: 'C001', name: 'Acme Corp', phone: '+250 788 123 456', email: 'acme@example.com', purchases: 12, balance: 0 },
  { id: 'C002', name: 'Smith Trading', phone: '+250 788 234 567', email: 'smith@example.com', purchases: 8, balance: 1400.00 },
  { id: 'C003', name: 'Global Imports', phone: '+250 788 345 678', email: 'global@example.com', purchases: 5, balance: 890.00 },
  { id: 'C004', name: 'QuickMart', phone: '+250 788 456 789', email: 'quick@example.com', purchases: 22, balance: 0 },
  { id: 'C005', name: 'Riverside Co', phone: '+250 788 567 890', email: 'river@example.com', purchases: 3, balance: 0 },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = sampleCustomers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Customers</h1><p className="page-subtitle">Manage customer relationships and balances</p></div>
        <button className="btn btn-primary" id="add-customer-btn"><Plus size={18} /> Add Customer</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search customers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="customers-search" /></div>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="customers-table">
          <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Purchases</th><th>Balance</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="cell-bold">{c.id}</td>
                <td>{c.name}</td>
                <td><Phone size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{c.phone}</td>
                <td><Mail size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{c.email}</td>
                <td className="numeric">{c.purchases}</td>
                <td className="numeric">{c.balance > 0 ? <span style={{ color: 'var(--color-danger)' }}>${c.balance.toFixed(2)}</span> : <span style={{ color: 'var(--color-success)' }}>$0.00</span>}</td>
                <td className="cell-actions"><button className="icon-btn" aria-label="View"><Eye size={16} /></button><button className="icon-btn" aria-label="Edit"><Edit size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
