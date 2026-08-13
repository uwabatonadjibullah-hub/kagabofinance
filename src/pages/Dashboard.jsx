import React, { useMemo } from 'react';
import { Package, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCollection } from '../hooks/useFirestore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

const Dashboard = () => {
  const { userProfile } = useAuth();
  
  // Real-time data feeds — each fires onSnapshot so all KPIs and charts
  // update the moment Firestore data changes.
  const { data: products, loading: productsLoading } = useCollection('products');
  const { data: sales,    loading: salesLoading    } = useCollection('sales');
  const { data: purchases,loading: purchasesLoading} = useCollection('purchases');
  const { data: activities } = useCollection('activityLogs', 'timestamp', 'desc');

  const isLoading = productsLoading || salesLoading || purchasesLoading;

  // ── KPI Calculations ───────────────────────────────────────────────────────
  const inventoryValue = products.reduce((sum, p) => {
    const totalItems = p.totalItems ?? (p.qty * (p.ipq || 1));
    return sum + (totalItems * ((p.buyPrice || 0) / (p.ipq || 1)));
  }, 0);

  const totalProducts = products.length;

  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = sales
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const salesOutstanding = sales.reduce((sum, s) => {
    const bal = s.balance ?? (s.status === 'Paid' ? 0 : ((s.total || 0) - (s.paid || 0)));
    return sum + Math.max(0, bal);
  }, 0);
  const purchaseOutstanding = purchases.reduce((sum, p) => {
    const bal = p.balance ?? (p.status === 'Paid' ? 0 : ((p.total || 0) - (p.paid || 0)));
    return sum + Math.max(0, bal);
  }, 0);
  const totalOutstanding = salesOutstanding + purchaseOutstanding;

  // ── Chart Data — Last 7 Days ───────────────────────────────────────────────
  const chartData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySales     = sales    .filter(s => s.date === dateStr).reduce((sum, s) => sum + (s.total || 0), 0);
    const dayPurchases = purchases.filter(p => p.date === dateStr).reduce((sum, p) => sum + (p.total || 0), 0);
    const displayDate  = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { name: displayDate, sales: daySales, purchases: dayPurchases };
  }), [sales, purchases]);

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
          <Link to="/sales"     className="btn btn-primary"  ><PlusIcon /> Record Sale</Link>
          <Link to="/purchases" className="btn btn-secondary"><PlusIcon /> Record Purchase</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <StatCard
          icon={<DollarSign size={24} />}
          label="Today's Revenue"
          value={`RWF ${todayRevenue.toFixed(2)}`}
          loading={isLoading}
        />
        <StatCard
          icon={<Package size={24} />}
          label="Inventory Value"
          value={`RWF ${inventoryValue.toFixed(2)}`}
          loading={isLoading}
          iconColor="var(--color-primary-dark)"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Outstanding Debts"
          value={`RWF ${totalOutstanding.toFixed(2)}`}
          loading={isLoading}
          iconColor="var(--color-warning)"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Products"
          value={String(totalProducts)}
          loading={isLoading}
          iconColor="var(--color-success)"
        />

        {/* ── Charts Row ─────────────────────────────────────────────────── */}
        <div className="glass-card-light" style={{ gridColumn: '1 / -1', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

          {/* Revenue Curve */}
          <div style={{ flex: '1 1 500px', minWidth: 0 }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--color-success)" /> Revenue Curve (Last 7 Days)
            </h3>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-success)" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `RWF ${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface-light)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-md)' }}
                      itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="sales" name="Revenue" stroke="var(--color-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" isAnimationActive />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Cash Flow Bar */}
          <div style={{ flex: '1 1 500px', minWidth: 0 }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--color-info)" /> Cash Flow Comparison
            </h3>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `RWF ${v}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ backgroundColor: 'var(--color-surface-light)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-md)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    <Bar dataKey="sales"     name="Sales In"       fill="var(--color-success)" radius={[4,4,0,0]} barSize={16} isAnimationActive />
                    <Bar dataKey="purchases" name="Purchases Out"  fill="var(--color-danger)"  radius={[4,4,0,0]} barSize={16} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Activity Feed ─────────────────────────────────────────── */}
        <div className="glass-card-light" style={{ gridColumn: '1 / -1', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} /> Live Activity Feed
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontWeight: 600, padding: '3px 9px',
                background: 'rgba(63,191,127,0.15)', color: 'var(--color-success)',
                borderRadius: '20px', marginLeft: '4px'
              }}>
                <span className="live-dot" />
                LIVE
              </span>
            </h3>
            <Link to="/activity-log" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((log) => {
              const dateObj    = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
              const displayUser = (log.user || 'System').trim() || 'System';
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}>
                    {displayUser.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px' }}><strong>{displayUser}</strong> {(log.action || '').toLowerCase()}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{dateObj.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {recentActivities.length === 0 && (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, loading, iconColor }) => (
  <div className="glass-card-light stat-card">
    <div className="stat-icon" style={iconColor ? { color: iconColor } : {}}>{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      {loading ? (
        <div style={{ height: '28px', width: '120px', borderRadius: '6px', background: 'var(--color-border-subtle)', animation: 'shimmer 1.4s linear infinite', backgroundSize: '200% 100%' }} />
      ) : (
        <h3 className="stat-value">{value}</h3>
      )}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0' }}>
    {[60, 85, 45, 70, 55, 90, 65].map((h, i) => (
      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '6px 6px 0 0', background: 'var(--color-border-subtle)', animation: `shimmer 1.4s ${i * 0.1}s linear infinite`, backgroundSize: '200% 100%' }} />
    ))}
  </div>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default Dashboard;
