# Completeness Review: AIGenealogyResearcher

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad genealogy research surface (63 source files and 19 route modules), but static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path to manage research questions, persons/relationships, sourced records, hypotheses, conflicts, citations, and exportable family trees/reports.

## Why it is not complete

- 18 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `ai`, `conflict resolution`, `crud`, `custom views`; these surfaces show breadth but not durable execution against authoritative systems.
- 10 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 26 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- No recognizable application test files were found in the inspected tree.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to manage research questions, persons/relationships, sourced records, hypotheses, conflicts, citations, and exportable family trees/reports.
- 2. Connect archival/records sources, OCR, maps, tree formats, document storage, and collaboration; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Validate entity/date/place resolution, relationship consistency, citation completeness, conflicting evidence, and export fidelity.
- 4. Respect source terms and living-person privacy, preserve provenance, show uncertainty, and require researcher judgment.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- Credential/secret fallback or demo-password patterns occur in 3 files and must be removed or made development-only.
- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `backend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `frontend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `backend/server.js` — service composition, middleware, and registered routes.
- `frontend/src/index.js` — service composition, middleware, and registered routes.
- `backend/routes/ai.js` — implemented API surface and domain/AI request handling.
- `backend/routes/auth.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: use ai and conflict resolution to select one narrow genealogy research outcome, quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

1. Implemented a durable workflow for research questions, persons, sourced records, evidence-backed relationships/hypotheses, unresolved conflicts, citations, independent review and a GEDCOM-compatible JSON export summary.
2. Added allow-listed archive/records, OCR, map, GEDCOM, document-storage and collaboration outbox boundaries with idempotency, retry/dead-letter state and connector checkpoints. No licensed archive, OCR service, map source, storage account or collaboration provider is claimed.
3. Added deterministic person/date consistency, relationship reference, citation completeness, conflict and export-count checks; OCR, place/entity resolution and export interoperability validation remain explicit blockers.
4. Added living-person privacy/public-export rejection, source rights/provenance, uncertainty, tenant/RBAC isolation, independent judgment, secret rejection, append-only audits and evidence-gated erasure.
5. Added dependency-free domain/contract/authorization/integration-failure/migration/lifecycle tests in CI, migration/config artifacts, quarantined destructive demo seeds, a non-destructive launcher and documented source/professional-review boundaries.
