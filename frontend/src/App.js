import React, { useState, useEffect, createContext, useContext } from 'react';
import { getMe } from './api';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import './App.css';

// ── Auth Context ──────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Try to restore session — if server is sleeping or fails, just clear token
    // and show login page rather than hanging forever
    const timeout = setTimeout(() => {
      localStorage.removeItem('crm_token');
      setLoading(false);
    }, 15000); // 15s max wait on startup

    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('crm_token'))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('crm_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
          Connecting to server…
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {user ? <DashboardLayout /> : <LoginPage />}
    </AuthContext.Provider>
  );
}
