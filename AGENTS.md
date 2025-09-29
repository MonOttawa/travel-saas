# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Wasp app (React + Node.js + Prisma). Key files: `main.wasp` (routes/APIs), `schema.prisma` (DB), `src/` features (e.g., `travel/`, `payment/`, `auth/`), UI in `src/components/ui/`.
- Generated: `app/.wasp/out/*` and `app/.wasp/build/*` — do not edit; regenerate via Wasp.
- `blog/` — Astro Starlight docs site.
- `e2e-tests/` — Playwright tests kept for history/reference.
- Root: `docker-compose.yml`, `LOCAL_TESTING.md`, `COOLIFY_DEPLOYMENT.md`, `MCP_DEVTOOLS_SETUP.md`.

## Build, Test, and Development Commands
- Prereqs: Node 18+, Wasp CLI, Docker/Colima.
- Env: `cp app/.env.server.example app/.env.server` (add Stripe test keys if needed).
- Start DB: `cd app && wasp db start`.
- Dev app: `cd app && wasp db migrate-dev && wasp start` (web `:3000`, API `:3001`).
- Build app: `cd app && npm install && wasp build`.
- Blog dev: `cd blog && npm install && npm run dev`.
- Local prod-like: `docker compose up` after `wasp build`.
- Browser automation: see `MCP_DEVTOOLS_SETUP.md`. Legacy e2e: `cd e2e-tests && npm run local:e2e:start`.

## Coding Style & Naming Conventions
- TypeScript strict; prefer explicit types; avoid one-letter vars.
- Use UI components from `app/src/components/ui` and Tailwind utilities.
- Validate server inputs with Zod + `ensureArgsSchemaOrThrowHttpError`.
- Access required env via `requireNodeEnvVar`; never hardcode secrets.
- Keep changes surgical; follow existing file/module patterns.

## Testing Guidelines
- Prefer MCP + Chrome DevTools for new browser flows; keep Playwright tests as historical reference.
- Add/adjust tests only for user-visible changes; use clear, descriptive test names.
- Place domain tests near features where applicable; e2e commands above.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- PRs: focused scope, clear description, linked issues, screenshots for UI, test plan, and any migration/env notes.
- Do not edit `app/.wasp/out` or `app/.wasp/build`; regenerate via Wasp instead. Update docs when behavior changes.

## Security & Configuration
- Never commit real secrets. Use example `.env.*` files; production secrets live in Coolify/CI.
- Payments: Stripe by default (`app/src/payment/paymentProcessor.ts`); plan IDs via `app/src/payment/plans.ts` (`PAYMENTS_*`).
- DB url provided by `wasp db start`; otherwise set `DATABASE_URL`.

