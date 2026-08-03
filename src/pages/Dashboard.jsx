import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Package, Users, DollarSign, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="glass-card-light stat-card" id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="stat-card-top">
      <span className="stat-card-label">{title}</span>
      <div className="stat-card-icon-badge">
        <Icon size={20} />
      </div>
    </div>
    <div className="stat-card-value">{value}</div>
    <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      <span className="stat-change-amount">{change}</span>
      <span className="stat-change-label">vs last month</span>
    </div>
  </div>
);

const QuickAction = ({ label, icon: Icon, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    <div className="quick-action-icon"><Icon size={20} /></div>
    <span>{label}</span>
  </button>
);

const Dashboard = () => {
  const [period, setPeriod] = useState('month');

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Here's what's happening with your business today.</p>
        </div>
        <div className="period-toggle">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <section className="stats-grid">
        <StatCard title="Total Revenue" value="$124,500" change="+12.5%" isPositive icon={DollarSign} />
        <StatCard title="Inventory Value" value="$45,200" change="+3.2%" isPositive icon={Package} />
        <StatCard title="Active Customers" value="1,204" change="+8.1%" isPositive icon={Users} />
        <StatCard title="Net Profit" value="$32,800" change="+15.3%" isPositive icon={TrendingUp} />
        <StatCard title="Today's Sales" value="$3,420" change="+5.7%" isPositive icon={ShoppingCart} />
        <StatCard title="Pending Payments" value="$12,400" change="-2.4%" isPositive={false} icon={AlertTriangle} />
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <QuickAction label="Record Sale" icon={ShoppingCart} />
          <QuickAction label="Add Product" icon={Package} />
          <QuickAction label="Add Expense" icon={DollarSign} />
          <QuickAction label="View Reports" icon={TrendingUp} />
        </div>
      </section>

      {/* Charts placeholder area */}
      <div className="dashboard-charts-row">
        <div className="glass-card-light chart-card">
          <h3 className="section-title">Revenue vs Expenses</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-group">
              {[65, 45, 80, 55, 72, 90, 60, 85, 70, 50, 75, 95].map((h, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar revenue" style={{ height: `${h}%` }} />
                  <div className="chart-bar expense" style={{ height: `${h * 0.6}%` }} />
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot revenue" />Revenue</span>
              <span className="legend-item"><span className="legend-dot expense" />Expenses</span>
            </div>
          </div>
        </div>

        <div className="glass-card-light chart-card">
          <h3 className="section-title">Monthly Profit Trend</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-group">
              {[40, 55, 35, 70, 60, 85, 45, 90, 65, 75, 80, 95].map((h, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div className="chart-bar profit" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="dashboard-section">
        <div className="glass-card-light" style={{ padding: '24px' }}>
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {[
              { action: 'Sale recorded', detail: 'Invoice #INV-0042 — $1,250.00', time: '5 min ago', type: 'success' },
              { action: 'Stock In', detail: '50x Widget Pro added to inventory', time: '22 min ago', type: 'info' },
              { action: 'Payment received', detail: 'Customer: Acme Corp — $3,200.00', time: '1 hour ago', type: 'success' },
              { action: 'Low stock alert', detail: 'Cable Kit — 3 units remaining', time: '2 hours ago', type: 'warning' },
              { action: 'Expense recorded', detail: 'Transport — $450.00', time: '3 hours ago', type: 'danger' },
            ].map((item, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${item.type}`} />
                <div className="activity-content">
                  <span className="activity-action">{item.action}</span>
                  <span className="activity-detail">{item.detail}</span>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
