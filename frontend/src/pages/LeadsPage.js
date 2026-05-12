import React, { useState, useEffect, useCallback } from 'react';
import { getLeads, updateLead, deleteLead } from '../api';
import LeadDetailModal from '../components/LeadDetailModal';
import './LeadsPage.css';

const STATUS_OPTIONS = ['', 'new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCE_OPTIONS = ['', 'website', 'referral', 'social_media', 'email', 'other'];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLeads({ search, status: statusFilter, source: sourceFilter, page, limit: 15 });
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateLead(id, { status });
      setLeads((prev) => prev.map((l) => (l._id === id ? updated : l)));
      if (selectedLead?._id === id) setSelectedLead(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      if (selectedLead?._id === id) setSelectedLead(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeadUpdated = (updated) => {
    setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    setSelectedLead(updated);
  };

  return (
    <div className="leads-page">
      {/* Filters */}
      <div className="leads-filters card">
        <input
          type="search"
          className="form-control search-input"
          placeholder="Search by name, email, company…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="form-control filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
        <select
          className="form-control filter-select"
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s ? s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All Sources'}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Table */}
      <div className="card leads-table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : leads.length === 0 ? (
          <div className="table-empty">
            <span>🔍</span>
            <p>No leads found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} onClick={() => setSelectedLead(lead)} className="lead-row">
                    <td className="lead-name">{lead.name}</td>
                    <td className="lead-email">{lead.email}</td>
                    <td>{lead.company || '—'}</td>
                    <td>
                      <span className="source-tag">
                        {lead.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={`status-select status-${lead.status}`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="lead-date">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedLead(lead)}
                          title="View details"
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(lead._id)}
                          title="Delete lead"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} leads
            </span>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
          onDeleted={(id) => { handleDelete(id); }}
        />
      )}
    </div>
  );
}
