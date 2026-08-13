import React, { useState } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin, Edit, Trash2, Check, X } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

const Customers = () => {
  const { userProfile } = useAuth();
  const canEdit = userProfile?.role === 'owner' || userProfile?.role === 'manager' || userProfile?.role === 'accountant';

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', location: '' });

  const { data: customers, loading } = useCollection('customers');
  const { addDocument, updateDocument, deleteDocument } = useFirestore('customers');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', location: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      location: customer.location || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateDocument(editingId, { ...formData });
    } else {
      await addDocument({
        ...formData,
        balance: 0,
        lastPurchase: '-',
        status: 'Active'
      });
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Customers</h1><p className="page-subtitle">Manage customer profiles and balances</p></div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Add Customer'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Customer' : 'New Customer'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}><label>Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 140px' }}><label>Phone</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 180px' }}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="form-group" style={{ flex: '1 1 180px' }}><label>Location</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            <div style={{ width: '100%', marginTop: '8px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? <><Check size={16} /> Update Customer</> : 'Save Customer'}
              </button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}><X size={16} /> Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search customers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
           <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Contact</th><th>Location</th><th>Outstanding Balance</th><th>Last Purchase</th><th>Status</th>{canEdit && <th>Actions</th>}</tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="cell-bold"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="avatar-circle">{c.name.charAt(0)}</div> {c.name}</div></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}><Phone size={12}/> {c.phone}</span>
                      {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}><Mail size={12}/> {c.email}</span>}
                    </div>
                  </td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {c.location}</span></td>
                  <td className="numeric" style={{ color: c.balance > 0 ? 'var(--color-danger)' : 'inherit' }}>RWF {c.balance?.toFixed(2) || '0.00'}</td>
                  <td>{c.lastPurchase}</td>
                  <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                  {canEdit && (
                    <td className="cell-actions">
                      <button className="icon-btn" onClick={() => handleEdit(c)} aria-label="Edit"><Edit size={16} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(c.id)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={canEdit ? '7' : '6'} style={{ textAlign: 'center' }}>No customers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Customers;
