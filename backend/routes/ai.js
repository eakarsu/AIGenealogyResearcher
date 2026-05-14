const express = require('express');
const { pool } = require('../db');
const aiService = require('../services/ai');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Save AI result to DB
async function saveAIResult(feature, query, result) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, query, result, user_id) VALUES ($1, $2, $3, $4)',
      [feature, typeof query === 'string' ? query : JSON.stringify(query), result, null]
    );
  } catch (err) {
    console.error('Failed to save AI result:', err.message);
  }
}

// Generic AI handler — no context
async function handleAIRequest(req, res, feature, aiFunction) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await aiFunction(query);
    await saveAIResult(feature, query, result);
    res.json({ feature, query, result });
  } catch (err) {
    console.error(`AI ${feature} error:`, err.message);
    res.status(500).json({ error: err.message || 'AI processing error' });
  }
}

// Context-aware handler — fetches DB record if record_id provided
async function handleContextAwareRequest(req, res, feature, aiFunction, tableName) {
  try {
    const { query, record_id } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let dbRecord = null;
    if (record_id && tableName) {
      try {
        const dbResult = await pool.query(
          `SELECT * FROM ${tableName} WHERE id = $1`,
          [record_id]
        );
        if (dbResult.rows.length > 0) {
          dbRecord = dbResult.rows[0];
        }
      } catch (dbErr) {
        console.error('Failed to fetch DB record for context:', dbErr.message);
      }
    }

    const result = await aiFunction(query, dbRecord);
    await saveAIResult(feature, query, result);
    res.json({ feature, query, result, db_record: dbRecord });
  } catch (err) {
    console.error(`AI ${feature} error:`, err.message);
    res.status(500).json({ error: err.message || 'AI processing error' });
  }
}

// POST /api/ai/historical-records — context-aware
router.post('/historical-records', authenticateToken, aiRateLimiter, (req, res) =>
  handleContextAwareRequest(req, res, 'historical-records', aiService.analyzeHistoricalRecord, 'historical_records')
);

// POST /api/ai/dna-analysis — context-aware
router.post('/dna-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleContextAwareRequest(req, res, 'dna-analysis', aiService.analyzeDNAMatch, 'dna_matches')
);

// POST /api/ai/census-search
router.post('/census-search', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'census-search', aiService.searchCensusRecords)
);

// POST /api/ai/immigration-analysis
router.post('/immigration-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'immigration-analysis', aiService.analyzeImmigrationRecord)
);

// POST /api/ai/birth-death-analysis
router.post('/birth-death-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'birth-death-analysis', aiService.analyzeBirthDeathRecord)
);

// POST /api/ai/marriage-analysis
router.post('/marriage-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'marriage-analysis', aiService.analyzeMarriageRecord)
);

// POST /api/ai/military-analysis
router.post('/military-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'military-analysis', aiService.analyzeMilitaryRecord)
);

// POST /api/ai/newspaper-search
router.post('/newspaper-search', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'newspaper-search', aiService.searchNewspaperArchive)
);

// POST /api/ai/land-analysis
router.post('/land-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'land-analysis', aiService.analyzeLandRecord)
);

// POST /api/ai/church-analysis
router.post('/church-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'church-analysis', aiService.analyzeChurchRecord)
);

// POST /api/ai/ship-manifest-analysis
router.post('/ship-manifest-analysis', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'ship-manifest-analysis', aiService.analyzeShipManifest)
);

// POST /api/ai/ethnicity-estimation
router.post('/ethnicity-estimation', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'ethnicity-estimation', aiService.estimateEthnicity)
);

// POST /api/ai/name-origin
router.post('/name-origin', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'name-origin', aiService.analyzeNameOrigin)
);

// POST /api/ai/timeline — enhanced with DB context
router.post('/timeline', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { query, person_id } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let dbContext = null;

    if (person_id) {
      // Fetch the person record
      const personRes = await pool.query('SELECT * FROM persons WHERE id = $1', [person_id]).catch(() => ({ rows: [] }));
      const person = personRes.rows[0];

      if (person) {
        const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
        dbContext = { person };

        // Fetch across related tables where person name appears
        const relatedTables = [
          { table: 'birth_death_records', col: 'person_name' },
          { table: 'marriage_records', col: 'spouse1_name' },
          { table: 'military_records', col: 'service_member' },
          { table: 'immigration_records', col: 'immigrant_name' },
          { table: 'census_records', col: 'head_of_household' },
          { table: 'church_records', col: 'person_name' },
          { table: 'ship_manifests', col: 'passenger_name' },
          { table: 'land_records', col: 'owner_name' },
          { table: 'newspaper_archives', col: 'title' },
        ];

        for (const { table, col } of relatedTables) {
          try {
            const result = await pool.query(
              `SELECT * FROM ${table} WHERE ${col} ILIKE $1 LIMIT 5`,
              [`%${fullName}%`]
            );
            if (result.rows.length > 0) {
              dbContext[table] = result.rows;
            }
          } catch {
            // Table may not exist or column may differ, skip
          }
        }
      }
    }

    const result = await aiService.generateTimeline(query, dbContext);
    await saveAIResult('timeline', query, result);
    res.json({ feature: 'timeline', query, result, db_context: dbContext });
  } catch (err) {
    console.error('AI timeline error:', err.message);
    res.status(500).json({ error: err.message || 'AI processing error' });
  }
});

// POST /api/ai/conflict-resolution — reconcile conflicting genealogical records
router.post('/conflict-resolution', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'conflict-resolution', aiService.resolveConflict)
);

// POST /api/ai/research-roadmap — next-best research steps for a person
router.post('/research-roadmap', authenticateToken, aiRateLimiter, (req, res) =>
  handleAIRequest(req, res, 'research-roadmap', aiService.generateRoadmap)
);

module.exports = router;
