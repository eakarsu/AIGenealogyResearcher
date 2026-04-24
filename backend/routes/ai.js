const express = require('express');
const { pool } = require('../db');
const aiService = require('../services/ai');

const router = express.Router();

async function handleAIRequest(req, res, feature, aiFunction) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await aiFunction(query);

    // Save to ai_results table
    await pool.query(
      'INSERT INTO ai_results (feature, query, result) VALUES ($1, $2, $3)',
      [feature, typeof query === 'string' ? query : JSON.stringify(query), result]
    );

    res.json({ feature, query, result });
  } catch (err) {
    console.error(`AI ${feature} error:`, err.message);
    res.status(500).json({ error: err.message || 'AI processing error' });
  }
}

// POST /api/ai/historical-records
router.post('/historical-records', (req, res) =>
  handleAIRequest(req, res, 'historical-records', aiService.analyzeHistoricalRecord)
);

// POST /api/ai/dna-analysis
router.post('/dna-analysis', (req, res) =>
  handleAIRequest(req, res, 'dna-analysis', aiService.analyzeDNAMatch)
);

// POST /api/ai/census-search
router.post('/census-search', (req, res) =>
  handleAIRequest(req, res, 'census-search', aiService.searchCensusRecords)
);

// POST /api/ai/immigration-analysis
router.post('/immigration-analysis', (req, res) =>
  handleAIRequest(req, res, 'immigration-analysis', aiService.analyzeImmigrationRecord)
);

// POST /api/ai/birth-death-analysis
router.post('/birth-death-analysis', (req, res) =>
  handleAIRequest(req, res, 'birth-death-analysis', aiService.analyzeBirthDeathRecord)
);

// POST /api/ai/marriage-analysis
router.post('/marriage-analysis', (req, res) =>
  handleAIRequest(req, res, 'marriage-analysis', aiService.analyzeMarriageRecord)
);

// POST /api/ai/military-analysis
router.post('/military-analysis', (req, res) =>
  handleAIRequest(req, res, 'military-analysis', aiService.analyzeMilitaryRecord)
);

// POST /api/ai/newspaper-search
router.post('/newspaper-search', (req, res) =>
  handleAIRequest(req, res, 'newspaper-search', aiService.searchNewspaperArchive)
);

// POST /api/ai/land-analysis
router.post('/land-analysis', (req, res) =>
  handleAIRequest(req, res, 'land-analysis', aiService.analyzeLandRecord)
);

// POST /api/ai/church-analysis
router.post('/church-analysis', (req, res) =>
  handleAIRequest(req, res, 'church-analysis', aiService.analyzeChurchRecord)
);

// POST /api/ai/ship-manifest-analysis
router.post('/ship-manifest-analysis', (req, res) =>
  handleAIRequest(req, res, 'ship-manifest-analysis', aiService.analyzeShipManifest)
);

// POST /api/ai/ethnicity-estimation
router.post('/ethnicity-estimation', (req, res) =>
  handleAIRequest(req, res, 'ethnicity-estimation', aiService.estimateEthnicity)
);

// POST /api/ai/name-origin
router.post('/name-origin', (req, res) =>
  handleAIRequest(req, res, 'name-origin', aiService.analyzeNameOrigin)
);

// POST /api/ai/timeline
router.post('/timeline', (req, res) =>
  handleAIRequest(req, res, 'timeline', aiService.generateTimeline)
);

module.exports = router;
