import React from 'react';
import { ArrowUpRight, ArrowDownRight, Package, Users, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon }) => (
  <div className="glass-card-light" style={{ padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{title}</div>
      <div style={{ padding: '8px', backgroundColor: 'var(--color-accent-lime-soft)', borderRadius: '12px', color: 'var(--color-primary-dark)' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
      {value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
      {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      <span style={{ fontWeight: 600 }}>{change}</span>
      <span style={{ color: 'var(--color-text-secondary)' }}>vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Overview</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary">Download Report</button>
          <button className="btn btn-primary">+ Record Sale</button>
        </div>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          title="Total Revenue" 
          value="$124,500" 
          change="+12.5%" 
          isPositive={true}
          icon={<DollarSign size={24} />}
        />
        <StatCard 
          title="Inventory Value" 
          value="$45,200" 
          change="+3.2%" 
          isPositive={true}
          icon={<Package size={24} />}
        />
        <StatCard 
          title="Active Customers" 
          value="1,204" 
          change="+8.1%" 
          isPositive={true}
          icon={<Users size={24} />}
        />
        <StatCard 
          title="Pending Payments" 
          value="$12,400" 
          change="-2.4%" 
          isPositive={false}
          icon={<DollarSign size={24} />}
        />
      </div>

      {/* Recent Activity placeholder */}
      <div className="glass-card-light" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>Live data from Firestore will appear here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
