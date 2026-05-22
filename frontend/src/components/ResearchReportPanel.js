import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ResearchReportPanel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    api.get('/custom-views/research-report')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const download = () => {
    if (!data || !data.content) return;
    const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename || 'genealogy-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={S.box}>Building research report...</div>;
  if (error) return <div style={{ ...S.box, color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return <div style={S.box}>No report</div>;

  const { summary = {}, report_date, content } = data;

  return (
    <div style={S.box}>
      <h3 style={S.title}>Research Report (PDF)</h3>
      <div style={S.meta}>Report date: <b>{report_date}</b></div>

      <div style={S.grid}>
        <Stat label="Persons" value={summary.persons} color="#6c63ff" />
        <Stat label="Records" value={summary.records} color="#10b981" />
        <Stat label="DNA Matches" value={summary.dna_matches} color="#ec4899" />
        <Stat label="Census" value={summary.census} color="#f59e0b" />
        <Stat label="Marriages" value={summary.marriages} color="#f43f5e" />
      </div>

      <div style={S.actions}>
        <button style={S.btn} onClick={download}>Download PDF (.txt)</button>
        <button style={{ ...S.btn, background: '#232740' }} onClick={fetchReport}>Regenerate</button>
      </div>

      <pre style={S.pre}>{content}</pre>
    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div style={{ background: '#0f1226', border: `1px solid ${color}40`, padding: 12, borderRadius: 8 }}>
    <div style={{ color: '#a1a1aa', fontSize: 12 }}>{label}</div>
    <div style={{ color, fontSize: '1.4rem', fontWeight: 700 }}>{value ?? 0}</div>
  </div>
);

const S = {
  box: { background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 12, padding: 20, color: '#e4e4e7' },
  title: { margin: '0 0 12px', fontSize: '1.15rem' },
  meta: { color: '#a1a1aa', marginBottom: 12, fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 },
  actions: { display: 'flex', gap: 8, marginBottom: 12 },
  btn: { padding: '8px 14px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  pre: { background: '#0f1226', color: '#cbd5e1', padding: 14, borderRadius: 8, fontSize: 12, lineHeight: 1.55, maxHeight: 380, overflow: 'auto', whiteSpace: 'pre-wrap' },
};

export default ResearchReportPanel;
