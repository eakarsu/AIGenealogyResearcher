'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

test('domain workflow accepts a reviewable, grounded case', () => {
  const evaluation = evaluate({
  question: { text: 'Who were the parents of subject P1?' },
  persons: [{ id: 'p1', living: false }, { id: 'p2', living: false }],
  records: [{ id: 'r1', sourceTitle: 'Register', sourceUrl: 'archive:1',
    accessedAt: '2026-01-01', rightsBasis: 'public-domain' }],
  relationships: [{ from: 'p1', to: 'p2', recordIds: ['r1'] }],
  hypotheses: [{ id: 'h1', recordIds: ['r1'] }], conflicts: []
});
  assert.deepEqual(evaluation.errors, []);
  assert.equal(evaluation.result.decision, 'reviewable');
  assert.ok(Array.isArray(evaluation.assumptions));
  assert.equal(typeof evaluation.uncertainty, 'object');
});

test('domain workflow fails closed on unsafe or incomplete input', () => {
  const evaluation = evaluate({ question: {}, persons: [{ id: 'p1', living: true, publicExport: true }], records: [], relationships: [] });
  assert.ok(evaluation.errors.length > 0);
  assert.notEqual(evaluation.result.decision, 'reviewable');
});
