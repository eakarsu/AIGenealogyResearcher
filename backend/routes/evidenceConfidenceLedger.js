const express = require('express');

const router = express.Router();

function ledger(input = {}) {
  const citations = input.citations || [
    { title: '1900 census household', source_type: 'census', conflict: false, directness: 'direct', informant: 'enumerator' },
    { title: 'Family bible birth note', source_type: 'family_record', conflict: true, directness: 'indirect', informant: 'unknown' },
    { title: 'County marriage certificate', source_type: 'vital_record', conflict: false, directness: 'direct', informant: 'official' },
  ];
  return {
    entries: citations.map((c) => {
      const score = (c.source_type === 'vital_record' ? 35 : c.source_type === 'census' ? 24 : 16) + (c.directness === 'direct' ? 30 : 15) + (c.conflict ? -20 : 15);
      return { ...c, confidence_score: Math.max(0, Math.min(100, score)), status: score >= 70 ? 'strong' : score >= 45 ? 'corroborate' : 'weak' };
    }),
  };
}

router.get('/', (req, res) => res.json(ledger()));
router.post('/score', (req, res) => res.json(ledger(req.body || {})));

module.exports = router;
