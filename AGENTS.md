# Giddh Portal (Giddh-Ex-Portal)

The customer portal for Giddh. Businesses that use Giddh share it with **their own customers**, who sign in under the business's URL (`/<company>/<country>/…`, optionally white-labelled). There they see invoices, payments and account statements, and pay through Razorpay, PayPal or PayU. It is a Next.js 16 App Router + React 19 + Redux Toolkit + Tailwind app with no backend of its own: all data comes from Giddh's portal APIs.

**This document covers the Next.js app on `test` / `main`.** `master`, the GitHub default branch, is the legacy Angular portal and is out of scope (confirmed by the owner, 2026-11-17).

## Commands

Verified on 2026-11-17 with Node 24.18.0 and npm 12.0.1. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) has the output and timings.

| Task | Command |
|---|---|
| Install | `npm ci` |
| Run dev server | `npm run dev`, then open `http://localhost:8008/<company>/<in or uk>/login` (test API) |
| Type check | `npx tsc --noEmit` (0 errors at baseline) |
| Build | `npm run build` (add `NEXT_PUBLIC_APP_ENV=prod` for the production config) |
| Format | `npx prettier --write <files you changed>`. Never run repo-wide `npm run format`; 24 files already fail `format:check`. |
| Lint | **Broken:** `npm run lint` calls `next lint`, which Next 16 removed. Don't rely on it. |
| Tests | None (no runner, no specs, no CI) |

## Reading Order Before You Change Code

1. **[docs/VISION.md](docs/VISION.md)**: who it's for and what it must not become. Check every request against it.
2. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: providers, the route tree and guards, Redux and storage, layer rules, and where new code goes.
3. Then read only what the task touches:
   - [docs/FLOWS.md](docs/FLOWS.md): white-label load, login, account switching, invoices and pay, payments and statements, magic links.
   - [docs/CONTRACTS.md](docs/CONTRACTS.md): every Giddh endpoint, auth headers, cookies and storage keys, and proposed endpoints.
   - [docs/DESIGN.md](docs/DESIGN.md): Tailwind tokens, components, white-label branding, and recipes for a page, a list or a modal.
   - [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md): env vars, checks, safe test data and the ship flow.
   - [docs/DECISIONS.md](docs/DECISIONS.md): the Angular → Next.js rewrite, reverts, and why things churned.
   - [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md): unknowns and known security issues. Read it before "fixing" anything odd.

## Project Rules & Boundaries

The team rules in `.windsurf/rules/giddh-portal.md` (always on) are rules 1 to 4. They stay in force for every tool.

