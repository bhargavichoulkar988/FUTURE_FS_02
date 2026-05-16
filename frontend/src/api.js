// Centralised API helper — all requests go through here
// In production (GitHub Pages) use the deployed backend URL.
// In local dev the proxy in package.json forwards /api → localhost:5000
const BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://future-fs-02-vrvh.onrender.com/api'
    : '/api';

const TIMEOUT_MS = 60000; // 60 seconds — Render free tier cold start can take 30-50s

function getToken() {
  return localStorage.getItem('crm_token');
}

// Wraps fetch with an AbortController timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Server is waking up, please try again in a moment.');
    }
    throw new Error('Network error — check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetchWithTimeout(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });

export const getMe = () => request('/auth/me');

// Leads
export const getLeads = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
  ).toString();
  return request(`/leads${qs ? `?${qs}` : ''}`);
};

export const getLead = (id) => request(`/leads/${id}`);

export const createLead = (data) =>
  request('/leads', { method: 'POST', body: JSON.stringify(data) });

export const updateLead = (id, data) =>
  request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteLead = (id) =>
  request(`/leads/${id}`, { method: 'DELETE' });

export const addNote = (id, text) =>
  request(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ text }) });

export const deleteNote = (leadId, noteId) =>
  request(`/leads/${leadId}/notes/${noteId}`, { method: 'DELETE' });

export const getAnalytics = () => request('/leads/analytics');
