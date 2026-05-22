import React, { useEffect, useState } from 'react';
import api from '../services/api';

const FamilyTreeView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/family-tree')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={S.box}>Loading family tree...</div>;
  if (error) return <div style={{ ...S.box, color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return <div style={S.box}>No data</div>;

  const { nodes = [], edges = [], width, height, generations, total_persons, total_edges } = data;

  if (nodes.length === 0) {
    return (
      <div style={S.box}>
        <h3 style={S.title}>Family Tree Visualization</h3>
        <p style={S.muted}>No person records found. Add persons to render the tree.</p>
      </div>
    );
  }

  const genderColor = (g) => g === 'male' ? '#3b82f6' : g === 'female' ? '#ec4899' : '#a855f7';

  return (
    <div style={S.box}>
      <h3 style={S.title}>Family Tree Visualization</h3>
      <div style={S.meta}>
        Generations: <b>{generations}</b> &nbsp;|&nbsp; Persons: <b>{total_persons}</b> &nbsp;|&nbsp; Edges: <b>{total_edges}</b>
      </div>
      <div style={{ overflow: 'auto', maxHeight: 540, border: '1px solid #2a2e45', borderRadius: 8 }}>
        <svg width={width} height={height} style={{ background: '#0f1226' }}>
          {edges.map((e, i) => (
            <line
              key={`e${i}`}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#6c63ff" strokeWidth="2" strokeOpacity="0.6"
            />
          ))}
          {nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <rect
                width="160" height="60" rx="8"
                fill="#1a1d2e"
                stroke={genderColor(n.gender)}
                strokeWidth="2"
              />
              <text x="10" y="22" fill="#e4e4e7" fontSize="13" fontWeight="600">
                {(n.label || '').slice(0, 22)}
              </text>
              <text x="10" y="42" fill="#a1a1aa" fontSize="11">
                Gen {n.generation} {n.subtitle ? `• ${n.subtitle}` : ''}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const S = {
  box: { background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 12, padding: 20, color: '#e4e4e7' },
  title: { margin: '0 0 12px', fontSize: '1.15rem' },
  meta: { color: '#a1a1aa', marginBottom: 12, fontSize: '0.9rem' },
  muted: { color: '#71717a' },
};

export default FamilyTreeView;
