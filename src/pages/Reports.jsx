import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

const reportTypes = [
  { key: 'daily', label: 'Daily Financial Report', description: 'Revenue, expenses, and profit for today' },
  { key: 'weekly', label: 'Weekly Financial Report', description: 'Aggregated weekly financial summary' },
  { key: 'monthly', label: 'Monthly Financial Report', description: 'Full monthly P&L statement' },
  { key: 'annual', label: 'Annual Financial Report', description: 'Year-to-date financial overview' },
  { key: 'sales', label: 'Sales Report', description: 'All sales transactions for the period' },
  { key: 'purchases', label: 'Purchase Report', description: 'All purchases from suppliers' },
  { key: 'inventory', label: 'Inventory Report', description: 'Current stock levels and valuations' },
  { key: 'expense', label: 'Expense Report', description: 'Categorized business expenses' },
  { key: 'customer', label: 'Customer Report', description: 'Customer balances and purchase history' },
  { key: 'supplier', label: 'Supplier Report', description: 'Supplier balances and purchase orders' },
  { key: 'pnl', label: 'Profit & Loss Report', description: 'Comprehensive P&L analysis' },
];

const Reports = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Reports</h1><p className="page-subtitle">Generate and export professional business reports</p></div>
      </div>

      <div className="reports-grid">
        {reportTypes.map(r => (
          <div
            key={r.key}
            className={`glass-card-light report-card ${selected === r.key ? 'selected' : ''}`}
            onClick={() => setSelected(r.key)}
            id={`report-${r.key}`}
          >
            <div className="report-card-icon"><FileText size={24} /></div>
            <h4>{r.label}</h4>
            <p className="page-subtitle">{r.description}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="glass-card-light" style={{ padding: '32px', marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Generate: {reportTypes.find(r => r.key === selected)?.label}</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label><Calendar size={14} style={{ marginRight: '4px' }} />Date Range</label>
              <select><option>Today</option><option>This Week</option><option>This Month</option><option>This Quarter</option><option>This Year</option><option>Custom Range</option></select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary"><Download size={16} /> PDF</button>
              <button className="btn btn-secondary"><Download size={16} /> Excel</button>
              <button className="btn btn-primary"><FileText size={16} /> Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
