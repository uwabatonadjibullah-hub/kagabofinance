import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: purchases, loading } = useCollection('purchases');
  const { addDocument } = useFirestore('purchases');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ supplier: '', items: '', total: '', status: 'Pending' });

  const filtered = purchases.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDocument({
      supplier: formData.supplier,
      products: parseInt(formData.items, 10),
      total: parseFloat(formData.total),
      status: formData.status,
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowForm(false);
    setFormData({ supplier: '', items: '', total: '', status: 'Pending' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Purchases</h1><p className="page-subtitle">Track all purchases from suppliers</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Record Purchase'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Supplier Name</label><input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} /></div>
            <div className="form-group"><label>Total Items</label><input type="number" required value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} /></div>
            <div className="form-group"><label>Total Cost</label><input type="number" step="0.01" required value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} /></div>
            <div className="form-group">
              <label>Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Purchase</button></div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search purchases…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>PO Number</th><th>Supplier</th><th>Items</th><th>Total Cost</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="cell-bold">{p.id.substring(0, 8).toUpperCase()}</td>
                  <td>{p.supplier}</td>
                  <td className="numeric">{p.products}</td>
                  <td className="numeric">${p.total.toFixed(2)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{p.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No purchases found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Purchases;
