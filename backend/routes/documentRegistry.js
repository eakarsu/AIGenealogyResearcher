/*
 * routes/documentRegistry.js — Document upload metadata registry.
 *
 * Pass 5 mechanical addition: closes backlog item "Document upload & storage"
 * at the metadata level. Actual file-byte storage requires a multipart body
 * parser (multer) and an object-store SDK — both NEEDS-CREDS / NEEDS-DEPS so
 * deferred. This endpoint accepts an externally-provided URL or s3 key and
 * persists searchable metadata, which still unblocks the FE upload flow when
 * paired with a presigned-URL strategy.
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const ALLOWED_TYPES = ['census', 'newspaper', 'church', 'land', 'military', 'ship_manifest', 'birth', 'death', 'marriage', 'photo', 'letter', 'other'];

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS document_uploads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      file_url TEXT,
      file_storage_key TEXT,
      mime_type TEXT,
      size_bytes BIGINT,
      person_name TEXT,
      event_year INTEGER,
      location TEXT,
      ocr_text TEXT,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_doc_user ON document_uploads(user_id);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { type, person, search } = req.query;
    const clauses = ['user_id = $1']; const params = [req.user.id];
    if (type) { params.push(type); clauses.push(`doc_type = $${params.length}`); }
    if (person) { params.push(`%${person}%`); clauses.push(`person_name ILIKE $${params.length}`); }
    if (search) { params.push(`%${search}%`); clauses.push(`(title ILIKE $${params.length} OR ocr_text ILIKE $${params.length})`); }
    const r = await pool.query(`SELECT * FROM document_uploads WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT 200`, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/types', (req, res) => res.json({ types: ALLOWED_TYPES }));

router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title || !b.doc_type) return res.status(400).json({ error: 'title and doc_type required' });
    if (!ALLOWED_TYPES.includes(b.doc_type)) return res.status(400).json({ error: `doc_type must be one of ${ALLOWED_TYPES.join(', ')}` });
    if (!b.file_url && !b.file_storage_key) return res.status(400).json({ error: 'one of file_url or file_storage_key is required' });
    const r = await pool.query(
      `INSERT INTO document_uploads (user_id, title, doc_type, file_url, file_storage_key, mime_type, size_bytes, person_name, event_year, location, ocr_text, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user.id, b.title, b.doc_type, b.file_url || null, b.file_storage_key || null, b.mime_type || null, b.size_bytes || null,
        b.person_name || null, b.event_year || null, b.location || null, b.ocr_text || null, b.tags || []]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = ['title','doc_type','file_url','file_storage_key','mime_type','size_bytes','person_name','event_year','location','ocr_text','tags'];
    const sets = []; const params = [];
    fields.forEach((f) => { if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f}=$${params.length}`); } });
    if (sets.length === 0) return res.status(400).json({ error: 'no fields' });
    sets.push('updated_at=CURRENT_TIMESTAMP');
    params.push(req.params.id, req.user.id);
    const r = await pool.query(`UPDATE document_uploads SET ${sets.join(', ')} WHERE id=$${params.length-1} AND user_id=$${params.length} RETURNING *`, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM document_uploads WHERE id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
