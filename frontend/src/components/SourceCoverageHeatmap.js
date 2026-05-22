import React, { useEffect, useState } from 'react';
import api from '../services/api';

const SourceCoverageHeatmap = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/source-coverage')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={S.box}>Loading coverage heatmap...</div>;
  if (error) return <div style={{ ...S.box, color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return <div style={S.box}>No data</div>;

  const { sources = [], ancestors = [], max_value = 1 } = data;

  const shade = (count) => {
    if (count === 0) return '#1a1d2e';
    const ratio = Math.min(1, count / max_value);
    // teal -> green gradient
    const r = Math.round(20 + ratio * 30);
    const g = Math.round(80 + ratio * 130);
    const b = Math.round(120 + ratio * 50);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={S.box}>
      <h3 style={S.title}>Source Coverage Heatmap</h3>
      <div style={S.meta}>
        Ancestors: <b>{ancestors.length}</b> &nbsp;|&nbsp; Source types: <b>{sources.length}</b> &nbsp;|&nbsp; Max cell: <b>{max_value}</b>
      </div>

      {ancestors.length === 0 ? (
        <p style={S.muted}>No persons to chart. Add persons first.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={S.th}>Ancestor</th>
                {sources.map((s) => (
                  <th key={s.key} style={{ ...S.th, textAlign: 'center' }}>{s.label}</th>
                ))}
                <th style={{ ...S.th, textAlign: 'center' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ancestors.map((a) => (
                <tr key={a.person_id}>
                  <td style={S.td}>{a.person_name}</td>
                  {a.cells.map((c) => (
                    <td
                      key={c.source_type}
                      style={{
                        ...S.td,
                        textAlign: 'center',
                        background: shade(c.count),
                        color: c.count > 0 ? '#fff' : '#52525b',
                        fontWeight: 600,
                        minWidth: 60,
                      }}
                      title={`${c.source_type}: ${c.count}`}
                    >
                      {c.count}
                    </td>
                  ))}
                  <td style={{ ...S.td, textAlign: 'center', fontWeight: 700 }}>{a.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const S = {
  box: { background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 12, padding: 20, color: '#e4e4e7' },
  title: { margin: '0 0 12px', fontSize: '1.15rem' },
  meta: { color: '#a1a1aa', marginBottom: 12, fontSize: '0.9rem' },
  muted: { color: '#71717a' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #2a2e45', color: '#a1a1aa', fontSize: '0.85rem' },
  td: { padding: '6px 10px', borderBottom: '1px solid #232740', color: '#e4e4e7', fontSize: '0.85rem' },
};

export default SourceCoverageHeatmap;
