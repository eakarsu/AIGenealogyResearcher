import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Apply pass 5 frontend: Document upload metadata registry + Subscription
 * plan + usage tracking. Uses the existing axios `api` instance which
 * already injects JWT bearer.
 */

export default function DocumentsAndPlanPage() {
  const [tab, setTab] = useState('docs');
  return (
    <div style={{ padding: 16 }}>
      <h1>Documents & Subscription</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('docs')}>Documents</button>
        <button onClick={() => setTab('plan')}>Plan & Usage</button>
      </div>
      {tab === 'docs' ? <Docs /> : <Plan />}
    </div>
  );
}

function Docs() {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ title: '', doc_type: 'newspaper', file_url: '', person_name: '', event_year: '', location: '', ocr_text: '' });
  const [error, setError] = useState(null);
  const refresh = async () => { try { setDocs((await api.get('/document-registry')).data); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/document-registry', { ...form, event_year: form.event_year ? Number(form.event_year) : null });
      setForm({ title: '', doc_type: 'newspaper', file_url: '', person_name: '', event_year: '', location: '', ocr_text: '' });
      refresh();
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}>
          {['census','newspaper','church','land','military','ship_manifest','birth','death','marriage','photo','letter','other'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input placeholder="file URL" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} required style={{ gridColumn: '1 / -1' }} />
        <input placeholder="person" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
        <input type="number" placeholder="event year" value={form.event_year} onChange={(e) => setForm({ ...form, event_year: e.target.value })} />
        <input placeholder="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ gridColumn: '1 / -1' }} />
        <textarea placeholder="OCR text (optional)" value={form.ocr_text} onChange={(e) => setForm({ ...form, ocr_text: e.target.value })} style={{ gridColumn: '1 / -1' }} />
        <button type="submit" style={{ gridColumn: '1 / -1' }}>Add document</button>
      </form>
      <ul>{docs.map((d) => (<li key={d.id}><a href={d.file_url} target="_blank" rel="noreferrer"><strong>{d.title}</strong></a> · {d.doc_type} · {d.person_name || '—'} · {d.event_year || '—'}</li>))}</ul>
    </div>
  );
}

function Plan() {
  const [plans, setPlans] = useState({});
  const [me, setMe] = useState(null);
  const [usage, setUsage] = useState({ usage: [] });
  const [error, setError] = useState(null);
  const refresh = async () => {
    try {
      setPlans((await api.get('/subscriptions/plans')).data.plans);
      setMe((await api.get('/subscriptions/me')).data);
      setUsage((await api.get('/subscriptions/usage/me')).data);
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };
  useEffect(() => { refresh(); }, []);
  const change = async (plan) => {
    try { await api.put('/subscriptions/me', { plan }); refresh(); } catch (err) { setError(err.message); }
  };
  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {me && <p>Current plan: <strong>{me.plan_details?.label}</strong> · status {me.status}</p>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.entries(plans).map(([k, v]) => (
          <button key={k} onClick={() => change(k)}>{v.label}</button>
        ))}
      </div>
      <h3>This month</h3>
      <ul>{usage.usage.map((u, i) => <li key={i}>{u.counter}: {u.count}</li>)}</ul>
      <p style={{ opacity: 0.7, fontSize: 12 }}>Note: real Stripe billing requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (see /api/subscriptions/stripe-webhook-stub).</p>
    </div>
  );
}
