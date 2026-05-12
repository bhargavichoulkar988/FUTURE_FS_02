import React, { useState } from 'react';
import { useAuth } from '../App';
import LeadsPage from './LeadsPage';
import AnalyticsPage from './AnalyticsPage';
import AddLeadPage from './AddLeadPage';
import './DashboardLayout.css';

const NAV = [
  { id: 'leads',     label: 'Leads',     icon: '👥' },
  { id: 'add',       label: 'Add Lead',  icon: '✦' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
];

const PAGE_META = {
  leads:     { title: 'Leads',     subtitle: 'Manage and track your client pipeline' },
  add:       { title: 'Add Lead',  subtitle: 'Manually capture a new lead' },
  analytics: { title: 'Analytics', subtitle: 'Insights into your lead performance' },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('leads');
  const [navOpen, setNavOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'leads':     return <LeadsPage />;
      case 'add':       return <AddLeadPage onSaved={() => setPage('leads')} />;
      case 'analytics': return <AnalyticsPage />;
      default:          return <LeadsPage />;
    }
  };

  const navigate = (id) => {
    setPage(id);
    setNavOpen(false);
  };

  const meta = PAGE_META[page];

  return (
    <div className="layout">
      {/* ── Top Navbar ── */}
      <header className="topbar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">CRM</div>
          <span className="brand-name">Mini CRM</span>
        </div>

        {/* Nav links */}
        <nav className={`sidebar-nav ${navOpen ? 'open' : ''}`}>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: user + logout */}
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="menu-toggle"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle menu"
        >
          {navOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* ── Page ── */}
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-subtitle">{meta.subtitle}</p>
        </div>
        <div className="page-content">{renderPage()}</div>
      </main>
    </div>
  );
}
