import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaBalanceScale, FaRoad } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import AIResultDisplay from '../components/AIResultDisplay';
import { aiQuery } from '../services/api';

/**
 * Frontend for the 2 new AI endpoints in backend/routes/ai.js:
 *   POST /api/ai/conflict-resolution
 *   POST /api/ai/research-roadmap
 *
 * Mirrors AIOnlyPage.js styling — uses inline styles + className conventions.
 */

const FEATURES = {
  'conflict-resolution': {
    title: 'Conflict Resolution',
    subtitle: 'Reconcile contradictory primary records with source reliability and transcription risk.',
    placeholder: 'Describe the conflicting records (e.g., conflicting birth years across census, baptism, and gravestone)...',
    icon: FaBalanceScale,
    color: '#6c63ff',
    queryLabel: 'Conflicting Records',
  },
  'research-roadmap': {
    title: 'Research Roadmap',
    subtitle: 'Next-best 5-10 research steps with payoff/effort scoring + tool suggestions.',
    placeholder: 'Describe what you know so far and what you are trying to learn (e.g., search for great-grandfather\'s arrival in 1890s NYC)...',
    icon: FaRoad,
    color: '#00d4aa',
    queryLabel: 'Research Brief',
  },
};

const TABS = Object.keys(FEATURES).map((id) => ({ id, label: FEATURES[id].title }));

export default function AIAdvancedPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('conflict-resolution');
  const [query, setQuery] = useState('');
  const [extra, setExtra] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auth check on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiQuery(tab, { query, context: extra });
      setResult(data);
    } catch (err) {
      const msg = err.isRateLimit
        ? err.message
        : err.response?.data?.error || 'AI request failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const config = FEATURES[tab];
  const IconComponent = config.icon;

  return (
    <div style={styles.page}>
      <Navbar showBack breadcrumb="AI Advanced" />

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.header} className="animate-fade-in">
          <div style={{ ...styles.iconCircle, background: `${config.color}15` }}>
            <IconComponent style={{ color: config.color, fontSize: '1.8rem' }} />
          </div>
          <h1 style={styles.title}>{config.title}</h1>
          <p style={styles.subtitle}>{config.subtitle}</p>
        </div>

        <div style={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setResult(null);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: tab === t.id ? '1px solid #6c63ff' : '1px solid #2a2e45',
                background: tab === t.id ? 'rgba(108,99,255,0.15)' : '#1a1d2e',
                color: tab === t.id ? '#a5b4fc' : '#e4e4e7',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.inputCard} className="animate-fade-in-up">
          <label style={styles.label}>{config.queryLabel}</label>
          <textarea
            style={styles.textarea}
            placeholder={config.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={6}
          />

          <label style={{ ...styles.label, marginTop: 16 }}>Additional context (optional)</label>
          <textarea
            style={styles.textarea}
            placeholder="Sources you've consulted, family lore, alternative spellings..."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={3}
          />

          <div style={styles.buttonRow}>
            <button
              className="btn btn-accent btn-lg"
              onClick={handleAnalyze}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingCard} className="animate-fade-in">
            <div className="spinner spinner-lg" />
            <p style={{ color: '#a1a1aa', marginTop: '16px', fontSize: '0.95rem' }}>
              AI is analyzing your request...
            </p>
          </div>
        )}

        {result && <AIResultDisplay result={result} timestamp={new Date().toISOString()} />}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f1117' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px 60px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  iconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: { fontSize: '2rem', fontWeight: '800', color: '#e4e4e7', letterSpacing: '-0.5px', marginBottom: '8px' },
  subtitle: { color: '#71717a', fontSize: '1rem' },
  tabs: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
  inputCard: {
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '28px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: '#0f1117',
    border: '1px solid #2a2e45',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: 'vertical',
    minHeight: '90px',
    lineHeight: '1.6',
  },
  buttonRow: { display: 'flex', justifyContent: 'center', marginTop: '20px' },
  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 20px',
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '16px',
    marginBottom: '28px',
  },
};
