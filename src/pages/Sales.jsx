import React, { useState } from 'react';
import { Plus, Search, Package, ArrowDownCircle } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: sales, loading } = useCollection('sales');
  const { data: products } = useCollection('products');
  const { addDocument } = useFirestore('sales');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', productId: '', sellType: 'quantity', amount: '', paid: '', method: ''
  });

  // Get selected product details
  const selectedProduct = products.find(p => p.id === formData.productId);
  
  // Calculate unit price based on sell type
  const unitPrice = selectedProduct 
    ? (formData.sellType === 'quantity' ? (selectedProduct.sellPriceQty || selectedProduct.sellPrice || 0) : (selectedProduct.sellPriceItem || 0))
    : 0;
  const calculatedTotal = parseInt(formData.amount || 0) * unitPrice;

  // Validate stock availability
  const availableQty = selectedProduct ? (selectedProduct.qty || 0) : 0;
  const availableItems = selectedProduct ? (selectedProduct.totalItems || availableQty * (selectedProduct.ipq || 1)) : 0;
  const maxAllowed = formData.sellType === 'quantity' ? availableQty : availableItems;

  const filtered = sales.filter(s =>
    (s.customer && s.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.productName && s.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = parseInt(formData.amount, 10);
    const paid = parseFloat(formData.paid);
    const total = amount * unitPrice;
    const balance = total - paid;
    const ipq = selectedProduct.ipq || 1;
    
    let status = 'Pending';
    if (paid >= total) status = 'Paid';
    else if (paid > 0) status = 'Partially Paid';

    // Calculate how much to deduct from inventory
    let qtyToDeduct, itemsToDeduct;
    if (formData.sellType === 'quantity') {
      qtyToDeduct = amount;
      itemsToDeduct = amount * ipq;
    } else {
      // Selling individual items
      itemsToDeduct = amount;
      qtyToDeduct = Math.floor(amount / ipq);  // Full boxes consumed
    }

    // 1. Save the sale record
    await addDocument({
      customer: formData.customer,
      productId: formData.productId,
      productName: selectedProduct.name,
      sellType: formData.sellType,
      amount,
      unitPrice,
      ipq,
      total,
      paid,
      balance,
      method: formData.method,
      status,
      date: new Date().toISOString().split('T')[0]
    });

    // 2. Deduct stock from inventory
    const productRef = doc(db, 'products', formData.productId);
    await updateDoc(productRef, {
      totalItems: increment(-itemsToDeduct),
      qty: increment(-qtyToDeduct)
    });
    
    setShowForm(false);
    setFormData({ customer: '', productId: '', sellType: 'quantity', amount: '', paid: '', method: '' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Sales</h1><p className="page-subtitle">Record and track sales — stock is automatically deducted from inventory</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Record Sale'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>New Sale</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label>Customer</label>
              <input required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: '1 1 220px' }}>
              <label>Product</label>
              <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value, amount: ''})}>
                <option value="">Select a product…</option>
                {products.map(p => {
                  const ti = p.totalItems ?? (p.qty * (p.ipq || 1));
                  return (
                    <option key={p.id} value={p.id}>{p.name} — {p.qty} qty / {ti} items</option>
                  );
                })}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label>Sell By</label>
              <select required value={formData.sellType} onChange={e => setFormData({...formData, sellType: e.target.value, amount: ''})}>
                <option value="quantity">Quantity (boxes/units)</option>
                <option value="item">Individual Items</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label>{formData.sellType === 'quantity' ? 'Qty to sell' : 'Items to sell'}</label>
              <input 
                type="number" required min="1" 
                max={maxAllowed}
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                placeholder={`Max: ${maxAllowed}`}
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 120px' }}>
              <label>Amount Paid</label>
              <input type="number" step="0.01" required value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label>Payment Method</label>
              <select required value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                <option value="">Select Method</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            {selectedProduct && formData.amount && (
              <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(225, 91, 91, 0.08)', borderRadius: '10px', fontSize: '14px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <ArrowDownCircle size={16} color="var(--color-danger)" />
                <span>
                  <strong>Selling:</strong> {formData.amount} {formData.sellType === 'quantity' ? 'boxes' : 'items'} of {selectedProduct.name}
                </span>
                <span>@ <strong>${unitPrice.toFixed(2)}</strong>/{formData.sellType === 'quantity' ? 'qty' : 'item'}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  Total: ${calculatedTotal.toFixed(2)}
                </span>
              </div>
            )}
            
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Sale & Deduct Stock</button></div>
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
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Product</th><th>Type</th><th>Amount</th><th>Unit Price</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="cell-bold">{s.id.substring(0, 8).toUpperCase()}</td>
                  <td>{s.customer}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> {s.productName || '—'}</span></td>
                  <td><span className={`badge ${s.sellType === 'quantity' ? 'badge-info' : 'badge-warning'}`}>{s.sellType === 'quantity' ? 'Qty' : 'Item'}</span></td>
                  <td className="numeric">{s.amount ?? s.products ?? '—'}</td>
                  <td className="numeric">${(s.unitPrice || 0).toFixed(2)}</td>
                  <td className="numeric">${(s.total || 0).toFixed(2)}</td>
                  <td className="numeric">${(s.paid || 0).toFixed(2)}</td>
                  <td className="numeric">${(s.balance || 0).toFixed(2)}</td>
                  <td>{s.method}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="12" style={{ textAlign: 'center' }}>No sales found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sales;
