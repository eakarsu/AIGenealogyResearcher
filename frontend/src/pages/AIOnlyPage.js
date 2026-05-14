import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaPaperPlane, FaFont, FaClock, FaHistory } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import AIResultDisplay from '../components/AIResultDisplay';
import { aiQuery, getAll } from '../services/api';

const featureConfig = {
  'ethnicity-estimation': {
    title: 'Ethnicity Estimation',
    subtitle: 'AI-powered analysis of ethnic origins based on genealogical data',
    placeholder: 'Enter background information about the person (names, locations, historical context, known ancestry)...',
    inputType: 'textarea',
    icon: FaBrain,
    color: '#6c63ff',
    aiFeature: 'ethnicity-estimation',
    queryLabel: 'Person Background Information',
  },
  'name-origin': {
    title: 'Name Origin Analysis',
    subtitle: 'Discover the historical and geographical origins of surnames and given names',
    placeholder: 'Enter a surname or full name to analyze...',
    inputType: 'text',
    icon: FaFont,
    color: '#00d4aa',
    aiFeature: 'name-origin',
    queryLabel: 'Name to Analyze',
  },
  'timeline-generator': {
    title: 'Timeline Generator',
    subtitle: 'Generate comprehensive life timelines from genealogical records',
    placeholder: 'Enter person details, dates, events, and locations to generate a timeline...',
    inputType: 'textarea',
    icon: FaClock,
    color: '#f59e0b',
    aiFeature: 'timeline',
    queryLabel: 'Person Details & Events',
  },
};

const AIOnlyPage = ({ feature }) => {
  const navigate = useNavigate();
  const config = featureConfig[feature];
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    fetchHistory();
    // eslint-disable-next-line
  }, [feature]);

  const fetchHistory = async () => {
    try {
      const data = await getAll('ai_results', 1, 50);
      const rows = data && data.data ? data.data : (Array.isArray(data) ? data : []);
      const filtered = rows.filter((r) => r.feature === config.aiFeature);
      setHistory(filtered.slice(0, 10));
    } catch {
      // ai_results table may not exist, that's fine
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await aiQuery(config.aiFeature, { query });
      setResult(data);
      fetchHistory();
    } catch (err) {
      const msg = err.isRateLimit
        ? err.message
        : (err.response?.data?.error || 'AI analysis failed');
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = config.icon;

  return (
    <div style={styles.page}>
      <Navbar showBack breadcrumb={config.title} />

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="animate-fade-in">
          <div style={{ ...styles.iconCircle, background: `${config.color}15` }}>
            <IconComponent style={{ color: config.color, fontSize: '1.8rem' }} />
          </div>
          <h1 style={styles.title}>{config.title}</h1>
          <p style={styles.subtitle}>{config.subtitle}</p>
        </div>

        {/* Input Card */}
        <div style={styles.inputCard} className="animate-fade-in-up">
          <label style={styles.label}>{config.queryLabel}</label>
          {config.inputType === 'textarea' ? (
            <textarea
              style={styles.textarea}
              placeholder={config.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
            />
          ) : (
            <input
              style={styles.input}
              type="text"
              placeholder={config.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          )}
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

        {/* Loading state */}
        {loading && (
          <div style={styles.loadingCard} className="animate-fade-in">
            <div className="spinner spinner-lg" />
            <p style={{ color: '#a1a1aa', marginTop: '16px', fontSize: '0.95rem' }}>
              AI is analyzing your request...
            </p>
            <div style={styles.loadingBar}>
              <div style={styles.loadingBarInner} />
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <AIResultDisplay result={result} timestamp={new Date().toISOString()} />
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={styles.historySection} className="animate-fade-in">
            <button
              style={styles.historyToggle}
              onClick={() => setShowHistory(!showHistory)}
            >
              <FaHistory style={{ color: '#6c63ff' }} />
              <span>Past Analyses ({history.length})</span>
              <span style={{ color: '#71717a', fontSize: '0.8rem' }}>
                {showHistory ? 'Hide' : 'Show'}
              </span>
            </button>
            {showHistory && (
              <div style={styles.historyList}>
                {history.map((item, idx) => (
                  <div key={idx} style={styles.historyItem} onClick={() => {
                    setResult(item.result || item);
                    setQuery(item.query || '');
                  }}>
                    <div style={styles.historyQuery}>{item.query || 'Previous query'}</div>
                    <div style={styles.historyDate}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px 60px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  iconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#e4e4e7',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#71717a',
    fontSize: '1rem',
  },
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
  input: {
    width: '100%',
    padding: '14px 16px',
    background: '#0f1117',
    border: '1px solid #2a2e45',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '1rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
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
    minHeight: '120px',
    lineHeight: '1.6',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
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
  loadingBar: {
    width: '200px',
    height: '3px',
    background: '#2a2e45',
    borderRadius: '2px',
    marginTop: '16px',
    overflow: 'hidden',
  },
  loadingBarInner: {
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, #6c63ff, #00d4aa)',
    borderRadius: '2px',
    animation: 'shimmer 1.5s ease infinite',
    backgroundSize: '200% 100%',
  },
  historySection: {
    marginTop: '36px',
  },
  historyToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px 20px',
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '12px',
    color: '#e4e4e7',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  historyList: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  historyQuery: {
    color: '#e4e4e7',
    fontSize: '0.85rem',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  historyDate: {
    color: '#71717a',
    fontSize: '0.75rem',
    marginLeft: '12px',
    flexShrink: 0,
  },
};

export default AIOnlyPage;
