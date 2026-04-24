const express = require('express');
const { pool } = require('../db');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET /api/{table} - list all records
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} ORDER BY created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(`Error listing ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/{table}/:id - get single record
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [id]
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

  // POST /api/{table} - create record
  router.post('/', async (req, res) => {
    try {
      const values = [];
      const cols = [];
      const placeholders = [];
      let idx = 1;

      for (const col of columns) {
        if (req.body[col] !== undefined) {
          cols.push(col);
          values.push(req.body[col]);
          placeholders.push(`$${idx}`);
          idx++;
        }
      }

      if (cols.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      const query = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(`Error creating ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/{table}/:id - update record
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const setClauses = [];
      const values = [];
      let idx = 1;

      for (const col of columns) {
        if (req.body[col] !== undefined) {
          setClauses.push(`${col} = $${idx}`);
          values.push(req.body[col]);
          idx++;
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided' });
      }

      values.push(id);
      const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${tableName} record not found` });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/{table}/:id - delete record
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
        [id]
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
