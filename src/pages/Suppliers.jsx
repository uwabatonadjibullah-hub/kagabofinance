import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, Eye, Edit } from 'lucide-react';

const sampleSuppliers = [
  { id: 'S001', name: 'TechCo', contact: 'James K.', phone: '+250 788 111 222', email: 'james@techco.com', products: 'Electronics', balance: 0 },
  { id: 'S002', name: 'WireCorp', contact: 'Marie L.', phone: '+250 788 222 333', email: 'marie@wirecorp.com', products: 'Cables, Accessories', balance: 1200.00 },
  { id: 'S003', name: 'ConnectPlus', contact: 'Peter N.', phone: '+250 788 333 444', email: 'peter@connectplus.com', products: 'Hubs, Adapters', balance: 4500.00 },
  { id: 'S004', name: 'InputTech', contact: 'Sarah M.', phone: '+250 788 444 555', email: 'sarah@inputtech.com', products: 'Peripherals', balance: 0 },
];

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = sampleSuppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Suppliers</h1><p className="page-subtitle">Manage supplier relationships and payments</p></div>
        <button className="btn btn-primary" id="add-supplier-btn"><Plus size={18} /> Add Supplier</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search suppliers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="suppliers-search" /></div>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="suppliers-table">
          <thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Products</th><th>Balance Due</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="cell-bold">{s.id}</td>
                <td>{s.name}</td>
                <td>{s.contact}</td>
                <td><Phone size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{s.phone}</td>
                <td><Mail size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{s.email}</td>
                <td>{s.products}</td>
                <td className="numeric">{s.balance > 0 ? <span style={{ color: 'var(--color-warning)' }}>${s.balance.toFixed(2)}</span> : <span style={{ color: 'var(--color-success)' }}>$0.00</span>}</td>
                <td className="cell-actions"><button className="icon-btn" aria-label="View"><Eye size={16} /></button><button className="icon-btn" aria-label="Edit"><Edit size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;