1. **TypeScript only** (`.ts`/`.tsx`); no `.js`/`.jsx`. Use proper types and avoid `any`. <!-- verify:ignore -->
2. **Tenant routes live under `src/app/[company]/[country]/`.** Don't create a parallel root app structure.
3. **Tailwind only:** no new CSS, SCSS, CSS modules or inline `style`. The existing violations are listed in [DESIGN.md](docs/DESIGN.md#the-tailwind-only-rule-and-its-existing-violations); don't add more.
4. **Backward-compatible changes only; don't refactor unrelated code.** Explain every change: what, why and how.
5. **The Giddh backend is the source of truth.** Never calculate balances, taxes or payment status in the UI. Never add mock endpoints. A missing API gets a proposed contract in [CONTRACTS.md](docs/CONTRACTS.md#required--unavailable-backend-capabilities).
6. **Only `src/utils/*` and the company slice make HTTP calls** (the one existing exception is the `/white-label` fetch in `src/contexts/ConfigContext.tsx`). Build URLs with `src/constants/apiPaths.ts`, and read config through `useConfig` / `getConfig()`. Never hard-code a URL or brand ([ARCHITECTURE.md](docs/ARCHITECTURE.md#layer-rules)).
7. **Key every tenant state by the `[company]` slug.** Change sessions only through `setupUserSession` / `logoutCompany`, so the `<company>-session` cookie, Redux and localStorage stay in step.
8. **A new public (no-login) route must be added in four places.** Access is decided by `publicRoutes` in `src/components/SessionGuard.tsx` and `src/lib/apiClient.ts`. Guest UI comes from `guestRoutes` in `src/components/Sidebar.tsx` and the footer checks in `src/app/[company]/[country]/layout.tsx`. All four match with `includes()`, so a path containing `/auth` or `/login` already counts as public.
9. **`NEXT_PUBLIC_APP_ENV` picks the browser's API at build time.** `APP_ENV` alone produces a split build. Never point a local build at production ([DEVELOPMENT.md](docs/DEVELOPMENT.md)).
10. **`/uk/` routes reach the production UK API even locally,** because prod and non-prod use the same UK hosts. Avoid write actions there.
11. **Payments:** never complete a payment on a production company. The PayPal URL is hard-coded to live today (see [OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md)), so test PayPal with care.
12. **Treat magic links and invoice-pay links as secrets:** each one opens one customer's ledger.
13. **Never paste values from `src/config/default.ts`** (client ids, widget tokens, reference ids) into docs, prompts or logs. Name the key.

## Where Things Are

- `src/app/`: routes. `[company]/[country]/…` holds the tenant pages; `auth/`, `magic/` and `api/instance-metadata/` sit outside the tenant tree. <!-- verify:ignore -->
- `src/components/`: shared UI (`ui/`, `skeletons/`, `magic/`, `Sidebar`, `PayNow`…). <!-- verify:ignore -->
- `src/utils/`: API helpers (`auth/`, `proxy/`, `magic/`, payments, session, cookies). <!-- verify:ignore -->
- `src/store/`: Redux Toolkit store and `companySlice`, persisted with redux-persist.
- `src/contexts/`, `src/providers/`, `src/hooks/`: config / white-label context, providers, hooks.
- `src/config/default.ts`: prod and non-prod config and the white-label merge.
- `src/constants/`: API paths and enums.

## PR & Deployment Flow

Confirmed by the owner, 2026-11-17.

- **Branch:** from `test`, named by its ClickUp task id (`<clickup-id>-main` or `-test`).
- **Before the PR:**
  - `npx tsc --noEmit`, `npm run build`, and `npx prettier --check` on the files you changed.
  - Walk the affected journey on `npm run dev` against the test API.
- **PR into `test`:** this deploys to the test environment.
- **Promote:** `test` is merged into `main`, which deploys to production. The pipeline itself isn't in git ([DEVELOPMENT.md](docs/DEVELOPMENT.md)).
- Agents never commit, push, merge or deploy without the owner saying so for that action.

## Evaluating a Request

Follow [docs/VISION.md](docs/VISION.md#how-future-agents-must-evaluate-requests):
- The work must serve self-service for a business's customers.
- Keep tenant and session boundaries.
- Decline accounting logic, fake backends and cross-tenant shortcuts.
- Record any change of direction in `VISION.md` in the same change.

## Verification & Knowledge Maintenance

- **Baseline first:** run `tsc` and `build` before editing.
- **Say what you couldn't verify.** Anything behind login, payments and magic links needs a test business and a customer login. Name the journeys you didn't exercise.
- **Preserve:** routes, the URL shape, white-label behaviour, the storage keys, the session cookie and the IN/UK API selection.
- **Update the owning doc in the same change,** and bump its `verified_at`: <!-- verify:ignore -->

  | What changed | Doc to update |
  |---|---|
  | Endpoints, storage keys | `CONTRACTS.md` |
  | Routes, state, layers | `ARCHITECTURE.md` |
  | Journeys | `FLOWS.md` |
  | UI, tokens | `DESIGN.md` |
  | Env, commands | `DEVELOPMENT.md` |
  | Reversed choices | `DECISIONS.md` |
  | New unknowns | `OPEN_QUESTIONS.md` |

- **Superseded docs:** `docs/API.md`, `REDUX.md`, `ROUTING.md`, `Environment-Setup.md`, `WHITELABEL_CONFIG.md`, `White-Label-Flow.md` and `DATE_RANGE_CALENDAR.md` are partly wrong. Don't trust or update them.
