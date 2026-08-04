import React, { useState } from 'react';
import { Truck, Search, Plus, MapPin, Calendar } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Logistics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    reference: '', type: 'Outgoing', destination: '', driver: '', vehicle: '', cost: '', status: 'In Transit' 
  });

  const { data: deliveries, loading } = useCollection('deliveries');
  const { addDocument } = useFirestore('deliveries');

  const filtered = deliveries.filter(d =>
    (d.id && d.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.destination && d.destination.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusBadge = (status) => {
    const map = { 'Delivered': 'badge-success', 'In Transit': 'badge-info', 'Pending': 'badge-warning', 'Cancelled': 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDocument({
      ...formData,
      cost: parseFloat(formData.cost),
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
    setFormData({ reference: '', type: 'Outgoing', destination: '', driver: '', vehicle: '', cost: '', status: 'In Transit' });
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Logistics</h1><p className="page-subtitle">Track incoming and outgoing deliveries</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Record Delivery'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Order/PO Reference</label><input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} /></div>
            <div className="form-group"><label>Type</label><select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="Outgoing">Outgoing (Sale)</option><option value="Incoming">Incoming (Purchase)</option></select></div>
            <div className="form-group"><label>Destination/Origin</label><input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
            <div className="form-group"><label>Driver/Logistics Partner</label><input required value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} /></div>
            <div className="form-group"><label>Vehicle Plate/ID</label><input value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})} /></div>
            <div className="form-group"><label>Transport Cost</label><input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} /></div>
            <div className="form-group"><label>Status</label><select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="Pending">Pending</option><option value="In Transit">In Transit</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save Delivery</button></div>
          </form>
        </div>
      )}

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search deliveries…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Delivery ID</th><th>Type</th><th>Ref</th><th>Destination</th><th>Driver & Vehicle</th><th>Cost</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td className="cell-bold">{d.id.substring(0, 8).toUpperCase()}</td>
                  <td><span className={`badge ${d.type === 'Outgoing' ? 'badge-info' : 'badge-warning'}`}>{d.type}</span></td>
                  <td>{d.reference}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {d.destination}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 500 }}>{d.driver}</span>
                      {d.vehicle && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12}/> {d.vehicle}</span>}
                    </div>
                  </td>
                  <td className="numeric">${d.cost?.toFixed(2)}</td>
                  <td>{statusBadge(d.status)}</td>
                  <td>{d.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No deliveries found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Logistics;
