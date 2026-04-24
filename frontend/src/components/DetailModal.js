import React from 'react';
import { FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const DetailModal = ({ title, data, onEdit, onDelete, onClose }) => {
  if (!data) return null;

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const excludeKeys = ['id', 'user_id', 'created_at', 'updated_at'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div style={styles.detailGrid}>
          {Object.entries(data)
            .filter(([key]) => !excludeKeys.includes(key))
            .map(([key, value]) => (
              <div key={key} style={styles.detailItem}>
                <div style={styles.detailLabel}>{formatKey(key)}</div>
                <div style={styles.detailValue}>{formatValue(value)}</div>
              </div>
            ))}
        </div>
        {data.created_at && (
          <div style={styles.meta}>
            Created: {new Date(data.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={() => onDelete(data.id)}>
            <FaTrash /> Delete
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(data)}>
            <FaEdit /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
  },
  detailItem: {
    padding: '12px 16px',
    background: '#0f1117',
    borderRadius: '8px',
    border: '1px solid #2a2e45',
  },
  detailLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#e4e4e7',
    wordBreak: 'break-word',
  },
  meta: {
    marginTop: '16px',
    fontSize: '0.8rem',
    color: '#71717a',
    textAlign: 'right',
  },
};

export default DetailModal;
