import React, { useState } from 'react';
import { updateLead, addNote, deleteNote } from '../api';
import './LeadDetailModal.css';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCE_OPTIONS = ['website', 'referral', 'social_media', 'email', 'other'];

export default function LeadDetailModal({ lead, onClose, onUpdated, onDeleted }) {
  const [status, setStatus] = useState(lead.status);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [error, setError] = useState('');

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStatusSave = async () => {
    if (status === lead.status) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateLead(lead._id, { status });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    setError('');
    try {
      const updated = await addNote(lead._id, noteText.trim());
      onUpdated(updated);
      setNoteText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const updated = await deleteNote(lead._id, noteId);
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="Lead details">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-name">{lead.name}</h3>
            <a href={`mailto:${lead.email}`} className="modal-email">{lead.email}</a>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ margin: '0 20px' }}>{error}</div>}

        <div className="modal-body">
          {/* Info grid */}
          <div className="info-grid">
            <InfoRow label="Phone"   value={lead.phone   || '—'} />
            <InfoRow label="Company" value={lead.company || '—'} />
            <InfoRow label="Source"  value={lead.source.replace('_', ' ')} />
            <InfoRow label="Created" value={new Date(lead.createdAt).toLocaleString()} />
          </div>

          {lead.message && (
            <div className="lead-message">
              <span className="info-label">Message</span>
              <p>{lead.message}</p>
            </div>
          )}

          {/* Status update */}
          <div className="status-section">
            <span className="info-label">Status</span>
            <div className="status-row">
              <select
                className={`form-control status-select-modal status-${status}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleStatusSave}
                disabled={saving || status === lead.status}
              >
                {saving ? '…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="notes-section">
            <span className="info-label">Follow-up Notes ({lead.notes.length})</span>

            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                className="form-control"
                rows={2}
                placeholder="Add a follow-up note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="btn btn-success btn-sm" disabled={addingNote || !noteText.trim()}>
                {addingNote ? '…' : '+ Add Note'}
              </button>
            </form>

            <div className="notes-list">
              {lead.notes.length === 0 ? (
                <p className="notes-empty">No notes yet.</p>
              ) : (
                [...lead.notes].reverse().map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-meta">
                      <span className="note-author">{note.addedBy}</span>
                      <span className="note-date">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="note-text">{note.text}</p>
                    <button
                      className="note-delete"
                      onClick={() => handleDeleteNote(note._id)}
                      aria-label="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
