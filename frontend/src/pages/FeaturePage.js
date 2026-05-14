import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBrain, FaPaperPlane, FaSearch } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import FormModal from '../components/FormModal';
import DetailModal from '../components/DetailModal';
import AIResultDisplay from '../components/AIResultDisplay';
import { getAll, create, update, deleteRecord, aiQuery } from '../services/api';

const FeaturePage = ({ tableName, displayName, columns, formFields, aiFeature }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRecords = useCallback(async (p = 1) => {
    try {
      const data = await getAll(tableName, p, 20);
      if (data && data.data) {
        setRecords(Array.isArray(data.data) ? data.data : []);
        setPagination(data.pagination || { total: 0, totalPages: 1, limit: 20 });
      } else if (Array.isArray(data)) {
        setRecords(data);
        setPagination({ total: data.length, totalPages: 1, limit: 20 });
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [tableName, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    setPage(1);
    fetchRecords(1);
  }, [navigate, fetchRecords]);

  const handleSave = async (data) => {
    try {
      if (editData && editData.id) {
        await update(tableName, editData.id, data);
        showToast('Record updated successfully');
      } else {
        await create(tableName, data);
        showToast('Record created successfully');
      }
      setShowForm(false);
      setEditData(null);
      fetchRecords(page);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save record', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecord(tableName, id);
      showToast('Record deleted successfully');
      setSelectedRecord(null);
      fetchRecords(page);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete record', 'error');
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(null);
    setEditData(record);
    setShowForm(true);
  };

  const handleAiQuery = async (prefillRecord = null) => {
    const query = prefillRecord
      ? `Analyze this record: ${JSON.stringify(prefillRecord)}`
      : aiInput;
    if (!query.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const payload = { query };
      if (prefillRecord && prefillRecord.id) {
        payload.record_id = prefillRecord.id;
      }
      const result = await aiQuery(aiFeature, payload);
      setAiResult(result);
      if (prefillRecord) {
        setAiInput(`Analyze this record: ${JSON.stringify(prefillRecord)}`);
      }
    } catch (err) {
      const msg = err.isRateLimit
        ? err.message
        : (err.response?.data?.error || 'AI analysis failed');
      showToast(msg, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchRecords(newPage);
  };

  return (
    <div style={styles.page}>
      <Navbar showBack breadcrumb={displayName} />

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{displayName}</h1>
            <p style={styles.subtitle}>
              {pagination.total} record{pagination.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditData(null); setShowForm(true); }}>
            <FaPlus /> New Item
          </button>
        </div>

        {/* AI Section */}
        {aiFeature && (
          <div style={styles.aiSection}>
            <div style={styles.aiHeader}>
              <FaBrain style={{ color: '#6c63ff', fontSize: '1.2rem' }} />
              <h2 style={styles.aiTitle}>AI Analysis</h2>
            </div>
            <div style={styles.aiInputRow}>
              <div style={styles.aiInputWrapper}>
                <FaSearch style={styles.aiSearchIcon} />
                <input
                  style={styles.aiInput}
                  type="text"
                  placeholder="Ask AI to analyze your records..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                />
              </div>
              <button
                className="btn btn-accent"
                onClick={() => handleAiQuery()}
                disabled={aiLoading || !aiInput.trim()}
              >
                {aiLoading ? (
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  <><FaPaperPlane /> Analyze with AI</>
                )}
              </button>
            </div>
            {aiResult && (
              <AIResultDisplay
                result={aiResult}
                timestamp={new Date().toISOString()}
              />
            )}
          </div>
        )}

        {/* Data Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingCenter}>
              <div className="spinner spinner-lg" />
              <p style={{ color: '#71717a', marginTop: '12px' }}>Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaSearch />
              </div>
              <h3 style={{ color: '#a1a1aa', marginBottom: '8px' }}>No records yet</h3>
              <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
                Click "New Item" to add your first record.
              </p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                      {aiFeature && <th>AI</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr
                        key={record.id || idx}
                        style={{ animationDelay: `${idx * 0.03}s` }}
                        className="animate-fade-in"
                      >
                        {columns.map((col) => (
                          <td key={col.key} onClick={() => setSelectedRecord(record)} style={{ cursor: 'pointer' }}>
                            {record[col.key] ?? '-'}
                          </td>
                        ))}
                        {aiFeature && (
                          <td>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAiQuery(record); }}
                              disabled={aiLoading}
                              title="Analyze this record with AI"
                              style={{
                                padding: '4px 10px', borderRadius: 5, border: 'none',
                                background: '#6c63ff', color: '#fff', cursor: 'pointer',
                                fontSize: '0.75rem', fontWeight: 600,
                                opacity: aiLoading ? 0.5 : 1,
                              }}
                            >
                              AI
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px' }}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    style={paginationBtnStyle(page <= 1)}
                  >
                    Prev
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: '#71717a' }}>…</span>}
                        <button
                          onClick={() => handlePageChange(p)}
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: '1px solid',
                            borderColor: p === page ? '#6c63ff' : '#2a2e45',
                            background: p === page ? '#6c63ff' : '#0f1117',
                            color: '#e4e4e7', cursor: 'pointer', fontWeight: p === page ? 700 : 400,
                          }}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pagination.totalPages}
                    style={paginationBtnStyle(page >= pagination.totalPages)}
                  >
                    Next
                  </button>
                  <span style={{ color: '#71717a', fontSize: '0.8rem' }}>
                    Page {page} of {pagination.totalPages} ({pagination.total} total)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <FormModal
          title={editData ? `Edit ${displayName}` : `New ${displayName}`}
          fields={formFields}
          initialData={editData}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditData(null); }}
        />
      )}

      {selectedRecord && (
        <DetailModal
          title={displayName}
          data={selectedRecord}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

function paginationBtnStyle(disabled) {
  return {
    padding: '6px 14px', borderRadius: 6, border: '1px solid #2a2e45',
    background: disabled ? '#0f1117' : '#1a1d2e',
    color: '#e4e4e7', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#e4e4e7',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#71717a',
    fontSize: '0.9rem',
    marginTop: '4px',
  },
  aiSection: {
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '28px',
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  aiTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  aiInputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  aiInputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  aiSearchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#71717a',
    fontSize: '0.9rem',
    pointerEvents: 'none',
  },
  aiInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    background: '#0f1117',
    border: '1px solid #2a2e45',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  tableCard: {
    background: '#1a1d2e',
    border: '1px solid #2a2e45',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  loadingCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
  },
};

export default FeaturePage;
