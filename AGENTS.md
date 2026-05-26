# AGENTS.md

## Purpose
This repository is a structured learning monorepo for:
- LLM and RAG experiments
- JavaScript/TypeScript practice
- SQL practice
- Node.js backend development
- Visual interactive learning demos

The primary goals are clarity, repeatability, and clean growth of learning artifacts.

## Top-Level Structure Contract
- `apps/` production-style learning applications (long-running, multi-module)
- `labs/` focused experiments and visualizations (short-cycle learning)
- `packages/` shared assets used by 2+ places (types/utils/prompts)
- `knowledge-base/` notes, terms, maps, and learning journal
- `docs/` process and documentation assets/templates
- `tools/` helper scripts for repo maintenance and automation

## Placement Rules
1. Put work in `labs/` when it explores one concept and is independently runnable.
2. Put work in `apps/` when it spans pages/modules or backend+frontend integration.
3. Move reusable logic to `packages/` only after repeated use across at least 2 locations.
4. Put markdown knowledge artifacts in `knowledge-base/`, not in `labs/`.

## Naming Conventions
- Labs: `labs/<topic>/<YYYY-MM-DD>-<slug>` (new labs)
- Notes: `knowledge-base/notes/<topic>/<slug>.md`
- Terms: `knowledge-base/terms/<term>.md`
- Topic maps: `knowledge-base/maps/<topic>.md`

## Rules for Notes vs Code
- `knowledge-base/` should contain `.md` knowledge files.
- `labs/` and `apps/` should contain runnable code and project assets.
- If a folder contains mixed materials, move markdown notes to `knowledge-base` and leave code in place.

## Required Checklist for New Lab
- Include `README.md` with: `Goal`, `Run`, `Result`, `What I Learned`, `Next`.
- Keep setup minimal and runnable from the lab folder.
- Link the lab from at least one map in `knowledge-base/maps/`.

## Required Checklist for New Note/Term
- One file = one core idea.
- Include links to related labs/apps/terms.
- Update related topic map(s).

## Change Safety
- Do not perform destructive git/file operations unless explicitly requested.
- Do not modify unrelated files.
- Preserve existing behavior during structural refactors.

## Validation Commands (from repo root)
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run test`

If any command fails, document what failed and why.
