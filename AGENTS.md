# AGENTS.md

## Purpose
This is a learning monorepo for LLM, browser UI, JS/TS, SQL, and Node.js.
Keep runnable artifacts grouped by runtime and keep all browser demos inside one React application.

## Structure
- `web/learning-hub/` is the only browser application; every visual project or lab is a React page.
- `node/` contains Node.js servers, MCP experiments, CLIs, and runtime playgrounds.
- `other/knowledge-base/` contains notes, terms, maps, and journal entries.
- `other/sql/` contains SQL and database-support files.
- `other/docs/` contains non-Markdown reference artifacts.
- `other/inbox/` contains temporary unsorted learning material.

## Placement Rules
1. Browser, React, Vue, or static HTML demo -> a route under `web/learning-hub/src/pages/`.
2. Node.js server, CLI, or runtime experiment -> `node/`.
3. Notes, SQL, PDFs, Docker-only support, or other material -> the matching directory under `other/`.
4. Shared browser code -> `web/learning-hub/src/components/` or `src/services/` after a second consumer exists.
5. Do not create README or standalone prompt-document files.

## Web Rules
- Keep one Vite/React entrypoint and register every page in `web/learning-hub/src/App.tsx`.
- Preserve page-specific behavior during framework conversions.
- Scope page styles with a page-level class to avoid cross-page CSS collisions.
- Keep API URLs behind Vite proxies or environment variables.

## Inbox Triage
When organizing `other/inbox/`, scan it recursively and move each item to the appropriate `web/`, `node/`, or `other/` destination. Update topic maps under `other/knowledge-base/maps/` and report unresolved files.

## Validation
Run from the repository root when relevant:
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run test`
