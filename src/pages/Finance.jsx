import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Search, Plus } from 'lucide-react';
import { useCollection, useFirestore } from '../hooks/useFirestore';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: incomeData, loading: incomeLoading } = useCollection('income');
  const { data: expenseData, loading: expenseLoading } = useCollection('expenses');
  
  const { addDocument: addIncome } = useFirestore('income');
  const { addDocument: addExpense } = useFirestore('expenses');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (activeTab === 'income') {
      await addIncome({
        category: formData.category || 'Sales',
        description: formData.description,
        amount,
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      await addExpense({
        category: formData.category || 'Maintenance',
        description: formData.description,
        amount,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowForm(false);
    setFormData({ description: '', amount: '', category: '' });
  };

  const filteredIncome = incomeData.filter(i => i.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExpenses = expenseData.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Finance</h1><p className="page-subtitle">Track income, expenses, and overall profit</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : `Record ${activeTab === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-success)', background: 'rgba(63, 191, 127, 0.1)' }}><ArrowUpRight size={24} /></div>
          <div className="stat-content"><p className="stat-label">Total Income</p><h3 className="stat-value">RWF {totalIncome.toFixed(2)}</h3></div>
        </div>
        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-danger)', background: 'rgba(225, 91, 91, 0.1)' }}><ArrowDownRight size={24} /></div>
          <div className="stat-content"><p className="stat-label">Total Expenses</p><h3 className="stat-value">RWF {totalExpenses.toFixed(2)}</h3></div>
        </div>
        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-accent-lime)', background: 'var(--color-primary-dark)' }}><DollarSign size={24} /></div>
          <div className="stat-content"><p className="stat-label">Net Profit</p><h3 className="stat-value" style={{ color: netProfit >= 0 ? 'inherit' : 'var(--color-danger)'}}>RWF {netProfit.toFixed(2)}</h3></div>
        </div>
      </div>

      {showForm && (
        <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group"><label>Category</label><input required placeholder={activeTab === 'income' ? 'e.g., Service, Sales' : 'e.g., Rent, Salaries'} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="form-group"><label>Description</label><input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            <div className="form-group"><label>Amount</label><input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
            <div style={{ width: '100%', marginTop: '8px' }}><button type="submit" className="btn btn-primary">Save {activeTab === 'income' ? 'Income' : 'Expense'}</button></div>
          </form>
        </div>
      )}

      <div className="finance-tabs">
        <button className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>Income</button>
        <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses</button>
      </div>

      <div className="module-toolbar">
        <div className="toolbar-search"><Search size={18} /><input type="text" placeholder={`Search ${activeTab}…`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="glass-card-light table-container">
        {activeTab === 'income' && incomeLoading || activeTab === 'expenses' && expenseLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="loading-spinner-small" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {(activeTab === 'income' ? filteredIncome : filteredExpenses).map(item => (
                <tr key={item.id}>
                  <td className="cell-bold">{item.id.substring(0, 8).toUpperCase()}</td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td className={`numeric ${activeTab === 'income' ? 'text-success' : 'text-danger'}`}>
                    {activeTab === 'income' ? '+' : '-'}RWF {item.amount.toFixed(2)}
                  </td>
                  <td>{item.date}</td>
                </tr>
              ))}
              {(activeTab === 'income' ? filteredIncome : filteredExpenses).length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Finance;
