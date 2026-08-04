import React, { useState } from 'react';
import { Users, Search, Plus, Mail, Phone, MapPin } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', location: '' });

  const { data: customers, loading } = useCollection('customers');
  const { addDocument } = useFirestore('customers');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDocument({
      ...formData,
      balance: 0,
      lastPurchase: '-',
      status: 'Active'
    });
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '', location: '' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Customers</h1><p className="page-subtitle">Manage customer profiles and balances</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Name</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group"><label>Phone</label><input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="form-group"><label>Location</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Customer</button></div>
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
            <thead><tr><th>Name</th><th>Contact</th><th>Location</th><th>Outstanding Balance</th><th>Last Purchase</th><th>Status</th></tr></thead>
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
                  <td className="numeric" style={{ color: c.balance > 0 ? 'var(--color-danger)' : 'inherit' }}>${c.balance?.toFixed(2) || '0.00'}</td>
                  <td>{c.lastPurchase}</td>
                  <td><span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No customers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Customers;
