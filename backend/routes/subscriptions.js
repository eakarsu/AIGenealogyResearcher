/*
 * routes/subscriptions.js — Subscription / plan-state management.
 *
 * Pass 5 mechanical addition: closes backlog item "Subscription / payment
 * management" at the plan-state level. Actual Stripe integration is
 * NEEDS-CREDS and intentionally not added here (the existing project has no
 * Stripe SDK installed). This endpoint manages plan state, quotas, and the
 * lifecycle a Stripe webhook would later drive.
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const PLANS = {
  free: { ai_calls_month: 50, ocr_pages_month: 10, label: 'Free' },
  hobbyist: { ai_calls_month: 500, ocr_pages_month: 100, label: 'Hobbyist ($9/mo)' },
  pro: { ai_calls_month: 2500, ocr_pages_month: 500, label: 'Pro ($29/mo)' },
  enterprise: { ai_calls_month: -1, ocr_pages_month: -1, label: 'Enterprise (contact)' },
};

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      user_id INTEGER PRIMARY KEY,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS subscription_usage (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      counter TEXT NOT NULL,
      month_key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      UNIQUE (user_id, counter, month_key)
    );
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });
router.use(authenticateToken);

router.get('/plans', (req, res) => res.json({ plans: PLANS }));

router.get('/me', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM user_subscriptions WHERE user_id=$1`, [req.user.id]);
    if (r.rowCount === 0) {
      return res.json({ user_id: req.user.id, plan: 'free', status: 'active', plan_details: PLANS.free });
    }
    const sub = r.rows[0];
    res.json({ ...sub, plan_details: PLANS[sub.plan] || PLANS.free });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/me', async (req, res) => {
  try {
    const { plan, status = 'active' } = req.body || {};
    if (!plan || !PLANS[plan]) return res.status(400).json({ error: `plan must be one of ${Object.keys(PLANS).join(', ')}` });
    // Stub: in production, verify a Stripe webhook event before mutating plan
    const r = await pool.query(
      `INSERT INTO user_subscriptions (user_id, plan, status) VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET plan=EXCLUDED.plan, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP RETURNING *`,
      [req.user.id, plan, status]
    );
    res.json({ ...r.rows[0], plan_details: PLANS[plan] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Increment a usage counter for the current calendar month
router.post('/usage/track', async (req, res) => {
  try {
    const { counter } = req.body || {};
    if (!counter) return res.status(400).json({ error: 'counter required (e.g., ai_calls_month)' });
    const monthKey = new Date().toISOString().slice(0, 7);
    const r = await pool.query(
      `INSERT INTO subscription_usage (user_id, counter, month_key, count) VALUES ($1,$2,$3,1)
       ON CONFLICT (user_id, counter, month_key) DO UPDATE SET count=subscription_usage.count+1 RETURNING *`,
      [req.user.id, counter, monthKey]
    );
    // Compare against plan
    const sub = await pool.query(`SELECT plan FROM user_subscriptions WHERE user_id=$1`, [req.user.id]);
    const plan = sub.rows[0]?.plan || 'free';
    const limit = PLANS[plan][counter];
    res.json({ ...r.rows[0], plan, limit, exceeded: limit !== -1 && r.rows[0].count > limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/usage/me', async (req, res) => {
  try {
    const monthKey = new Date().toISOString().slice(0, 7);
    const r = await pool.query(`SELECT counter, count FROM subscription_usage WHERE user_id=$1 AND month_key=$2`, [req.user.id, monthKey]);
    res.json({ month: monthKey, usage: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Webhook stub — documented for when Stripe creds are provisioned.
router.post('/stripe-webhook-stub', (req, res) => {
  res.status(503).json({
    error: 'Stripe webhook not configured.',
    required_env: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    notes: 'Once configured, verify req.body via stripe.webhooks.constructEvent and dispatch to PUT /api/subscriptions/me.',
  });
});

module.exports = router;
