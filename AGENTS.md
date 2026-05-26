# AGENTS Rules for This Learning Monorepo

## Goal
Keep the repository structured, educational, and easy to extend across LLM, JS/TS, SQL, and Node.js topics.

## Repository Contract
- `apps/*`: long-form product-style learning apps (frontend/backend/fullstack).
- `labs/*`: isolated experiments and visualizations for one concept.
- `packages/*`: shared utilities, types, prompt assets.
- `knowledge-base/*`: notes, terms, topic maps, and learning journal.
- `docs/*`: process docs and templates.

## Where New Work Goes
- Put code in `labs` when scope is one focused concept and can run independently.
- Put code in `apps` when the topic needs multiple pages/modules, or frontend+backend integration.
- Put reusable logic in `packages` only after it is used in 2+ places.

## Naming Rules
- Labs: `labs/<topic>/<YYYY-MM-DD>-<slug>`.
- Notes: `knowledge-base/notes/<topic>/<slug>.md`.
- Terms: `knowledge-base/terms/<term>.md`.
- Topic maps: `knowledge-base/maps/<topic>.md`.

## Required Checklist for Every New Lab
- [ ] Create `README.md` using `docs/templates/lab-readme-template.md`.
- [ ] Include: `goal`, `run`, `result`, `next`.
- [ ] Keep dependencies local to that lab unless truly shared.
- [ ] Add at least one "What I learned" bullet in the README.
- [ ] Link the lab from a relevant map in `knowledge-base/maps`.

## Required Checklist for Every New Note/Term
- [ ] Use the template from `docs/templates`.
- [ ] Keep one main idea per note.
- [ ] Add links to related notes/labs/apps.
- [ ] Update at least one topic map.

## Safety Rules for Agents
- Prefer non-destructive operations.
- Do not rewrite unrelated files.
- Keep business logic unchanged during structural refactors unless explicitly requested.
- After moves/refactors run: `npm run typecheck`, `npm run build`, `npm run lint`.
