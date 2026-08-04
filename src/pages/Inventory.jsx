import React, { useState } from 'react';
import { Plus, Search, Package, Trash2, Edit, Box, Layers, X, Check } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

const Inventory = () => {
  const { userProfile } = useAuth();
  const canEdit = userProfile?.role === 'owner' || userProfile?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', category: '', supplier: '', buyPrice: '', sellPriceQty: '', sellPriceItem: '', qty: '', ipq: '', minStock: ''
  });

  const { data: products, loading } = useCollection('products');
  const { addDocument, updateDocument, deleteDocument } = useFirestore('products');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatus = (totalItems, minStock, ipq) => {
    const qty = Math.floor(totalItems / (ipq || 1));
    if (totalItems <= 0) return 'Out of Stock';
    if (qty <= (minStock || 0)) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusBadge = (status) => {
    const map = { 'In Stock': 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', supplier: '', buyPrice: '', sellPriceQty: '', sellPriceItem: '', qty: '', ipq: '', minStock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      supplier: product.supplier || '',
      buyPrice: product.buyPrice?.toString() || '',
      sellPriceQty: (product.sellPriceQty || product.sellPrice || '').toString(),
      sellPriceItem: (product.sellPriceItem || '').toString(),
      qty: product.qty?.toString() || '',
      ipq: (product.ipq || '').toString(),
      minStock: (product.minStock || '').toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(formData.qty, 10);
    const ipq = parseInt(formData.ipq, 10);
    const docData = {
      name: formData.name,
      category: formData.category,
      supplier: formData.supplier,
      buyPrice: parseFloat(formData.buyPrice),
      sellPriceQty: parseFloat(formData.sellPriceQty),
      sellPriceItem: parseFloat(formData.sellPriceItem),
      qty,
      ipq,
      totalItems: qty * ipq,
      minStock: parseInt(formData.minStock, 10),
    };

    if (editingId) {
      await updateDocument(editingId, docData);
    } else {
      await addDocument(docData);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Inventory</h1><p className="page-subtitle">Manage your products and stock levels. Stock is updated through Purchases (adds) and Sales (subtracts).</p></div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Product'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}><label>Product Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 150px' }}><label>Category</label><input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 150px' }}><label>Supplier</label><input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 120px' }}><label>Buy Price / Qty</label><input type="number" step="0.01" required value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 120px' }}><label>Sell Price / Qty</label><input type="number" step="0.01" required value={formData.sellPriceQty} onChange={e => setFormData({...formData, sellPriceQty: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 120px' }}><label>Sell Price / Item</label><input type="number" step="0.01" required value={formData.sellPriceItem} onChange={e => setFormData({...formData, sellPriceItem: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 100px' }}><label>Qty (boxes)</label><input type="number" required value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 100px' }}><label>IPQ (Items/Qty)</label><input type="number" required min="1" value={formData.ipq} onChange={e => setFormData({...formData, ipq: e.target.value})} placeholder="e.g. 12" /></div>
            <div className="form-group" style={{ flex: '1 1 100px' }}><label>Min Stock Alert</label><input type="number" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} /></div>
            
            {formData.qty && formData.ipq && (
              <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(198, 242, 76, 0.1)', borderRadius: '10px', fontSize: '14px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Layers size={16} />
                <span><strong>Total Items:</strong> {parseInt(formData.qty || 0) * parseInt(formData.ipq || 0)}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>({formData.qty} boxes × {formData.ipq} items/box)</span>
              </div>
            )}
            
            <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? <><Check size={16} /> Update Product</> : 'Save Product'}
              </button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}><X size={16} /> Cancel Edit</button>}
            </div>
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
              <tr><th>Product</th><th>Category</th><th>Supplier</th><th>Buy Price</th><th>Sell/Qty</th><th>Sell/Item</th><th>Qty (boxes)</th><th>IPQ</th><th>Total Items</th><th>Status</th>{canEdit && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const totalItems = p.totalItems ?? (p.qty * (p.ipq || 1));
                const displayQty = Math.floor(totalItems / (p.ipq || 1));
                const looseItems = totalItems % (p.ipq || 1);
                const status = getStatus(totalItems, p.minStock, p.ipq);
                return (
                <tr key={p.id}>
                  <td className="cell-bold"><Package size={16} /> {p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.supplier}</td>
                  <td className="numeric">${(p.buyPrice || 0).toFixed(2)}</td>
                  <td className="numeric">${(p.sellPriceQty || p.sellPrice || 0).toFixed(2)}</td>
                  <td className="numeric">${(p.sellPriceItem || 0).toFixed(2)}</td>
                  <td className="numeric">
                    <span style={{ fontWeight: 600 }}>{displayQty}</span>
                    {looseItems > 0 && <span style={{ color: 'var(--color-warning)', fontSize: '12px', marginLeft: '4px' }}>+{looseItems}</span>}
                  </td>
                  <td className="numeric">{p.ipq || '—'}</td>
                  <td className="numeric" style={{ fontWeight: 600 }}>{totalItems}</td>
                  <td>{getStatusBadge(status)}</td>
                  {canEdit && (
                    <td className="cell-actions">
                      <button className="icon-btn" onClick={() => handleEdit(p)} aria-label="Edit"><Edit size={16} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(p.id)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              );})}
              {filtered.length === 0 && <tr><td colSpan={canEdit ? '12' : '11'} style={{ textAlign: 'center' }}>No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
