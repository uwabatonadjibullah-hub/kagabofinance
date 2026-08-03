import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const sampleExpenses = [
  { id: 1, category: 'Transport', description: 'Delivery truck fuel', amount: 450.00, date: '2026-08-03' },
  { id: 2, category: 'Salary', description: 'Staff payroll — July', amount: 8500.00, date: '2026-08-01' },
  { id: 3, category: 'Rent', description: 'Warehouse rent — August', amount: 2200.00, date: '2026-08-01' },
  { id: 4, category: 'Internet', description: 'Monthly ISP bill', amount: 120.00, date: '2026-07-28' },
  { id: 5, category: 'Marketing', description: 'Social media ads', amount: 350.00, date: '2026-07-25' },
];

const sampleIncome = [
  { id: 1, category: 'Sales', description: 'Product sales — Week 31', amount: 12400.00, date: '2026-08-03' },
  { id: 2, category: 'Service Income', description: 'Consulting fee', amount: 1500.00, date: '2026-08-01' },
  { id: 3, category: 'Other Income', description: 'Equipment rental', amount: 800.00, date: '2026-07-30' },
];

const Finance = () => {
  const [tab, setTab] = useState('overview');

  const totalIncome = sampleIncome.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = sampleExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Finance</h1><p className="page-subtitle">Monitor income, expenses, and profitability</p></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" id="add-income-btn"><Plus size={18} /> Add Income</button>
          <button className="btn btn-primary" id="add-expense-btn"><Plus size={18} /> Add Expense</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-card-light stat-card">
          <div className="stat-card-top"><span className="stat-card-label">Gross Revenue</span><div className="stat-card-icon-badge"><TrendingUp size={20} /></div></div>
          <div className="stat-card-value">${totalIncome.toLocaleString()}</div>
          <div className="stat-card-change positive"><ArrowUpRight size={14} /><span className="stat-change-amount">+12.5%</span></div>
        </div>
        <div className="glass-card-light stat-card">
          <div className="stat-card-top"><span className="stat-card-label">Total Expenses</span><div className="stat-card-icon-badge" style={{ backgroundColor: 'rgba(225,91,91,0.12)' }}><TrendingDown size={20} /></div></div>
          <div className="stat-card-value">${totalExpenses.toLocaleString()}</div>
          <div className="stat-card-change negative"><ArrowDownRight size={14} /><span className="stat-change-amount">-3.1%</span></div>
        </div>
        <div className="glass-card-light stat-card">
          <div className="stat-card-top"><span className="stat-card-label">Net Profit</span><div className="stat-card-icon-badge"><DollarSign size={20} /></div></div>
          <div className="stat-card-value" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>${netProfit.toLocaleString()}</div>
          <div className="stat-card-change positive"><span className="stat-change-label">Margin: {profitMargin}%</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="module-tabs">
        {['overview', 'income', 'expenses'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <div className="glass-card-light table-container">
          <table className="data-table" id="expenses-table">
            <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {sampleExpenses.map(e => (
                <tr key={e.id}><td><span className="badge badge-danger">{e.category}</span></td><td>{e.description}</td><td className="numeric">${e.amount.toFixed(2)}</td><td>{e.date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'income' && (
        <div className="glass-card-light table-container">
          <table className="data-table" id="income-table">
            <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {sampleIncome.map(i => (
                <tr key={i.id}><td><span className="badge badge-success">{i.category}</span></td><td>{i.description}</td><td className="numeric">${i.amount.toFixed(2)}</td><td>{i.date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'overview' && (
        <div className="glass-card-light" style={{ padding: '32px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>Financial Overview</h3>
          <p className="page-subtitle">Revenue, expense, and profit data will be visualized here with interactive charts from your Firestore data.</p>
        </div>
      )}
    </div>
  );
};

export default Finance;
