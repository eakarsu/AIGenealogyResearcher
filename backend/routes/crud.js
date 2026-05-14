const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const ALLOWED_TABLES = [
  'persons',
  'family_trees',
  'historical_records',
  'dna_matches',
  'census_records',
  'immigration_records',
  'birth_death_records',
  'marriage_records',
  'military_records',
  'newspaper_archives',
  'land_records',
  'church_records',
  'ship_manifests',
  'documents',
  'research_notes',
  'source_citations',
  'ai_results',
  'relationships',
];

function validateTable(name) {
  if (!ALLOWED_TABLES.includes(name)) throw new Error(`Invalid table: ${name}`);
  return name;
}

function sanitizeCol(col) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) throw new Error(`Invalid column: ${col}`);
  return col;
}

function createCrudRouter(tableName, columns) {
  validateTable(tableName);
  const router = express.Router();

  // Add user_id column if not present (idempotent)
  pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS user_id INTEGER`).catch(() => {});

  // GET /api/{table} — list, scoped to user, paginated
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${tableName} WHERE user_id = $1 OR user_id IS NULL`,
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count, 10);

      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE (user_id = $1 OR user_id IS NULL) ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user.id, limit, offset]
      );
      res.json({
        data: result.rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error(`Error listing ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/{table}/:id — get single, scoped to user
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
        [id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${tableName} record not found` });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error getting ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/{table} — create
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const values = [];
      const cols = [];
      const placeholders = [];
      let idx = 1;

      for (const col of columns) {
        const safeCol = sanitizeCol(col);
        if (req.body[col] !== undefined) {
          cols.push(safeCol);
          values.push(req.body[col]);
          placeholders.push(`$${idx}`);
          idx++;
        }
      }

      // Always set user_id from token
      cols.push('user_id');
      values.push(req.user.id);
      placeholders.push(`$${idx}`);

      if (cols.length === 1) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      const query = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(`Error creating ${tableName}:`, err.message);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // PUT /api/{table}/:id — update, scoped to user
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const setClauses = [];
      const values = [];
      let idx = 1;

      for (const col of columns) {
        const safeCol = sanitizeCol(col);
        if (req.body[col] !== undefined) {
          setClauses.push(`${safeCol} = $${idx}`);
          values.push(req.body[col]);
          idx++;
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      values.push(id);
      values.push(req.user.id);
      const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${idx} AND (user_id = $${idx + 1} OR user_id IS NULL) RETURNING *`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${tableName} record not found` });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err.message);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // DELETE /api/{table}/:id — scoped to user
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *`,
        [id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${tableName} record not found` });
      }
      res.json({ message: 'Record deleted', record: result.rows[0] });
    } catch (err) {
      console.error(`Error deleting ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createCrudRouter;
