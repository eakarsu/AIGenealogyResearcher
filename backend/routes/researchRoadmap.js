// Agentic researcher autonomy conducting guided research and auto-generating
// report summaries.
// Audit: batch_04.md / AIGenealogyResearcher / Custom Feature Suggestions #1
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

// POST /api/research-roadmap/plan
// Body: { subject_name, known_facts, research_goal, depth?: 'shallow'|'medium'|'deep' }
router.post('/plan', async (req, res) => {
  try {
    const { subject_name, known_facts = {}, research_goal, depth = 'medium' } = req.body || {};
    if (!subject_name || !research_goal) {
      return res.status(400).json({ error: 'subject_name and research_goal required' });
    }

    let documents = { rows: [] };
    try {
      documents = await pool.query(
        `SELECT id, title, document_type, year FROM documents WHERE user_id = $1 LIMIT 20`,
        [req.user.id]
      );
    } catch (_) {}

    const systemPrompt = `You are an autonomous genealogy research agent. Build a step-by-step research roadmap
to achieve the user's goal. Each step should produce verifiable evidence. Order by efficiency (cost, time,
likelihood of payoff). Return STRICT JSON only.`;

    const userPrompt = `Subject: ${subject_name}
Known facts: ${JSON.stringify(known_facts)}
Research goal: ${research_goal}
Depth: ${depth}
Already-collected documents: ${JSON.stringify(documents.rows)}

Return JSON:
{
  "summary": "...",
  "roadmap": [
    {
      "step": 1,
      "objective": "string",
      "method": "archive_search|dna_match_analysis|interview|onsite_visit|newspaper_search|land_records",
      "archive_hint": "string",
      "estimated_time_hours": 0,
      "estimated_cost_usd": 0,
      "expected_evidence": "string",
      "success_signal": "string",
      "fallback_if_no_result": "string"
    }
  ],
  "stop_conditions": ["..."],
  "summary_report_template": {
    "title": "string",
    "sections": ["overview", "findings", "evidence_table", "open_questions", "next_steps"]
  },
  "disclaimer": "Roadmap is a starting plan; adapt as new evidence emerges."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS research_roadmaps (
        id SERIAL PRIMARY KEY, user_id INTEGER, subject_name TEXT, goal TEXT,
        payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await pool.query(
        `INSERT INTO research_roadmaps (user_id, subject_name, goal, payload) VALUES ($1,$2,$3,$4)`,
        [req.user?.id || null, subject_name, research_goal, JSON.stringify(parsed)]
      );
    } catch (_) {}

    res.json({ subject_name, goal: research_goal, roadmap: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/research-roadmap/my
router.get('/my', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, subject_name, goal, payload, created_at FROM research_roadmaps
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
