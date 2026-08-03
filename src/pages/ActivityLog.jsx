import React, { useState } from 'react';
import { Search, Filter, User, Clock } from 'lucide-react';

const sampleLogs = [
  { id: 1, user: 'Kagabo (Owner)', action: 'Sale Recorded', detail: 'Invoice #INV-0042 for Acme Corp', timestamp: '2026-08-03 16:30' },
  { id: 2, user: 'Kagabo (Owner)', action: 'Stock In', detail: '50x Widget Pro from TechCo', timestamp: '2026-08-03 15:10' },
  { id: 3, user: 'Marie (Accountant)', action: 'Payment Received', detail: '$3,200 from Acme Corp', timestamp: '2026-08-03 14:45' },
  { id: 4, user: 'Patrick (Manager)', action: 'Product Updated', detail: 'Cable Kit — price adjusted', timestamp: '2026-08-03 13:20' },
  { id: 5, user: 'Kagabo (Owner)', action: 'Expense Added', detail: 'Transport — $450.00', timestamp: '2026-08-03 11:05' },
  { id: 6, user: 'Marie (Accountant)', action: 'Invoice Generated', detail: 'Invoice #INV-0041 for Smith Trading', timestamp: '2026-08-02 17:30' },
  { id: 7, user: 'System', action: 'Low Stock Alert', detail: 'Cable Kit — 3 units remaining', timestamp: '2026-08-02 14:00' },
  { id: 8, user: 'Kagabo (Owner)', action: 'User Approved', detail: 'Marie granted Accountant role', timestamp: '2026-08-01 09:00' },
];

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = sampleLogs.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.detail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Activity Log</h1><p className="page-subtitle">Complete audit trail of system actions</p></div>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search activity…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} id="activity-search" /></div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
      </div>

      <div className="glass-card-light table-container">
        <table className="data-table" id="activity-table">
          <thead><tr><th>User</th><th>Action</th><th>Detail</th><th>Timestamp</th></tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td><User size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{l.user}</td>
                <td className="cell-bold">{l.action}</td>
                <td>{l.detail}</td>
                <td><Clock size={14} style={{ marginRight: '4px', opacity: 0.6 }} />{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLog;
