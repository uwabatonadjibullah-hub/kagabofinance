import React, { useState } from 'react';
import { Plus, Search, Package, ArrowDownCircle, Edit, Trash2, Check, X } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const Sales = () => {
  const { userProfile } = useAuth();
  const canEdit = userProfile?.role === 'owner' || userProfile?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const { data: sales, loading } = useCollection('sales');
  const { data: products } = useCollection('products');
  const { addDocument, updateDocument, deleteDocument } = useFirestore('sales');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customer: '', productId: '', sellType: 'quantity', amount: '', paid: '', method: ''
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const unitPrice = selectedProduct 
    ? (formData.sellType === 'quantity' ? (selectedProduct.sellPriceQty || selectedProduct.sellPrice || 0) : (selectedProduct.sellPriceItem || 0))
    : 0;
  const calculatedTotal = parseInt(formData.amount || 0) * unitPrice;
  const availableQty = selectedProduct ? (selectedProduct.qty || 0) : 0;
  const availableItems = selectedProduct ? (selectedProduct.totalItems || availableQty * (selectedProduct.ipq || 1)) : 0;

  // When editing, restore the original amount to compute the true available ceiling.
  // e.g. if customer took 20 and 5 remain → editing allows up to 25 (20 + 5).
  const originalSale = editingId ? sales.find(s => s.id === editingId) : null;
  const originalSaleAmount = originalSale?.amount || 0;
  const originalSaleType = originalSale?.sellType || formData.sellType;

  // Compute how many original units match the current sellType to add back correctly
  const origQtyEquivalent = (() => {
    if (!originalSale) return 0;
    if (originalSaleType === 'quantity' && formData.sellType === 'quantity') return originalSaleAmount;
    if (originalSaleType === 'item'     && formData.sellType === 'item')     return originalSaleAmount;
    if (originalSaleType === 'quantity' && formData.sellType === 'item')     return originalSaleAmount * (originalSale.ipq || selectedProduct?.ipq || 1);
    if (originalSaleType === 'item'     && formData.sellType === 'quantity') return Math.floor(originalSaleAmount / (originalSale.ipq || selectedProduct?.ipq || 1));
    return 0;
  })();

  const maxAllowed = editingId
    ? (formData.sellType === 'quantity' ? availableQty + origQtyEquivalent : availableItems + origQtyEquivalent)
    : (formData.sellType === 'quantity' ? availableQty : availableItems);

  const filtered = sales.filter(s =>
    (s.customer && s.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.productName && s.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Paid': 'badge-success', 'Partially Paid': 'badge-warning', 'Pending': 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const resetForm = () => {
    setFormData({ customer: '', productId: '', sellType: 'quantity', amount: '', paid: '', method: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (sale) => {
    setEditingId(sale.id);
    setFormData({
      customer: sale.customer || '',
      productId: sale.productId || '',
      sellType: sale.sellType || 'quantity',
      amount: (sale.amount || '').toString(),
      paid: (sale.paid || '').toString(),
      method: sale.method || '',
    });
    setShowForm(true);
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

    let qtyToDeduct, itemsToDeduct;
    if (formData.sellType === 'quantity') {
      qtyToDeduct = amount;
      itemsToDeduct = amount * ipq;
    } else {
      itemsToDeduct = amount;
      qtyToDeduct = Math.floor(amount / ipq);
    }

    const docData = {
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
    };

    if (editingId) {
      // Reverse original stock deduction first
      const original = sales.find(s => s.id === editingId);
      if (original && original.productId) {
        let origQtyRestore, origItemsRestore;
        if (original.sellType === 'quantity') {
          origQtyRestore = original.amount || 0;
          origItemsRestore = (original.amount || 0) * (original.ipq || 1);
        } else {
          origItemsRestore = original.amount || 0;
          origQtyRestore = Math.floor((original.amount || 0) / (original.ipq || 1));
        }
        const origRef = doc(db, 'products', original.productId);
        await updateDoc(origRef, {
          qty: increment(origQtyRestore),
          totalItems: increment(origItemsRestore)
        });
      }
      await updateDocument(editingId, docData);
    } else {
      await addDocument(docData);
    }

    // Deduct new stock
    const productRef = doc(db, 'products', formData.productId);
    await updateDoc(productRef, {
      totalItems: increment(-itemsToDeduct),
      qty: increment(-qtyToDeduct)
    });
    
    resetForm();
  };

  const handleDelete = async (sale) => {
    if (!window.confirm("Delete this sale? Stock will be restored to inventory.")) return;
    
    // Restore stock
    if (sale.productId) {
      let qtyRestore, itemsRestore;
      if (sale.sellType === 'quantity') {
        qtyRestore = sale.amount || 0;
        itemsRestore = (sale.amount || 0) * (sale.ipq || 1);
      } else {
        itemsRestore = sale.amount || 0;
        qtyRestore = Math.floor((sale.amount || 0) / (sale.ipq || 1));
      }
      const productRef = doc(db, 'products', sale.productId);
      await updateDoc(productRef, {
        qty: increment(qtyRestore),
        totalItems: increment(itemsRestore)
      });
    }
    await deleteDocument(sale.id);
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Sales</h1><p className="page-subtitle">Record and track sales — stock is automatically deducted from inventory</p></div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Record Sale'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Sale' : 'New Sale'}</h3>
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
                  return <option key={p.id} value={p.id}>{p.name} — {p.qty} qty / {ti} items</option>;
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
              <input type="number" required min="1" max={maxAllowed} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder={`Max: ${maxAllowed}`} />
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
                <span><strong>Selling:</strong> {formData.amount} {formData.sellType === 'quantity' ? 'boxes' : 'items'} of {selectedProduct.name}</span>
                <span>@ <strong>RWF {unitPrice.toFixed(2)}</strong>/{formData.sellType === 'quantity' ? 'qty' : 'item'}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>Total: RWF {calculatedTotal.toFixed(2)}</span>
                {editingId && originalSale && (
                  <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-secondary)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>
                    Was: <strong>{originalSaleAmount}</strong> → Now: <strong>{formData.amount}</strong>
                    &nbsp;|&nbsp;Stock after save:{' '}
                    <strong style={{ color: (maxAllowed - parseInt(formData.amount || 0)) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {maxAllowed - parseInt(formData.amount || 0)} {formData.sellType === 'quantity' ? 'boxes' : 'items'}
                    </strong>
                  </span>
                )}
              </div>
            )}
            
            <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? <><Check size={16} /> Update Sale</> : 'Save Sale & Deduct Stock'}
              </button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}><X size={16} /> Cancel</button>}
            </div>
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
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Product</th><th>Type</th><th>Amount</th><th>Unit Price</th><th>Total</th><th>Paid</th><th>Balance</th><th>Method</th><th>Status</th><th>Date</th>{canEdit && <th>Actions</th>}</tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="cell-bold">{s.id.substring(0, 8).toUpperCase()}</td>
                  <td>{s.customer}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> {s.productName || '—'}</span></td>
                  <td><span className={`badge ${s.sellType === 'quantity' ? 'badge-info' : 'badge-warning'}`}>{s.sellType === 'quantity' ? 'Qty' : 'Item'}</span></td>
                  <td className="numeric">{s.amount ?? s.products ?? '—'}</td>
                  <td className="numeric">RWF {(s.unitPrice || 0).toFixed(2)}</td>
                  <td className="numeric">RWF {(s.total || 0).toFixed(2)}</td>
                  <td className="numeric">RWF {(s.paid || 0).toFixed(2)}</td>
                  <td className="numeric">RWF {(s.balance || 0).toFixed(2)}</td>
                  <td>{s.method}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td>{s.date}</td>
                  {canEdit && (
                    <td className="cell-actions">
                      <button className="icon-btn" onClick={() => handleEdit(s)} aria-label="Edit"><Edit size={16} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(s)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={canEdit ? '13' : '12'} style={{ textAlign: 'center' }}>No sales found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sales;
