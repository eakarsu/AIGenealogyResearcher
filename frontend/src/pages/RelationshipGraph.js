import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaUsers } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { getAll, getRelationships, createRelationship, deleteRelationship } from '../services/api';

const RELATIONSHIP_TYPES = [
  'Parent',
  'Child',
  'Sibling',
  'Spouse',
  'Grandparent',
  'Grandchild',
  'Aunt/Uncle',
  'Niece/Nephew',
  'Cousin',
  'Half-Sibling',
  'Step-Parent',
  'Step-Child',
  'Other',
];

const RelationshipGraph = () => {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });

  // Form state
  const [personId1, setPersonId1] = useState('');
  const [personId2, setPersonId2] = useState('');
  const [relType, setRelType] = useState(RELATIONSHIP_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const [relsData, personsData] = await Promise.all([
        getRelationships(p, 20),
        getAll('persons', 1, 100),
      ]);

      if (relsData && relsData.data) {
        setRelationships(relsData.data);
        setPagination(relsData.pagination || { total: 0, totalPages: 1, limit: 20 });
      } else {
        setRelationships([]);
      }

      const personList = personsData && personsData.data ? personsData.data : (Array.isArray(personsData) ? personsData : []);
      setPersons(personList);
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err.response?.status === 401) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    fetchData(1);
  }, [navigate, fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!personId1 || !personId2 || personId1 === personId2) {
      showToast('Please select two different persons', 'error');
      return;
    }
    setSaving(true);
    try {
      await createRelationship({
        person_id_1: parseInt(personId1),
        person_id_2: parseInt(personId2),
        relationship_type: relType,
        notes: notes || undefined,
      });
      showToast('Relationship added successfully');
      setPersonId1('');
      setPersonId2('');
      setRelType(RELATIONSHIP_TYPES[0]);
      setNotes('');
      fetchData(page);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add relationship', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this relationship?')) return;
    try {
      await deleteRelationship(id);
      showToast('Relationship deleted');
      fetchData(page);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete', 'error');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(newPage);
  };

  const getPersonName = (id) => {
    const p = persons.find((x) => x.id === id || x.id === parseInt(id));
    if (!p) return `Person #${id}`;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Person #${id}`;
  };

  return (
    <div style={styles.page}>
      <Navbar showBack breadcrumb="Relationship Graph" />

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaUsers style={{ color: '#ec4899', fontSize: '1.5rem' }} />
            <div>
              <h1 style={styles.title}>Relationship Graph</h1>
              <p style={styles.subtitle}>Manage connections between persons in your family tree</p>
            </div>
          </div>
        </div>

        {/* Add Relationship Form */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Add Relationship</h2>
          <form onSubmit={handleAdd} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Person 1</label>
                <select
                  style={styles.select}
                  value={personId1}
                  onChange={(e) => setPersonId1(e.target.value)}
                  required
                >
                  <option value="">Select person...</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {`${p.first_name || ''} ${p.last_name || ''}`.trim() || `Person #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Relationship Type</label>
                <select
                  style={styles.select}
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                >
                  {RELATIONSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Person 2</label>
                <select
                  style={styles.select}
                  value={personId2}
                  onChange={(e) => setPersonId2(e.target.value)}
                  required
                >
                  <option value="">Select person...</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {`${p.first_name || ''} ${p.last_name || ''}`.trim() || `Person #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 2 }}>
                <label style={styles.label}>Notes (optional)</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ ...styles.formGroup, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !personId1 || !personId2}
                  style={{ alignSelf: 'flex-end', marginTop: 'auto' }}
                >
                  <FaPlus /> {saving ? 'Adding...' : 'Add Relationship'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Relationships Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.loadingCenter}>
              <div className="spinner spinner-lg" />
              <p style={{ color: '#71717a', marginTop: 12 }}>Loading relationships...</p>
            </div>
          ) : relationships.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FaUsers /></div>
              <h3 style={{ color: '#a1a1aa', marginBottom: 8 }}>No relationships yet</h3>
              <p style={{ color: '#71717a', fontSize: '0.9rem' }}>
                Use the form above to add a relationship between two persons.
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Person 1</th>
                      <th>Relationship</th>
                      <th>Person 2</th>
                      <th>Notes</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationships.map((rel) => (
                      <tr key={rel.id} className="animate-fade-in">
                        <td style={{ fontWeight: 600, color: '#e4e4e7' }}>
                          {rel.person1_name || getPersonName(rel.person_id_1)}
                        </td>
                        <td>
                          <span style={{
                            background: '#ec489920', color: '#ec4899',
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                          }}>
                            {rel.relationship_type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#e4e4e7' }}>
                          {rel.person2_name || getPersonName(rel.person_id_2)}
                        </td>
                        <td style={{ color: '#71717a', fontSize: '0.85rem' }}>
                          {rel.notes || '-'}
                        </td>
                        <td style={{ color: '#71717a', fontSize: '0.8rem' }}>
                          {rel.created_at ? new Date(rel.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(rel.id)}
                            style={{
                              background: 'transparent', border: '1px solid #ef4444',
                              color: '#ef4444', borderRadius: 6, padding: '4px 10px',
                              cursor: 'pointer', fontSize: '0.8rem',
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}>
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
                            borderColor: p === page ? '#ec4899' : '#2a2e45',
                            background: p === page ? '#ec4899' : '#0f1117',
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
  page: { minHeight: '100vh', background: '#0f1117' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: '1.8rem', fontWeight: 800, color: '#e4e4e7', letterSpacing: '-0.5px' },
  subtitle: { color: '#71717a', fontSize: '0.9rem', marginTop: 4 },
  formCard: {
    background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 16, padding: 28, marginBottom: 28,
  },
  formTitle: { fontSize: '1rem', fontWeight: 700, color: '#a1a1aa', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' },
  form: {},
  formRow: { display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  formGroup: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 160 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#a1a1aa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.3px' },
  select: {
    padding: '10px 14px', background: '#0f1117', border: '1px solid #2a2e45', borderRadius: 8,
    color: '#e4e4e7', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", outline: 'none',
  },
  input: {
    padding: '10px 14px', background: '#0f1117', border: '1px solid #2a2e45', borderRadius: 8,
    color: '#e4e4e7', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", outline: 'none',
  },
  tableCard: { background: '#1a1d2e', border: '1px solid #2a2e45', borderRadius: 16, overflow: 'hidden' },
  loadingCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' },
};

export default RelationshipGraph;
