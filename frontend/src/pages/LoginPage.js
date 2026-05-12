import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { login as apiLogin, register as apiRegister } from '../api';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [slowMsg, setSlowMsg] = useState(false);
  const slowTimer             = useRef(null);

  useEffect(() => {
    if (loading) {
      slowTimer.current = setTimeout(() => setSlowMsg(true), 3000);
    } else {
      clearTimeout(slowTimer.current);
      setSlowMsg(false);
    }
    return () => clearTimeout(slowTimer.current);
  }, [loading]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setSlowMsg(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await apiLogin(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Full name is required'); setLoading(false); return; }
        data = await apiRegister(form.name, form.email, form.password);
      }
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left decorative panel ── */}
      <div className="login-panel-left">
        <div className="login-hero">
          <div className="login-hero-logo">CRM</div>
          <h1>Manage your <span>leads</span> smarter</h1>
          <p>A lightweight CRM to track, qualify, and convert your client pipeline — all in one place.</p>
          <div className="login-features">
            {['Track leads from every source', 'Update statuses in real time', 'Add follow-up notes instantly', 'Visualise your pipeline analytics'].map((f) => (
              <div className="login-feature" key={f}>
                <div className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-panel-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p>{mode === 'login' ? 'Sign in to your workspace' : 'Get started for free today'}</p>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign In</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Register</button>
          </div>

          {error   && <div className="alert alert-error">{error}</div>}
          {slowMsg && !error && (
            <div className="alert alert-info">⏳ Server is waking up (free tier) — please wait…</div>
          )}

          <form onSubmit={submit} className="login-form">
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" className="form-control"
                  placeholder="Jane Smith" value={form.name} onChange={handle} required autoComplete="name" />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-control"
                placeholder="you@example.com" value={form.email} onChange={handle} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-control"
                placeholder="••••••••" value={form.password} onChange={handle} required minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading && <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="login-hint">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button className="link-btn" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
