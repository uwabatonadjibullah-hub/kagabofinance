import React from 'react';
import { Package, DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from '../hooks/useFirestore';

const Dashboard = () => {
  const { userProfile } = useAuth();
  
  // Real-time data feeds
  const { data: products } = useCollection('products');
  const { data: sales } = useCollection('sales');
  const { data: purchases } = useCollection('purchases');
  const { data: customers } = useCollection('customers');
  const { data: activities } = useCollection('activityLogs', 'timestamp', 'desc');

  // Calculations
  const inventoryValue = products.reduce((sum, p) => sum + (p.buyPrice * p.qty), 0);
  const totalProducts = products.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date === today);
  const todayRevenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
  
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  
  // Latest 5 activities
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="module-page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {userProfile?.displayName || 'User'}!</h1>
          <p className="page-subtitle">Here's what's happening in your business today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/sales" className="btn btn-primary"><PlusIcon /> Record Sale</Link>
          <Link to="/purchases" className="btn btn-secondary"><PlusIcon /> Record Purchase</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Stat Cards */}
        <div className="glass-card-light stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Today's Revenue</p>
            <h3 className="stat-value">${todayRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-primary-dark)' }}><Package size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Inventory Value</p>
            <h3 className="stat-value">${inventoryValue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-warning)' }}><Users size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Outstanding Debts</p>
            <h3 className="stat-value">${totalOutstanding.toFixed(2)}</h3>
          </div>
        </div>

        <div className="glass-card-light stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-success)' }}><TrendingUp size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Products</p>
            <h3 className="stat-value">{totalProducts}</h3>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="glass-card-light" style={{ gridColumn: '1 / -1', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} /> Live Activity Feed</h3>
            <Link to="/activity-log" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((log) => {
              const dateObj = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}>{log.user.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px' }}><strong>{log.user}</strong> {log.action.toLowerCase()}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{dateObj.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default Dashboard;
