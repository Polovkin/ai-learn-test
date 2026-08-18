# AGENTS.md

## Purpose
This is a learning repository for LLM, browser UI, JS/TS, SQL, and Node.js.
Keep runnable artifacts inside `learning-hub/` and non-application materials inside `other/`.

## Structure
- `learning-hub/web/` is the only browser application; every visual project or lab is a React page.
- `learning-hub/node/` contains independent Node.js servers, MCP experiments, CLIs, and runtime playgrounds.
- `other/sql/` contains SQL and database-support files.
- `other/docs/` contains non-Markdown reference artifacts.

## Package Boundaries
- Do not create a root npm workspace or root `node_modules`.
- Web dependencies, `package.json`, `package-lock.json`, and `node_modules` belong to `learning-hub/web/`.
- Each project under `learning-hub/node/` owns its `package.json`, `package-lock.json`, and `node_modules`.
- Run npm commands from the package being changed or use `npm --prefix <package-path> ...`.

## Placement Rules
1. Browser, React, Vue, or static HTML demo -> a route under `learning-hub/web/src/pages/`.
2. Node.js server, CLI, or runtime experiment -> a package under `learning-hub/node/`.
3. SQL, PDFs, Docker-only support, or other non-application material -> the matching directory under `other/`.
4. Shared browser code -> `learning-hub/web/src/components/` or `src/services/` after a second consumer exists.
5. Do not create README or standalone prompt-document files.

## Web Rules
- Keep one Vite/React entrypoint and register every page in `learning-hub/web/src/App.tsx`.
- Preserve page-specific behavior during framework conversions.
- Scope page styles with a page-level class to avoid cross-page CSS collisions.
- Keep API URLs behind Vite proxies or environment variables.

## Validation
Run checks inside every affected package. For the web application:
- `npm --prefix learning-hub/web run typecheck`
- `npm --prefix learning-hub/web run build`
- `npm --prefix learning-hub/web run lint`

For an affected Node package, use the same pattern with its directory and available scripts.
