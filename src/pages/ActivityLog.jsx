import React, { useState } from 'react';
import { Clock, Search, Filter } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: logs, loading } = useCollection('activityLogs', 'timestamp', 'desc');

  const filtered = logs.filter(l => 
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.collection.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Activity Log</h1><p className="page-subtitle">Audit trail of all system actions</p></div>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder="Search logs…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <button className="btn btn-secondary"><Filter size={18} /> Filter</button>
      </div>

      <div className="glass-card-light table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module/Collection</th><th>Record ID</th></tr></thead>
            <tbody>
              {filtered.map(log => {
                const dateObj = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
                return (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--color-text-secondary)' }}/> 
                        {dateObj.toLocaleString()}
                      </div>
                    </td>
                    <td className="cell-bold">{log.user}</td>
                    <td>{log.action}</td>
                    <td><span className="badge badge-info">{log.collection}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {log.recordId}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No activity logs found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
