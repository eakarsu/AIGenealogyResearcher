# Audit Apply Notes — AIGenealogyResearcher

Audit source: `_AUDIT/reports/batch_04.md` (#12). Verdict: substantive (4 routes, 14 AI endpoints — AI-first product).

## Original recommendations

Missing AI counterparts:
- `/conflict-resolution`
- `/research-roadmap`

## Implementations applied

1. Added `resolveConflict` and `generateRoadmap` functions to `backend/services/ai.js` (matches existing `callAI` pattern, returns STRICT JSON).
2. Added two endpoints to `backend/routes/ai.js`:
   - `POST /api/ai/conflict-resolution` — reconciles contradictory primary records with source reliability + transcription risk.
   - `POST /api/ai/research-roadmap` — next-best 5-10 research steps with payoff/effort scoring + tool suggestions.

Both use existing `handleAIRequest` wrapper. Syntax-checked.

## Backlog (prioritized)

### Mechanical
- Family tree visualization (frontend).
- Document upload & storage.
- Subscription / payment management.

### Needs creds / external
- Ancestry / FamilySearch / FindMyPast integrations.
- Document OCR for handwritten records.

### Needs product decision
- Multi-researcher collaboration (privacy, attribution).
- Expert genealogist marketplace.

### Custom features
- Agentic researcher (autonomous DB scanning + report drafting).
- Multi-evidence fusion with confidence scoring.
- International records expansion (UK, Canada, IE, DE, IT).

## Apply pass 4 (mechanical backlog)

- **Action:** LEFT-AS-IS (no MECHANICAL AI-endpoint items remain)
- **Features added:** none
- **Backlog deferred:** Family-tree visualization (FE-only viz, not a BE+LLM endpoint — outside template), document upload & storage (NEEDS-SCHEMA / file storage infra), subscription / payment management (NEEDS-CREDS — Stripe), Ancestry/FamilySearch/FindMyPast integrations (NEEDS-CREDS), document OCR (NEEDS-CREDS / new heavy deps), multi-researcher collaboration (NEEDS-PRODUCT-DECISION), expert genealogist marketplace (NEEDS-PRODUCT-DECISION), agentic researcher / multi-evidence fusion / international records (NEEDS-PRODUCT-DECISION).
- **Smoke test:** N/A (no code change)
- **Notes:** Pass-2 already added `/conflict-resolution` and `/research-roadmap`. Remaining backlog is non-mechanical or non-AI.

## Apply pass 3 (frontend)

- Action: **LEFT-AS-IS**.
- FE already wires all backend AI endpoints with JWT Bearer auth from `localStorage`:
  - `frontend/src/services/api.js` — axios instance with request interceptor adding `Authorization: Bearer ${localStorage.token}`; 401 redirects, 429 rate-limit decoration.
  - Generic `aiQuery(feature, data)` → `POST /api/ai/${feature}` covers all 16 AI endpoints.
  - `pages/AIAdvancedPage.js` — covers pass-2 additions `conflict-resolution` and `research-roadmap`.
  - `pages/AIOnlyPage.js`, `FeaturePage.js` — cover the other 14 endpoints.
- Routes registered in `App.js` (e.g., `/ai-advanced`, `/ethnicity-estimation`, `/name-origin`, `/timeline-generator`).
- 503-no-key handling surfaced via axios error response.
- Idempotent — no FE files touched.
