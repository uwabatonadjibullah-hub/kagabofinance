import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import HelpDropdown from '../components/HelpDropdown';
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
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',  icon: Package,         label: 'Inventory'    },
  { to: '/sales',      icon: ShoppingCart,    label: 'Sales'        },
  { to: '/purchases',  icon: ShoppingBag,     label: 'Purchases'    },
  { to: '/finance',    icon: DollarSign,      label: 'Finance'      },
  { to: '/customers',  icon: Users,           label: 'Customers'    },
  { to: '/suppliers',  icon: Building2,       label: 'Suppliers'    },
  { to: '/logistics',  icon: Truck,           label: 'Logistics'    },
  { to: '/reports',    icon: BarChart3,       label: 'Reports'      },
  { to: '/analytics',  icon: TrendingUp,      label: 'Analytics'    },
  { to: '/activity-log', icon: ClipboardList, label: 'Activity Log' },
  { to: '/settings',   icon: Settings,        label: 'Settings'     },
];

/* ── Constants ────────────────────────────────────────────────────────────── */
const SIDEBAR_DEFAULT   = 260;   // px — default expanded width
const SIDEBAR_MIN       = 60;    // px — fully icon-only (collapsed floor)
const SIDEBAR_MAX       = 400;   // px — maximum drag width
const ICON_THRESHOLD    = 140;   // px — below this show icons only
const COLLAPSED_WIDTH   = 60;    // px — width when collapsed via toggle button
const LS_KEY            = 'kagabo_sidebar_width'; // localStorage key

const DashboardLayout = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ── Sidebar resize state ───────────────────────────────────────────────── */
  // Initialise from localStorage so width persists across page refreshes
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const w = parseInt(saved, 10);
        if (w >= SIDEBAR_MIN && w <= SIDEBAR_MAX) return w;
      }
    } catch (_) { /* ignore */ }
    return SIDEBAR_DEFAULT;
  });

  // "Collapsed" means the user clicked the toggle — we remember the previous
  // width so we can restore it when they expand again.
  const [isCollapsed, setIsCollapsed]         = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false); // disables CSS transition during drag
  const prevWidthRef                          = useRef(sidebarWidth);
  const isDragging                            = useRef(false);
  const dragStartX                            = useRef(0);
  const dragStartWidth                        = useRef(0);
  const sidebarRef                            = useRef(null);

  // Derived: are we in icon-only mode?
  const iconOnly = isCollapsed || sidebarWidth < ICON_THRESHOLD;

  // Persist width changes
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, String(sidebarWidth)); } catch (_) {}
  }, [sidebarWidth]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  /* ── Drag-resize handlers ─────────────────────────────────────────────── */
  const handleMouseDown = useCallback((e) => {
    // Only activate on desktop
    if (window.innerWidth <= 768) return;
    e.preventDefault();
    isDragging.current   = true;
    dragStartX.current   = e.clientX;
    dragStartWidth.current = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

    setIsDraggingActive(true);          // disable CSS transition for instant feedback
    document.body.style.cursor     = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [isCollapsed, sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta    = e.clientX - dragStartX.current;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, dragStartWidth.current + delta));

      // If the user was collapsed and drags right, exit collapsed state
      if (isCollapsed && delta > 20) {
        setIsCollapsed(false);
      }

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current           = false;
      setIsDraggingActive(false);        // re-enable CSS transition
      document.body.style.cursor   = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup',   handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup',   handleMouseUp);
    };
  }, [isCollapsed]);

  /* ── Collapse toggle ──────────────────────────────────────────────────── */
  const handleCollapseToggle = () => {
    if (isCollapsed) {
      // Restore previous width (or default if too narrow)
      const restore = prevWidthRef.current >= ICON_THRESHOLD ? prevWidthRef.current : SIDEBAR_DEFAULT;
      setSidebarWidth(restore);
      setIsCollapsed(false);
    } else {
      prevWidthRef.current = sidebarWidth;
      setIsCollapsed(true);
    }
  };

  /* ── Effective pixel width applied to the sidebar ────────────────────── */
  const effectiveWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (err) { console.error('Logout error:', err); }
  };

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const initials    = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={[
          'sidebar',
          isMobileMenuOpen  ? 'mobile-open'      : '',
          iconOnly          ? 'sidebar-icon-only' : '',
          isDraggingActive  ? 'sidebar-dragging'  : '',
        ].filter(Boolean).join(' ')}
        id="sidebar"
        style={{ width: `${effectiveWidth}px`, minWidth: `${effectiveWidth}px` }}
      >
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          {iconOnly ? (
            /* Show tiny icon-sized logo when collapsed */
            <img
              src="/iconed_logo.jpg"
              alt="KAGABO"
              className="sidebar-logo-icon"
            />
          ) : (
            <img
              src="/iconed_logo.jpg"
              alt="KAGABO Finance & Logistics"
              className="sidebar-logo"
            />
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              title={iconOnly ? item.label : undefined}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {!iconOnly && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Collapse / expand toggle — desktop only (hidden on mobile via CSS) */}
          <button
            className="sidebar-collapse-btn"
            onClick={handleCollapseToggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!iconOnly && <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-logout-btn"
            id="nav-signout"
            title={iconOnly ? 'Sign Out' : undefined}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {!iconOnly && <span>Sign Out</span>}
          </button>

          {!iconOnly && (
            <div className="sidebar-legal">
              <NavLink to="/privacy-policy" className="sidebar-legal-link">
                <Shield size={14} /> Privacy Policy
              </NavLink>
              <NavLink to="/terms-conditions" className="sidebar-legal-link">
                <FileText size={14} /> Terms & Conditions
              </NavLink>
            </div>
          )}
        </div>

        {/* ── Resize handle (desktop only) ────────────────────────────── */}
        <div
          className="sidebar-resize-handle"
          onMouseDown={handleMouseDown}
          aria-hidden="true"
        />
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="main-content">
        <header className="header" id="main-header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search products, customers, invoices…"
                className="header-search-input"
                id="global-search"
              />
            </div>
          </div>

          <div className="header-right">
            <HelpDropdown />
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
