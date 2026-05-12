import React, { useState } from 'react';
import { createLead } from '../api';
import './AddLeadPage.css';

const INITIAL = {
  name: '', email: '', phone: '', company: '',
  source: 'website', message: '',
};

export default function AddLeadPage({ onSaved }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await createLead(form);
      setSuccess('Lead created successfully!');
      setForm(INITIAL);
      setTimeout(() => onSaved && onSaved(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-lead-page">
      <div className="card add-lead-card">
        <h3 className="section-title">New Lead</h3>
        <p className="section-sub">Manually add a lead from any source.</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit} className="add-lead-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="al-name">Full Name *</label>
              <input id="al-name" name="name" type="text" className="form-control"
                placeholder="Jane Smith" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label htmlFor="al-email">Email *</label>
              <input id="al-email" name="email" type="email" className="form-control"
                placeholder="jane@example.com" value={form.email} onChange={handle} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="al-phone">Phone</label>
              <input id="al-phone" name="phone" type="tel" className="form-control"
                placeholder="+1 555 000 0000" value={form.phone} onChange={handle} />
            </div>
            <div className="form-group">
              <label htmlFor="al-company">Company</label>
              <input id="al-company" name="company" type="text" className="form-control"
                placeholder="Acme Inc." value={form.company} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="al-source">Lead Source</label>
            <select id="al-source" name="source" className="form-control" value={form.source} onChange={handle}>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="al-message">Message / Notes</label>
            <textarea id="al-message" name="message" className="form-control"
              rows={4} placeholder="What did they enquire about?"
              value={form.message} onChange={handle} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
              Create Lead
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(INITIAL)}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
