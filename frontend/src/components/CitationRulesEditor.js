import React, { useEffect, useState } from 'react';
import api from '../services/api';

const blank = { source_type: '', label: '', confidence_weight: 0.5, citation_template: '', required_fields: 'title' };

const CitationRulesEditor = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/custom-views/citation-rules')
      .then((r) => setRules(r.data.rules || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      const payload = {
        action: editingId ? 'update' : 'create',
        id: editingId,
        rule: {
          source_type: draft.source_type,
          label: draft.label,
          confidence_weight: Number(draft.confidence_weight),
          citation_template: draft.citation_template,
          required_fields: String(draft.required_fields).split(',').map((s) => s.trim()).filter(Boolean),
        },
      };
      await api.post('/custom-views/citation-rules', payload);
      setDraft(blank);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    await api.post('/custom-views/citation-rules', { action: 'delete', id });
    load();
  };

  const reset = async () => {
    await api.post('/custom-views/citation-rules', { action: 'reset' });
    setDraft(blank);
    setEditingId(null);
    load();
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setDraft({
      source_type: r.source_type,
      label: r.label,
      confidence_weight: r.confidence_weight,
      citation_template: r.citation_template,
      required_fields: (r.required_fields || []).join(','),
    });
  };

  if (loading) return <div style={S.box}>Loading citation rules...</div>;

  return (
    <div style={S.box}>
      <h3 style={S.title}>Source / Citation Rules Editor</h3>
      {error && <div style={{ color: '#ef4444', marginBottom: 10 }}>Error: {error}</div>}

      <div style={S.formGrid}>
        <input placeholder="source_type (census)" value={draft.source_type} onChange={(e) => setDraft({ ...draft, source_type: e.target.value })} style={S.in} />
        <input placeholder="label (Census Record)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} style={S.in} />
        <input type="number" step="0.05" min="0" max="1" placeholder="confidence (0..1)" value={draft.confidence_weight} onChange={(e) => setDraft({ ...draft, confidence_weight: e.target.value })} style={S.in} />
        <input placeholder="required_fields (comma sep)" value={draft.required_fields} onChange={(e) => setDraft({ ...draft, required_fields: e.target.value })} style={S.in} />
        <input placeholder="citation_template" value={draft.citation_template} onChange={(e) => setDraft({ ...draft, citation_template: e.target.value })} style={{ ...S.in, gridColumn: '1 / -1' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={S.btnPrimary} onClick={submit}>{editingId ? 'Update Rule' : 'Add Rule'}</button>
        {editingId && (
          <button style={S.btn} onClick={() => { setEditingId(null); setDraft(blank); }}>Cancel</button>
        )}
        <button style={{ ...S.btn, marginLeft: 'auto' }} onClick={reset}>Reset to defaults</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={S.th}>Source Type</th>
            <th style={S.th}>Label</th>
            <th style={S.th}>Confidence</th>
            <th style={S.th}>Required</th>
            <th style={S.th}>Template</th>
            <th style={S.th}></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id}>
              <td style={S.td}><code>{r.source_type}</code></td>
              <td style={S.td}>{r.label}</td>
              <td style={S.td}>
                <div style={S.bar}>
                  <div style={{ ...S.barFill, width: `${(r.confidence_weight || 0) * 100}%` }} />
                </div>
                <span style={{ fontSize: 11, color: '#a1a1aa' }}>{r.confidence_weight}</span>
              </td>
              <td style={S.td}>{(r.required_fields || []).join(', ')}</td>
              <td style={{ ...S.td, fontSize: 11, color: '#a1a1aa', maxWidth: 240 }}>{r.citation_template}</td>
              <td style={S.td}>
                <button style={S.smBtn} onClick={() => startEdit(r)}>Edit</button>
                <button style={{ ...S.smBtn, background: '#7f1d1d' }} onClick={() => remove(r.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const S = {
  box: { background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 12, padding: 20, color: '#e4e4e7' },
  title: { margin: '0 0 12px', fontSize: '1.15rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, marginBottom: 12 },
  in: { background: '#0f1226', border: '1px solid #2a2e45', borderRadius: 8, padding: '8px 10px', color: '#e4e4e7', fontSize: 13 },
  btn: { padding: '8px 14px', background: '#232740', color: '#e4e4e7', border: '1px solid #2a2e45', borderRadius: 8, cursor: 'pointer' },
  btnPrimary: { padding: '8px 14px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #2a2e45', color: '#a1a1aa', fontSize: 12 },
  td: { padding: '8px 10px', borderBottom: '1px solid #232740', fontSize: 12, verticalAlign: 'top' },
  smBtn: { padding: '4px 8px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 4, fontSize: 11 },
  bar: { width: 80, height: 6, background: '#0f1226', borderRadius: 3, overflow: 'hidden', marginBottom: 2 },
  barFill: { height: 6, background: 'linear-gradient(90deg, #6c63ff, #10b981)' },
};

export default CitationRulesEditor;
