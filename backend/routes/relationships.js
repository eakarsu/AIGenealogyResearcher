const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure relationships table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    person_id_1 INTEGER,
    person_id_2 INTEGER,
    relationship_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch((err) => console.error('relationships table init error:', err.message));

// GET /api/relationships — list for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countRes = await pool.query(
      'SELECT COUNT(*) FROM relationships WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const result = await pool.query(
      `SELECT r.*,
        p1.first_name || ' ' || p1.last_name AS person1_name,
        p2.first_name || ' ' || p2.last_name AS person2_name
       FROM relationships r
       LEFT JOIN persons p1 ON p1.id = r.person_id_1
       LEFT JOIN persons p2 ON p2.id = r.person_id_2
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error listing relationships:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/relationships — create
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { person_id_1, person_id_2, relationship_type, notes } = req.body;
    if (!person_id_1 || !person_id_2 || !relationship_type) {
      return res.status(400).json({ error: 'person_id_1, person_id_2, and relationship_type are required' });
    }
    const result = await pool.query(
      `INSERT INTO relationships (user_id, person_id_1, person_id_2, relationship_type, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, person_id_1, person_id_2, relationship_type, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating relationship:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/relationships/:id — scoped to user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM relationships WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    res.json({ message: 'Deleted', record: result.rows[0] });
  } catch (err) {
    console.error('Error deleting relationship:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
