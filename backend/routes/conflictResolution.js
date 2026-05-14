// Multi-evidence fusion weighing conflicting records with confidence scoring.
// Audit: batch_04.md / AIGenealogyResearcher / Custom Feature Suggestions #2
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { callAI } = require('../services/ai');
const { pool } = require('../db');

const router = express.Router();
router.use(authenticateToken);

function parseJSON(t) {
  try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {}
  return { notes: t };
}

// POST /api/conflict-resolution/resolve
// Body: { subject_name, conflicting_facts: [{ source, fact, year? }], target_field? }
router.post('/resolve', async (req, res) => {
  try {
    const { subject_name, conflicting_facts = [], target_field } = req.body || {};
    if (!subject_name || conflicting_facts.length === 0) {
      return res.status(400).json({ error: 'subject_name and at least one conflicting_fact required' });
    }

    const systemPrompt = `You are an evidence-evaluation specialist for genealogy research. Given conflicting
records about the same person, weigh source reliability (primary vs derivative, contemporaneous vs later),
known biases, and corroboration. Recommend the best-supported value, with a confidence score and a list of
follow-up records that would resolve the conflict. Return STRICT JSON only.`;

    const userPrompt = `Subject: ${subject_name}
Target field (if any): ${target_field || 'unspecified'}
Conflicting facts: ${JSON.stringify(conflicting_facts)}

Return JSON:
{
  "summary": "...",
  "recommended_value": "string",
  "confidence_pct": 0,
  "ranked_evidence": [
    { "source": "string", "fact": "string", "reliability_descriptor": "primary|derivative|secondary|unreliable", "weight_0_100": 0, "rationale": "string" }
  ],
  "follow_up_records_to_seek": [{ "record_type": "string", "year_range": "string", "archive_hint": "string" }],
  "open_questions": ["..."],
  "disclaimer": "Evidence weighting is judgment-based; verify with original documents."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS conflict_resolutions (
        id SERIAL PRIMARY KEY, user_id INTEGER, subject_name TEXT,
        payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await pool.query(
        `INSERT INTO conflict_resolutions (user_id, subject_name, payload) VALUES ($1,$2,$3)`,
        [req.user?.id || null, subject_name, JSON.stringify(parsed)]
      );
    } catch (_) {}

    res.json({ subject_name, target_field: target_field || null, resolution: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conflict-resolution/history
router.get('/history', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, subject_name, payload, created_at FROM conflict_resolutions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
