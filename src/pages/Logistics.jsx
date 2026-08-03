import React, { useState } from 'react';
import { Plus, Search, Truck, MapPin, Eye } from 'lucide-react';

const sampleDeliveries = [
  { id: 'DL-0012', type: 'Outgoing', destination: 'Acme Corp — Kigali', vehicle: 'Truck KG-2045', driver: 'Emmanuel T.', cost: 120.00, status: 'Delivered', date: '2026-08-03' },
  { id: 'DL-0011', type: 'Incoming', destination: 'TechCo Warehouse', vehicle: 'Van KG-3091', driver: 'Patrick R.', cost: 85.00, status: 'In Transit', date: '2026-08-02' },
  { id: 'DL-0010', type: 'Outgoing', destination: 'Smith Trading — Butare', vehicle: 'Truck KG-2045', driver: 'Emmanuel T.', cost: 200.00, status: 'Delivered', date: '2026-08-01' },
  { id: 'DL-0009', type: 'Incoming', destination: 'ConnectPlus Depot', vehicle: 'Van KG-3091', driver: 'Patrick R.', cost: 95.00, status: 'Scheduled', date: '2026-08-04' },
];

const Logistics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = sampleDeliveries.filter(d =>
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) || d.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = { 'Delivered': 'badge-success', 'In Transit': 'badge-warning', 'Scheduled': 'badge-info' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Logistics</h1><p className="page-subtitle">Track deliveries, vehicles, and transport costs</p></div>
        <button className="btn btn-primary" id="add-delivery-btn"><Plus size={18} /> New Delivery</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search deliveries…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="logistics-search" /></div>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="logistics-table">
          <thead><tr><th>ID</th><th>Type</th><th>Destination</th><th>Vehicle</th><th>Driver</th><th>Cost</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td className="cell-bold"><Truck size={14} style={{ marginRight: '4px' }} />{d.id}</td>
                <td><span className={`badge ${d.type === 'Incoming' ? 'badge-info' : 'badge-success'}`}>{d.type}</span></td>
                <td><MapPin size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{d.destination}</td>
                <td>{d.vehicle}</td>
                <td>{d.driver}</td>
                <td className="numeric">${d.cost.toFixed(2)}</td>
                <td>{statusBadge(d.status)}</td>
                <td>{d.date}</td>
                <td className="cell-actions"><button className="icon-btn" aria-label="View"><Eye size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logistics;
