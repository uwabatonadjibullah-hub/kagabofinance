import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Users,
  Building2,
  Truck,
  BarChart3,
  TrendingUp,
  ClipboardList,
  Settings,
  LogOut,
  Search,
  Shield,
  FileText,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/purchases', icon: ShoppingBag, label: 'Purchases' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/suppliers', icon: Building2, label: 'Suppliers' },
  { to: '/logistics', icon: Truck, label: 'Logistics' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/activity-log', icon: ClipboardList, label: 'Activity Log' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const DashboardLayout = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-brand">
          <img src="/iconed_logo.jpg" alt="KAGABO Finance & Logistics" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-logout-btn"
            id="nav-signout"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>

          <div className="sidebar-legal">
            <NavLink to="/privacy-policy" className="sidebar-legal-link">
              <Shield size={14} /> Privacy Policy
            </NavLink>
            <NavLink to="/terms-conditions" className="sidebar-legal-link">
              <FileText size={14} /> Terms & Conditions
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header" id="main-header">
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products, customers, invoices…"
              className="header-search-input"
              id="global-search"
            />
          </div>

          <div className="header-right">
            <NotificationDropdown />
            <div className="header-user">
              <div className="header-avatar" id="user-avatar">{initials}</div>
              <div className="header-user-info">
                <span className="header-user-name">{displayName}</span>
                <span className="header-user-role">{userProfile?.role || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
