# Apply Pass 5 — AIGenealogyResearcher
Date: 2026-05-08
Stack: Node-Express + React (CRA), Postgres `pg`.

## Verified present
- 14 original AI endpoints (historical-records, dna-analysis, census-search, immigration-analysis, birth-death, marriage, military, newspaper, land, church, ship-manifest, ethnicity-estimation, name-origin, timeline).
- Pass-2 additions: `/conflict-resolution`, `/research-roadmap` (16 AI endpoints total).
- 4 backend routes (auth, ai, crud, relationships) + 16 generic CRUD tables auto-mounted via `tableConfigs`.

## Implemented this pass (2 mechanical features, 11 endpoints; additive only)
1. **Document upload metadata registry** — closes mechanical backlog "Document upload & storage".
   - `backend/routes/documentRegistry.js` (~95 lines): metadata-only registry; URL-based (presigned-URL strategy compatible). Allowed `doc_type` enumeration matches existing genealogy taxonomy.
   - Endpoints: `GET/POST/PUT/DELETE /api/document-registry`, `GET /api/document-registry/types`.
   - File-byte storage left as NEEDS-DEPS (multer) and NEEDS-CREDS (S3/GCS).
2. **Subscription plan + usage tracking** — closes mechanical backlog "Subscription / payment management".
   - `backend/routes/subscriptions.js` (~110 lines): plan registry (free/hobbyist/pro/enterprise), per-user state, monthly usage counters, exceeded-flag check. Stripe webhook stubbed with explicit `503` + required-env documentation.
   - Endpoints: `GET /plans`, `GET/PUT /me`, `POST /usage/track`, `GET /usage/me`, `POST /stripe-webhook-stub`.
3. **Frontend** — `frontend/src/pages/DocumentsAndPlanPage.js` registered at `/documents-and-plan` in `frontend/src/App.js`. Uses existing `services/api.js` (axios + JWT interceptor).
4. Wired both routers in `backend/server.js` immediately after the `tableConfigs` for-loop.

## Deferred
- **Real Stripe integration** — NEEDS-CREDS (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- **Multipart file upload (multer + object store)** — NEEDS-DEPS (no `npm install` allowed) + NEEDS-CREDS.
- **Family-tree visualization (FE viz)** — OUT-OF-SCOPE (D3/Cytoscape requires new deps; existing `RelationshipGraph.js` page uses simple list).
- **Ancestry / FamilySearch / FindMyPast integrations** — NEEDS-CREDS.
- **Document OCR for handwritten records** — NEEDS-CREDS (Vision API quota).
- **Multi-researcher collaboration, expert genealogist marketplace** — NEEDS-PRODUCT-DECISION.
- **Agentic researcher / multi-evidence fusion / international records** — NEEDS-PRODUCT-DECISION.

## Smoke test
- `node -c` on `documentRegistry.js`, `subscriptions.js`, `server.js` — PASS.
- Did not boot (Postgres). DDL idempotent.
