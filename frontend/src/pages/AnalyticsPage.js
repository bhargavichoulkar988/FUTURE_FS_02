import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import './AnalyticsPage.css';

const STATUS_COLORS = {
  new:       '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  converted: '#22c55e',
  lost:      '#ef4444',
};

const SOURCE_COLORS = {
  website:      '#4f46e5',
  referral:     '#0891b2',
  social_media: '#db2777',
  email:        '#d97706',
  other:        '#6b7280',
};

const STAT_ICONS = {
  'Total Leads':      '🎯',
  'Converted':        '✅',
  'Last 30 Days':     '📅',
  'Active Pipeline':  '⚡',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card card">
      <span className="stat-icon">{STAT_ICONS[label] || '📊'}</span>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function BarChart({ data, colors, title }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="card chart-card">
      <h4 className="chart-title">{title}</h4>
      <div className="bar-list">
        {data.map((item) => (
          <div key={item._id} className="bar-row">
            <span className="bar-label">{item._id.replace('_', ' ')}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(item.count / max) * 100}%`,
                  background: colors[item._id] || '#6b7280',
                }}
              />
            </div>
            <span className="bar-count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="analytics-loading"><div className="spinner" /></div>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (!data)   return null;

  const converted = data.byStatus.find((s) => s._id === 'converted')?.count || 0;
  const convRate = data.total > 0 ? ((converted / data.total) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-page">
      {/* Summary stats */}
      <div className="stats-grid">
        <StatCard label="Total Leads"       value={data.total}       color="var(--primary)" />
        <StatCard label="Converted"         value={converted}        color="var(--success)" sub={`${convRate}% conversion rate`} />
        <StatCard label="Last 30 Days"      value={data.recentCount} color="var(--info)"    sub="new leads" />
        <StatCard
          label="Active Pipeline"
          value={data.byStatus.filter((s) => !['converted','lost'].includes(s._id)).reduce((a, b) => a + b.count, 0)}
          color="var(--warning)"
          sub="new + contacted + qualified"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <BarChart
          title="Leads by Status"
          data={data.byStatus}
          colors={STATUS_COLORS}
        />
        <BarChart
          title="Leads by Source"
          data={data.bySource}
          colors={SOURCE_COLORS}
        />
      </div>
    </div>
  );
}
