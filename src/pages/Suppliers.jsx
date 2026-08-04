import React, { useState } from 'react';
import { Building2, Search, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', phone: '', email: '', categories: '' });

  const { data: suppliers, loading } = useCollection('suppliers');
  const { addDocument } = useFirestore('suppliers');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.categories && s.categories.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDocument({
      ...formData,
      balance: 0,
      status: 'Active'
    });
    setShowForm(false);
    setFormData({ name: '', contact: '', phone: '', email: '', categories: '' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Suppliers</h1><p className="page-subtitle">Manage supplier profiles and accounts payable</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Company Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group"><label>Contact Person</label><input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} /></div>
            <div className="form-group"><label>Phone</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="form-group"><label>Products Supplied</label><input value={formData.categories} onChange={e => setFormData({...formData, categories: e.target.value})} /></div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Supplier</button></div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search suppliers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Supplier</th><th>Contact Details</th><th>Products/Categories</th><th>Outstanding Balance</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="cell-bold"><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="avatar-circle" style={{ background: 'var(--color-primary-dark)', color: 'var(--color-accent-lime)' }}><Building2 size={16}/></div> {s.name}</div></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{s.contact}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}><Phone size={12}/> {s.phone}</span>
                      {s.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}><Mail size={12}/> {s.email}</span>}
                    </div>
                  </td>
                  <td><span className="badge badge-info">{s.categories}</span></td>
                  <td className="numeric" style={{ color: s.balance > 0 ? 'var(--color-danger)' : 'inherit' }}>${s.balance?.toFixed(2) || '0.00'}</td>
                  <td><span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No suppliers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
