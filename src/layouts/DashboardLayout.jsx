import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const DashboardLayout = () => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--color-accent-lime)' }}>KAGABO</h2>
          <div style={{ fontSize: '12px', opacity: 0.8, letterSpacing: '1px' }}>FINANCE LOGISTICS</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" className="sidebar-link active">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/inventory" className="sidebar-link">
            <Package size={20} /> Inventory
          </Link>
          <Link to="#" className="sidebar-link">
            <ShoppingCart size={20} /> Sales
          </Link>
          <Link to="#" className="sidebar-link">
            <Truck size={20} /> Logistics
          </Link>
          <Link to="#" className="sidebar-link">
            <Users size={20} /> Contacts
          </Link>
          <Link to="#" className="sidebar-link">
            <BarChart3 size={20} /> Reports
          </Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <Link to="#" className="sidebar-link">
              <Settings size={20} /> Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div>
            <h3>Welcome back, Kagabo</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Here's what's happening with your business today.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="badge badge-success">System Online</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-dark-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              K
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .sidebar-link.active {
          background-color: var(--color-accent-lime);
          color: var(--color-primary-dark);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
