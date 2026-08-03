import React, { useState } from 'react';
import { TrendingUp, Package, Users, DollarSign, BarChart3, ShoppingCart } from 'lucide-react';

const Analytics = () => {
  const [period, setPeriod] = useState('month');

  const metrics = [
    { label: 'Best Selling Product', value: 'Wireless Mouse', sub: '200 units sold', icon: ShoppingCart },
    { label: 'Slowest Moving', value: 'Power Bank 20K', sub: '5 units sold', icon: Package },
    { label: 'Stock Turnover', value: '4.2x', sub: 'Monthly average', icon: TrendingUp },
    { label: 'Revenue Growth', value: '+18.5%', sub: 'YoY growth', icon: DollarSign },
    { label: 'Top Customer', value: 'QuickMart', sub: '$28,400 lifetime', icon: Users },
    { label: 'Expense Ratio', value: '38.2%', sub: 'Of total revenue', icon: BarChart3 },
  ];

  return (
    <div className="module-page">
      <div className="page-header">
        <div><h1>Analytics</h1><p className="page-subtitle">Visual insights into business performance</p></div>
        <div className="period-toggle">
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card-light analytics-metric-card" id={`metric-${i}`}>
            <div className="stat-card-icon-badge"><m.icon size={22} /></div>
            <div className="analytics-metric-label">{m.label}</div>
            <div className="analytics-metric-value">{m.value}</div>
            <div className="analytics-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="dashboard-charts-row" style={{ marginTop: '32px' }}>
        <div className="glass-card-light chart-card">
          <h3 className="section-title">Revenue Growth</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-group">
              {[50, 60, 55, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar revenue" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card-light chart-card">
          <h3 className="section-title">Expense Trends</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-group">
              {[30, 35, 40, 32, 45, 38, 42, 36, 48, 40, 44, 38].map((h, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar expense" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
