// Custom Views endpoints for AIGenealogyResearcher
// Exposes 4 endpoints used by the Genealogy Views section:
//   GET  /api/custom-views/family-tree           VIZ
//   GET  /api/custom-views/source-coverage       VIZ
//   GET  /api/custom-views/research-report       NON-VIZ (PDF)
//   GET  /api/custom-views/citation-rules        NON-VIZ (config)
//   POST /api/custom-views/citation-rules        NON-VIZ (CRUD edit)
const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// --- In-memory citation rules store (sub-resource for source/citation rule editor) ---
const defaultRules = [
  { id: 1, source_type: 'census', label: 'Census Record', confidence_weight: 0.85, citation_template: '{author}. "{title}", {publication}, {date_published}.', required_fields: ['title', 'date_published', 'repository'] },
  { id: 2, source_type: 'vital', label: 'Vital Record (Birth/Death/Marriage)', confidence_weight: 0.95, citation_template: '{repository}, {title} ({date_published}).', required_fields: ['title', 'repository', 'date_published'] },
  { id: 3, source_type: 'church', label: 'Church Record', confidence_weight: 0.80, citation_template: '{publication}, {title}, {date_published}.', required_fields: ['title', 'publication'] },
  { id: 4, source_type: 'dna', label: 'DNA Match', confidence_weight: 0.70, citation_template: '{publication} DNA Match ({date_published}).', required_fields: ['publication'] },
  { id: 5, source_type: 'newspaper', label: 'Newspaper Article', confidence_weight: 0.60, citation_template: '"{title}", {publication}, {date_published}, {url}.', required_fields: ['title', 'publication'] },
  { id: 6, source_type: 'immigration', label: 'Immigration/Naturalization', confidence_weight: 0.90, citation_template: '{author}. {title}, {repository}, {date_published}.', required_fields: ['title', 'repository'] },
  { id: 7, source_type: 'military', label: 'Military Record', confidence_weight: 0.88, citation_template: '{author}. {title}, {repository}, {date_published}.', required_fields: ['title', 'repository'] },
  { id: 8, source_type: 'land', label: 'Land/Deed Record', confidence_weight: 0.82, citation_template: '{title}, {publication}, {date_published}.', required_fields: ['title', 'date_published'] },
  { id: 9, source_type: 'oral', label: 'Oral Family History', confidence_weight: 0.40, citation_template: '{author}, oral history, {date_published}.', required_fields: ['author'] },
];
let citationRules = JSON.parse(JSON.stringify(defaultRules));
let nextRuleId = 100;

// Common queries with graceful fallbacks (table may be empty for new accounts)
async function safeQuery(text, params = []) {
  try {
    const r = await pool.query(text, params);
    return r.rows || [];
  } catch (e) {
    return [];
  }
}

