import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: sales, loading } = useCollection('sales');
  const { addDocument } = useFirestore('sales');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', items: '', total: '', paid: '', method: ''
  });

  const filtered = sales.filter(s =>
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = parseFloat(formData.total);
    const paid = parseFloat(formData.paid);
    const balance = total - paid;
    
    let status = 'Pending';
    if (paid >= total) status = 'Paid';
    else if (paid > 0) status = 'Partially Paid';

    await addDocument({
      customer: formData.customer,
      products: parseInt(formData.items, 10),
      total,
      paid,
      balance,
      method: formData.method,
      status,
      date: new Date().toISOString().split('T')[0]
    });
    
    // In a real app, this would also deduct from inventory (stock movements)
    
    setShowForm(false);
    setFormData({ customer: '', items: '', total: '', paid: '', method: '' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Sales</h1><p className="page-subtitle">Record and track all business sales</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Record Sale'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Customer</label><input required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} /></div>
            <div className="form-group"><label>Total Items</label><input type="number" required value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} /></div>
            <div className="form-group"><label>Total Amount</label><input type="number" step="0.01" required value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} /></div>
            <div className="form-group"><label>Amount Paid</label><input type="number" step="0.01" required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} /></div>
            <div className="form-group">
              <label>Payment Method</label>
              <select required value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Sale</button></div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search sales…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Invoice ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="cell-bold">{s.id.substring(0, 8).toUpperCase()}</td>
                  <td>{s.customer}</td>
                  <td className="numeric">{s.products}</td>
                  <td className="numeric">${s.total.toFixed(2)}</td>
                  <td className="numeric">${s.paid.toFixed(2)}</td>
                  <td className="numeric">${s.balance.toFixed(2)}</td>
                  <td>{s.method}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No sales found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sales;
