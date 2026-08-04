import React from 'react';
import { BarChart2, PieChart, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart as RPieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3FBF7F', '#E15B5B', '#F2B84C', '#4C9FE1', '#C6F24C', '#9B59B6', '#E67E22'];

const Analytics = () => {
  const { data: sales, loading: salesLoading } = useCollection('sales');
  const { data: expenses, loading: expensesLoading } = useCollection('expenses');
  const { data: income, loading: incomeLoading } = useCollection('income');
  const { data: products, loading: productsLoading } = useCollection('products');
  const { data: purchases } = useCollection('purchases');

  const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalFinanceIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalRevenue = totalSalesRevenue + totalFinanceIncome;
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalPurchaseCost = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalPurchaseCost;
  const inventoryValue = products.reduce((sum, p) => {
    const totalItems = p.totalItems ?? (p.qty * (p.ipq || 1));
    return sum + (totalItems * (p.buyPrice / (p.ipq || 1)));
  }, 0);
  
  const loading = salesLoading || expensesLoading || incomeLoading || productsLoading;

  // Last 14 days data for area chart
  const last14Days = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const trendData = last14Days.map(date => {
    const dayRevenue = sales.filter(s => s.date === date).reduce((sum, s) => sum + (s.total || 0), 0)
      + income.filter(i => i.date === date).reduce((sum, i) => sum + (i.amount || 0), 0);
    const dayExpenses = expenses.filter(e => e.date === date).reduce((sum, e) => sum + (e.amount || 0), 0)
      + purchases.filter(p => p.date === date).reduce((sum, p) => sum + (p.total || 0), 0);
    const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { name: displayDate, revenue: dayRevenue, expenses: dayExpenses };
  });

  // Expense breakdown by category
  const expenseCategories = {};
  expenses.forEach(e => {
    const cat = e.category || 'Uncategorized';
    expenseCategories[cat] = (expenseCategories[cat] || 0) + (e.amount || 0);
  });
  const expensePieData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

  // Income breakdown
  const incomeCategories = {};
  income.forEach(i => {
    const cat = i.category || 'Other';
    incomeCategories[cat] = (incomeCategories[cat] || 0) + (i.amount || 0);
  });
  // Add sales as a category
  if (totalSalesRevenue > 0) incomeCategories['Product Sales'] = totalSalesRevenue;
  const incomePieData = Object.entries(incomeCategories).map(([name, value]) => ({ name, value }));

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Analytics</h1><p className="page-subtitle">Business intelligence — Sales, Finance income, expenses, and inventory metrics</p></div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}><div className="loading-spinner-large" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
            <div className="glass-card-light stat-card">
              <div className="stat-icon" style={{ color: 'var(--color-success)', background: 'rgba(63, 191, 127, 0.1)' }}><TrendingUp size={24} /></div>
              <div className="stat-content"><p className="stat-label">Total Revenue (Sales + Finance)</p><h3 className="stat-value">${totalRevenue.toFixed(2)}</h3></div>
            </div>
            <div className="glass-card-light stat-card">
              <div className="stat-icon" style={{ color: 'var(--color-danger)', background: 'rgba(225, 91, 91, 0.1)' }}><TrendingDown size={24} /></div>
              <div className="stat-content"><p className="stat-label">Total Outflow (Expenses + Purchases)</p><h3 className="stat-value">${(totalExpenses + totalPurchaseCost).toFixed(2)}</h3></div>
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

          {/* Revenue vs Expenses Trend */}
          <div className="glass-card-light" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} /> Revenue vs Outflow — Last 14 Days
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: 'var(--color-text-secondary)'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11, fill: 'var(--color-text-secondary)'}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E4E7E3', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-success)" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Outflow" stroke="var(--color-danger)" strokeWidth={2.5} fillOpacity={1} fill="url(#gradExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Charts Row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Expense Breakdown */}
            <div className="glass-card-light" style={{ flex: '1 1 400px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} /> Expense Breakdown by Category
              </h3>
              {expensePieData.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '40px' }}>No expense data yet.</p>
              ) : (
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {expensePieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Revenue Sources */}
            <div className="glass-card-light" style={{ flex: '1 1 400px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} /> Revenue Sources
              </h3>
              {incomePieData.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '40px' }}>No revenue data yet.</p>
              ) : (
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie data={incomePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {incomePieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Sales by Status */}
          <div className="glass-card-light" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Sales by Payment Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const paid = sales.filter(s => s.status === 'Paid').length;
                const partially = sales.filter(s => s.status === 'Partially Paid').length;
                const pending = sales.filter(s => s.status === 'Pending').length;
                const total = sales.length || 1;
                return (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Paid</span><span>{paid} ({((paid/total)*100).toFixed(0)}%)</span></div>
                      <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(paid/total)*100}%`, background: 'var(--color-success)', transition: 'width 1s ease' }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Partially Paid</span><span>{partially} ({((partially/total)*100).toFixed(0)}%)</span></div>
                      <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(partially/total)*100}%`, background: 'var(--color-warning)', transition: 'width 1s ease' }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}><span>Pending</span><span>{pending} ({((pending/total)*100).toFixed(0)}%)</span></div>
                      <div style={{ height: '8px', background: 'var(--color-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(pending/total)*100}%`, background: 'var(--color-danger)', transition: 'width 1s ease' }}></div></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
