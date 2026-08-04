import React, { useState } from 'react';
import { Plus, Search, Eye, Package, ArrowUpCircle } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: purchases, loading } = useCollection('purchases');
  const { data: products } = useCollection('products');
  const { addDocument } = useFirestore('purchases');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    productId: '', quantity: '', total: '', status: 'Pending' 
  });

  // Get selected product details
  const selectedProduct = products.find(p => p.id === formData.productId);
  const calculatedTotalItems = selectedProduct 
    ? parseInt(formData.quantity || 0) * (selectedProduct.ipq || 1) 
    : 0;

  const filtered = purchases.filter(p =>
    (p.productName && p.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const quantity = parseInt(formData.quantity, 10);
    const ipq = selectedProduct.ipq || 1;
    const totalItems = quantity * ipq;

    // 1. Save the purchase record
    await addDocument({
      productId: formData.productId,
      productName: selectedProduct.name,
      supplier: selectedProduct.supplier,
      quantity,
      ipq,
      totalItems,
      total: parseFloat(formData.total),
      status: formData.status,
      date: new Date().toISOString().split('T')[0]
    });

    // 2. Update the product's inventory (add stock)
    const productRef = doc(db, 'products', formData.productId);
    await updateDoc(productRef, {
      qty: increment(quantity),
      totalItems: increment(totalItems)
    });
    
    setShowForm(false);
    setFormData({ productId: '', quantity: '', total: '', status: 'Pending' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Purchases</h1><p className="page-subtitle">Record purchases from suppliers — stock is automatically added to inventory</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Record Purchase'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>New Purchase</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '1 1 220px' }}>
              <label>Product</label>
              <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
                <option value="">Select a product…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (IPQ: {p.ipq || 1})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label>Quantity (boxes/units)</label>
              <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="e.g. 3" />
            </div>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label>Total Cost</label>
              <input type="number" step="0.01" required value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label>Payment Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {selectedProduct && formData.quantity && (
              <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(63, 191, 127, 0.1)', borderRadius: '10px', fontSize: '14px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <ArrowUpCircle size={16} color="var(--color-success)" />
                <span><strong>Stock to add:</strong> {formData.quantity} qty × {selectedProduct.ipq || 1} IPQ = <strong>{calculatedTotalItems} items</strong></span>
                <span style={{ color: 'var(--color-text-secondary)' }}>→ Supplier: {selectedProduct.supplier}</span>
              </div>
            )}
            
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Purchase & Add Stock</button></div>
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
            <thead><tr><th>PO #</th><th>Product</th><th>Supplier</th><th>Qty</th><th>IPQ</th><th>Total Items</th><th>Total Cost</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="cell-bold">{p.id.substring(0, 8).toUpperCase()}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> {p.productName || '—'}</span></td>
                  <td>{p.supplier}</td>
                  <td className="numeric">{p.quantity ?? p.products ?? '—'}</td>
                  <td className="numeric">{p.ipq || '—'}</td>
                  <td className="numeric" style={{ fontWeight: 600 }}>{p.totalItems ?? '—'}</td>
                  <td className="numeric">${(p.total || 0).toFixed(2)}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{p.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No purchases found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Purchases;
