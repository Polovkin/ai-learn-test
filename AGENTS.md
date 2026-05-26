# AGENTS.md

## Purpose
This is a learning monorepo for LLM, JS/TS, SQL, and Node.js.
Primary goal: keep learning artifacts structured and easy to evolve.

## Structure
- `apps/` long-form learning apps (multi-module, frontend/backend integration)
- `labs/` focused experiments and visual demos
- `packages/` shared code used by 2+ places
- `knowledge-base/` markdown notes, terms, maps, journal
- `docs/` shared process/reference docs
- `tools/` helper scripts
- `inbox/` temporary unsorted files

## Placement Rules
1. Concept demo or isolated runnable code -> `labs/`
2. Product-like multi-page/module work -> `apps/`
3. Reused code (2+ consumers) -> `packages/`
4. Markdown knowledge content -> `knowledge-base/`
5. Fast unstructured capture -> `inbox/`

## Naming
- Labs: `labs/<topic>/<YYYY-MM-DD>-<slug>`
- Notes: `knowledge-base/notes/<topic>/<slug>.md`
- Terms: `knowledge-base/terms/<term>.md`
- Maps: `knowledge-base/maps/<topic>.md`
- Journal: `knowledge-base/journal/YYYY-MM-DD-<slug>.md`

## Inbox Triage (Mandatory)
When asked to organize `inbox/`, agent must:
1. Scan all files recursively.
2. Move markdown notes/terms/journal entries to `knowledge-base`.
3. Move runnable code to `labs`.
4. Move reusable code to `packages`.
5. Move process docs/templates to `docs`.
6. Keep ambiguous files in `inbox/pending/` with short reason.
7. Update relevant map files in `knowledge-base/maps/`.
8. Report exact move summary (`from -> to`) and unresolved files.

## Minimum Quality Rules
- New lab should include `README.md` with `Goal`, `Run`, `Result`, `What I Learned`, `Next`.
- New note/term should link to related materials via topic maps.
- Do not change business behavior during structural refactors unless requested.
- Do not modify unrelated files.

## Validation
Run from repo root when relevant:
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run test`