// ====================================================================
// GET /api/custom-views/family-tree  — VIZ
// Returns an SVG-ready family tree layout: nodes positioned per generation,
// edges connecting parents -> children using person_relationships table.
// ====================================================================
router.get('/family-tree', async (req, res) => {
  try {
    const persons = await safeQuery(
      `SELECT id, first_name, last_name, birth_date, death_date, gender
       FROM persons ORDER BY id ASC LIMIT 60`
    );

    const rels = await safeQuery(
      `SELECT person1_id, person2_id, relationship_type
       FROM person_relationships LIMIT 400`
    );

    const personMap = new Map(persons.map((p) => [p.id, { ...p, gen: null }]));

    // Build parent -> child edges from relationship types like parent/child/father/mother
    const parentEdges = [];
    rels.forEach((r) => {
      const t = (r.relationship_type || '').toLowerCase();
      if (t.includes('parent') || t.includes('father') || t.includes('mother')) {
        parentEdges.push({ parent: r.person1_id, child: r.person2_id });
      } else if (t.includes('child') || t.includes('son') || t.includes('daughter')) {
        parentEdges.push({ parent: r.person2_id, child: r.person1_id });
      }
    });

    // Determine generations via BFS from roots (persons with no incoming parent edge)
    const incoming = new Map();
    parentEdges.forEach((e) => {
      if (!incoming.has(e.child)) incoming.set(e.child, []);
      incoming.get(e.child).push(e.parent);
    });

    const roots = persons.filter((p) => !incoming.has(p.id)).map((p) => p.id);
    const queue = roots.map((id) => ({ id, gen: 0 }));
    const seen = new Set();
    while (queue.length) {
      const { id, gen } = queue.shift();
      if (seen.has(id)) continue;
      seen.add(id);
      const node = personMap.get(id);
      if (node) node.gen = gen;
      parentEdges.filter((e) => e.parent === id).forEach((e) => {
        queue.push({ id: e.child, gen: gen + 1 });
      });
    }

    // Persons that didn't get assigned (no edges at all) — distribute into gen 0
    persons.forEach((p, idx) => {
      const n = personMap.get(p.id);
      if (n.gen === null) n.gen = Math.floor(idx / 6);
    });

    // Layout: x per generation, y per index in generation
    const W = 220;
    const H = 110;
    const PAD = 60;
    const byGen = new Map();
    Array.from(personMap.values()).forEach((p) => {
      if (!byGen.has(p.gen)) byGen.set(p.gen, []);
      byGen.get(p.gen).push(p);
    });

    const nodes = [];
    const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b);
    sortedGens.forEach((g) => {
      const col = byGen.get(g);
      col.forEach((p, i) => {
        nodes.push({
          id: p.id,
          generation: g,
          x: PAD + g * W,
          y: PAD + i * H,
          label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || `Person ${p.id}`,
          subtitle: [p.birth_date, p.death_date].filter(Boolean).join(' – '),
          gender: (p.gender || '').toLowerCase(),
        });
      });
    });

    const idToNode = new Map(nodes.map((n) => [n.id, n]));
    const edges = parentEdges
      .filter((e) => idToNode.has(e.parent) && idToNode.has(e.child))
      .map((e) => ({
        from: e.parent,
        to: e.child,
        x1: idToNode.get(e.parent).x + 160,
        y1: idToNode.get(e.parent).y + 30,
        x2: idToNode.get(e.child).x,
        y2: idToNode.get(e.child).y + 30,
      }));

    const width = PAD * 2 + (sortedGens.length || 1) * W;
    const height = PAD * 2 + Math.max(1, ...Array.from(byGen.values()).map((c) => c.length)) * H;

    res.json({
      success: true,
      generations: sortedGens.length,
      total_persons: nodes.length,
      total_edges: edges.length,
      width,
      height,
      nodes,
      edges,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ====================================================================
// GET /api/custom-views/source-coverage  — VIZ
// Heatmap: rows = ancestors (persons), cols = source types,
// cells = count of related records found for that ancestor in that source.
// ====================================================================
router.get('/source-coverage', async (req, res) => {
  try {
    const persons = await safeQuery(
      `SELECT id, first_name, last_name FROM persons ORDER BY id ASC LIMIT 20`
    );

    const sourceTables = [
      { key: 'census', table: 'census_records', name_col: 'head_of_household' },
      { key: 'birth_death', table: 'birth_death_records', name_col: 'person_name' },
      { key: 'marriage', table: 'marriage_records', name_col: 'spouse1_name' },
      { key: 'immigration', table: 'immigration_records', name_col: 'immigrant_name' },
      { key: 'military', table: 'military_records', name_col: 'service_member' },
      { key: 'church', table: 'church_records', name_col: 'person_name' },
      { key: 'newspaper', table: 'newspaper_archives', name_col: 'title' },
      { key: 'land', table: 'land_records', name_col: 'owner_name' },
      { key: 'dna', table: 'dna_matches', name_col: 'match_name' },
    ];

    const rows = [];
    let maxVal = 0;

    for (const p of persons) {
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
      const cells = [];
      for (const s of sourceTables) {
        let count = 0;
        try {
          const r = await pool.query(
            `SELECT COUNT(*)::int AS c FROM ${s.table} WHERE LOWER(${s.name_col}) LIKE LOWER($1)`,
            [`%${fullName}%`]
          );
          count = (r.rows[0] && r.rows[0].c) || 0;
        } catch (_) { count = 0; }
        if (count > maxVal) maxVal = count;
        cells.push({ source_type: s.key, count });
      }
      rows.push({
        person_id: p.id,
        person_name: fullName || `Person ${p.id}`,
        cells,
        total: cells.reduce((a, b) => a + b.count, 0),
      });
    }

    res.json({
      success: true,
      sources: sourceTables.map((s) => ({ key: s.key, label: s.key.replace('_', ' ') })),
      ancestors: rows,
      max_value: Math.max(1, maxVal),
      total_ancestors: rows.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ====================================================================
// GET /api/custom-views/research-report  — NON-VIZ (PDF)
// Generates a printable research report (PDF-like text format).
// ====================================================================
router.get('/research-report', async (req, res) => {
  try {
    const persons = await safeQuery(`SELECT COUNT(*)::int AS c FROM persons`);
    const records = await safeQuery(`SELECT COUNT(*)::int AS c FROM historical_records`);
    const dna = await safeQuery(`SELECT COUNT(*)::int AS c FROM dna_matches`);
    const census = await safeQuery(`SELECT COUNT(*)::int AS c FROM census_records`);
    const marriage = await safeQuery(`SELECT COUNT(*)::int AS c FROM marriage_records`);
    const recentPersons = await safeQuery(
      `SELECT first_name, last_name, birth_place FROM persons ORDER BY id DESC LIMIT 5`
    );
    const recentRecords = await safeQuery(
      `SELECT title, record_type, date FROM historical_records ORDER BY id DESC LIMIT 5`
    );

    const personCount = (persons[0] && persons[0].c) || 0;
    const recordCount = (records[0] && records[0].c) || 0;
    const dnaCount = (dna[0] && dna[0].c) || 0;
    const censusCount = (census[0] && census[0].c) || 0;
    const marriageCount = (marriage[0] && marriage[0].c) || 0;

    const today = new Date().toISOString().split('T')[0];

    // Minimal PDF-ish text. Real PDF generation can be added with pdfkit later;
    // for now we emit a plain-text "report" that the UI streams as a download.
    const lines = [];
    lines.push('============================================================');
    lines.push('  GENEALOGY RESEARCH REPORT');
    lines.push(`  Generated: ${today}`);
    lines.push(`  Researcher: ${(req.user && req.user.email) || 'researcher'}`);
    lines.push('============================================================');
    lines.push('');
    lines.push('EXECUTIVE SUMMARY');
    lines.push('------------------------------------------------------------');
    lines.push(`Persons tracked:        ${personCount}`);
    lines.push(`Historical records:     ${recordCount}`);
    lines.push(`DNA matches:            ${dnaCount}`);
    lines.push(`Census records:         ${censusCount}`);
    lines.push(`Marriage records:       ${marriageCount}`);
    lines.push('');
    lines.push('RECENT PERSONS');
    lines.push('------------------------------------------------------------');
    if (recentPersons.length === 0) {
      lines.push('  (no person records found)');
    } else {
      recentPersons.forEach((p, i) => {
        lines.push(`  ${i + 1}. ${p.first_name || ''} ${p.last_name || ''} — ${p.birth_place || 'unknown'}`);
      });
    }
    lines.push('');
    lines.push('RECENT HISTORICAL RECORDS');
    lines.push('------------------------------------------------------------');
    if (recentRecords.length === 0) {
      lines.push('  (no historical records found)');
    } else {
      recentRecords.forEach((r, i) => {
        lines.push(`  ${i + 1}. [${r.record_type || '—'}] ${r.title || ''} (${r.date || 'undated'})`);
      });
    }
    lines.push('');
    lines.push('SOURCE/CITATION RULES IN EFFECT');
    lines.push('------------------------------------------------------------');
    citationRules.forEach((c) => {
      lines.push(`  ${c.source_type.padEnd(12)}  weight=${c.confidence_weight}  ${c.label}`);
    });
    lines.push('');
    lines.push('============================================================');
    lines.push('  End of report');
    lines.push('============================================================');

    res.json({
      success: true,
      report_date: today,
      filename: `genealogy-report-${today}.txt`,
      sections: 4,
      summary: {
        persons: personCount,
        records: recordCount,
        dna_matches: dnaCount,
        census: censusCount,
        marriages: marriageCount,
      },
      content: lines.join('\n'),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ====================================================================
// GET/POST /api/custom-views/citation-rules — NON-VIZ
// CRUD over source-type / citation-rule configuration.
// POST body: { action: 'create'|'update'|'delete'|'reset', rule?, id? }
// ====================================================================
router.get('/citation-rules', (req, res) => {
  res.json({ success: true, rules: citationRules, count: citationRules.length });
});

router.post('/citation-rules', (req, res) => {
  try {
    const body = req.body || {};
    const action = body.action || 'create';

    if (action === 'reset') {
      citationRules = JSON.parse(JSON.stringify(defaultRules));
      return res.json({ success: true, action, rules: citationRules });
    }

    if (action === 'create') {
      const rule = body.rule || {};
      const newRule = {
        id: nextRuleId++,
        source_type: rule.source_type || 'custom',
        label: rule.label || 'Custom Source',
        confidence_weight: Number(rule.confidence_weight) || 0.5,
        citation_template: rule.citation_template || '{title}, {publication}, {date_published}.',
        required_fields: Array.isArray(rule.required_fields) ? rule.required_fields : ['title'],
      };
      citationRules.push(newRule);
      return res.json({ success: true, action, rule: newRule });
    }

    if (action === 'update') {
      const id = Number(body.id);
      const idx = citationRules.findIndex((r) => r.id === id);
      if (idx === -1) return res.status(404).json({ error: 'rule not found' });
      citationRules[idx] = { ...citationRules[idx], ...(body.rule || {}), id };
      return res.json({ success: true, action, rule: citationRules[idx] });
    }

    if (action === 'delete') {
      const id = Number(body.id);
      const before = citationRules.length;
      citationRules = citationRules.filter((r) => r.id !== id);
      return res.json({ success: true, action, deleted: before - citationRules.length });
    }

    res.status(400).json({ error: 'unknown action' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
