import React from 'react';
import { BarChart2, PieChart, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';

const Analytics = () => {
  const { data: sales, loading: salesLoading } = useCollection('sales');
  const { data: expenses, loading: expensesLoading } = useCollection('expenses');
  const { data: income, loading: incomeLoading } = useCollection('income');
  const { data: products, loading: productsLoading } = useCollection('products');

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const netProfit = (totalSales + totalIncome) - totalExpenses;
  const inventoryValue = products.reduce((sum, p) => sum + (p.buyPrice * p.qty), 0);
  
  const loading = salesLoading || expensesLoading || incomeLoading || productsLoading;

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Analytics</h1><p className="page-subtitle">Business intelligence and performance metrics</p></div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}><div className="loading-spinner-large" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <>
          <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
            <div className="glass-card-light stat-card">
              <div className="stat-icon" style={{ color: 'var(--color-success)', background: 'rgba(63, 191, 127, 0.1)' }}><TrendingUp size={24} /></div>
              <div className="stat-content"><p className="stat-label">Total Revenue (Sales + Income)</p><h3 className="stat-value">${(totalSales + totalIncome).toFixed(2)}</h3></div>
            </div>
            
            <div className="glass-card-light stat-card">
              <div className="stat-icon" style={{ color: 'var(--color-danger)', background: 'rgba(225, 91, 91, 0.1)' }}><TrendingDown size={24} /></div>
              <div className="stat-content"><p className="stat-label">Total Expenses</p><h3 className="stat-value">${totalExpenses.toFixed(2)}</h3></div>
            </div>
            
            <div className="glass-card-light stat-card">
              <div className="stat-icon" style={{ color: 'var(--color-accent-lime)', background: 'var(--color-primary-dark)' }}><DollarSign size={24} /></div>
              <div className="stat-content"><p className="stat-label">Net Profit</p><h3 className="stat-value" style={{ color: netProfit >= 0 ? 'inherit' : 'var(--color-danger)'}}>${netProfit.toFixed(2)}</h3></div>
            </div>

            <div className="glass-card-light stat-card">
              <div className="stat-icon"><Package size={24} /></div>
              <div className="stat-content"><p className="stat-label">Capital in Inventory</p><h3 className="stat-value">${inventoryValue.toFixed(2)}</h3></div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="glass-card-light" style={{ padding: '24px', minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BarChart2 size={20} /> <h3>Revenue vs Expenses</h3>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                {/* CSS-based mock chart bars scaled to percentages of max */}
                {(() => {
                  const max = Math.max(totalSales + totalIncome, totalExpenses, 1);
                  const revHeight = Math.max(((totalSales + totalIncome) / max) * 100, 5);
                  const expHeight = Math.max((totalExpenses / max) * 100, 5);
                  return (
                    <>
                      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: `${revHeight}%`, background: 'var(--color-success)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
                        <span style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>Revenue</span>
                      </div>
                      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: `${expHeight}%`, background: 'var(--color-danger)', borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }}></div>
                        <span style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>Expenses</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="glass-card-light" style={{ padding: '24px', minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <PieChart size={20} /> <h3>Sales by Status</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const paid = sales.filter(s => s.status === 'Paid').length;
                  const partially = sales.filter(s => s.status === 'Partially Paid').length;
                  const pending = sales.filter(s => s.status === 'Pending').length;
                  const total = sales.length || 1;
                  return (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Paid</span><span>{paid}</span></div>
                        <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(paid/total)*100}%`, background: 'var(--color-success)' }}></div></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Partially Paid</span><span>{partially}</span></div>
                        <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(partially/total)*100}%`, background: 'var(--color-warning)' }}></div></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Pending</span><span>{pending}</span></div>
                        <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(pending/total)*100}%`, background: 'var(--color-danger)' }}></div></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
