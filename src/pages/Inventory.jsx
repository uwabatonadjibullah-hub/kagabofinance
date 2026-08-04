import React, { useState } from 'react';
import { Plus, Search, Filter, Package, Edit, Trash2 } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: '', supplier: '', buyPrice: '', sellPrice: '', qty: '', minStock: ''
  });

  const { data: products, loading } = useCollection('products');
  const { addDocument, deleteDocument } = useFirestore('products');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (qty, minStock) => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusBadge = (status) => {
    const map = { 'In Stock': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDocument({
      ...formData,
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: parseFloat(formData.sellPrice),
      qty: parseInt(formData.qty, 10),
      minStock: parseInt(formData.minStock, 10),
    });
    setShowForm(false);
    setFormData({ name: '', category: '', supplier: '', buyPrice: '', sellPrice: '', qty: '', minStock: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Inventory</h1><p className="page-subtitle">Manage your products and stock levels</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Product Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group"><label>Category</label><input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="form-group"><label>Supplier</label><input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} /></div>
            <div className="form-group"><label>Buy Price</label><input type="number" step="0.01" required value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} /></div>
            <div className="form-group"><label>Sell Price</label><input type="number" step="0.01" required value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} /></div>
            <div className="form-group"><label>Initial Qty</label><input type="number" required value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
            <div className="form-group"><label>Min Stock Alert</label><input type="number" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} /></div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Product</button></div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search products…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Supplier</th><th>Buy Price</th><th>Sell Price</th><th>Quantity</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const status = getStatus(p.qty, p.minStock);
                return (
                <tr key={p.id}>
                  <td className="cell-bold"><Package size={16} /> {p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.supplier}</td>
                  <td className="numeric">${p.buyPrice.toFixed(2)}</td>
                  <td className="numeric">${p.sellPrice.toFixed(2)}</td>
                  <td className="numeric">{p.qty}</td>
                  <td>{getStatusBadge(status)}</td>
                  <td className="cell-actions">
                    <button className="icon-btn danger" onClick={() => handleDelete(p.id)} aria-label="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              )})}
              {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
