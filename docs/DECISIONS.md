---
covers: ["*"]
verified_at: 88f8405
verified_on: 2026-11-17
---
# Architectural & Design Decisions (ADRs)

Recovered from git history at `88f8405` (`test`). That history has 556 commits, 370 of them non-merge. It contains all 317 commits of `master` (the Angular portal, 2023-09-25 → 2026-01-12) plus the Next.js line (2026-01-02 → now). Commit messages rarely give reasons. Where no rationale is recorded, this doc says so, and anything marked *Inference* is read from the diff, not stated by the authors. Unknowns go to [OPEN_QUESTIONS](OPEN_QUESTIONS.md).

## Decision Index

| Date | Decision Record | Status | Area Affected | Key Rationale |
|---|---|---|---|---|
| 2026-01-02 | [ADR-001: Rewrite the portal in Next.js on a separate line from master](#adr-001-rewrite-the-portal-in-nextjs-on-a-separate-line-from-master) | Accepted | Whole app / branches | Not recorded; Angular app frozen on `master` |
| 2026-01-13 | [ADR-002: Next.js 16 + React 19, Tailwind only](#adr-002-nextjs-16--react-19-tailwind-only) | Accepted | Framework / styling | Team rules in `.windsurf/rules/giddh-portal.md` |
| 2026-01-07 | [ADR-003: Redux Toolkit with redux-persist, one `companies` slice](#adr-003-redux-toolkit-with-redux-persist-one-companies-slice) | Accepted | State | Survive reloads; slimmed to one slice 2026-02-25 |
| 2026-01-30 | [ADR-004: Hard-coded prod/non-prod config, overridden at runtime by the white-label API](#adr-004-hard-coded-prodnon-prod-config-overridden-at-runtime-by-the-white-label-api) | Accepted (supersedes 2026-01-23 design) | Config / white-label | No rebuild per brand; one env var |
| 2026-04-08 | [ADR-005: Session keys in localStorage are namespaced per company](#adr-005-session-keys-in-localstorage-are-namespaced-per-company) | Accepted (supersedes 2026-02-25 global keys) | Session / storage | Fix multi-tab, multi-company sessions |
| 2026-04-09 | [ADR-006: Country segment in every route selects India vs UK APIs](#adr-006-country-segment-in-every-route-selects-india-vs-uk-apis) | Accepted | Routing / API hosts | UK businesses live on a separate API |
| 2026-10-29 | [ADR-007: Login via Google Identity and MSG91 OTP widget instead of the MSG91 proxy-auth widget](#adr-007-login-via-google-identity-and-msg91-otp-widget-instead-of-the-msg91-proxy-auth-widget) | Accepted on `test`, not yet on `main` | Auth | Commit title only: "Removed msg91 proxy from Login" |
| 2026-01-20 | [ADR-008: Magic link and legacy URLs kept working inside the portal](#adr-008-magic-link-and-legacy-urls-kept-working-inside-the-portal) | Accepted | Routing / backward compatibility | Old links in sent emails must still resolve |
| 2026-03-13 | [ADR-009: Build tooling: `typescript` as a runtime dependency, husky not auto-installed](#adr-009-build-tooling-typescript-as-a-runtime-dependency-husky-not-auto-installed) | Accepted | Build / deploy | Not recorded; inferred deploy constraint |

---

## ADR-001: Rewrite the portal in Next.js on a separate line from master

### Status
Accepted. Branch model confirmed by the owner, 2026-11-17.

### Context & Problem Statement
The customer/vendor portal was an Angular 16 app (`@angular/core ^16.2.3`, Karma tests), built from 2023-09-25 (`e45a341`). Its last change on `master` is `bc54108` (PR #117, 2026-01-12). In 2025-12 the Giddh "magic link" ledger viewer was moved into it (`f782cee`, 2025-12-11, "Separated the magic link from Giddh to Portal"). No commit or doc says why it was rewritten rather than evolved.

### Decision & Implementation
- `e12742d` "EMPTY INIT" (2026-01-02) branched from `master` at `5a8e8cf` (PR #116, 2025-12-17) and deleted the whole Angular app (206 files, 20,184 lines). `3a9e03d` "Next.js Setup" the same day added Next 14 / React 18 / Redux Toolkit / Tailwind.
- `92e463a` (2026-01-22) merged `master` (`bc54108`) into the new line with **no file changes**. Every `master` commit is therefore an ancestor of `test`, but none of its code survives.
- `test` and `main` carry the Next.js app. `master` (still the GitHub default) is legacy and out of scope. `main` last took `test` in PR #167 (`fac5719`, 2026-05-19).

### Supporting Evidence & Past Incidents
- `e12742d`, `3a9e03d`, `92e463a`, `bc54108` as above. 22 of the 317 `master` commits (merges included) are dated 2025-12-01 or later: the magic-link move and its follow-ups.

### Consequences & Trade-offs
- **Positive:** fresh App Router structure under `src/app/[company]/[country]/`.
- **Negative / Constraints:** `git log`/`blame` on old paths shows Angular history. Nothing from the Angular line (tests, `angular.json`, assets) applies. Branches named `*-master` exist on the remote: they belong to the old line or were early names for the rewrite (`86d1edbv9-master`). Do not target `master`. <!-- verify:ignore -->

### Superseded / Rejected Alternatives
1. **Angular 16 portal on `master`:** superseded; reason not recorded.

---

## ADR-002: Next.js 16 + React 19, Tailwind only

### Status
Accepted.

### Context & Problem Statement
The rewrite started on Next 14 / React 18 with SCSS partials under `src/styles/`. Team rules (`.windsurf/rules/giddh-portal.md`, added in `54b8555`, 2026-01-03) require Next.js 16 only, TypeScript only, Tailwind only (no custom CSS/SCSS, CSS Modules or inline styles), routes under `[company]/[country]`, and backward-compatible changes. <!-- verify:ignore -->

### Decision & Implementation
- `43b1445` "create basic styling" (2026-01-13) moved to `next 16.1.1` / React 19 and deleted `src/styles/main.scss`, `mixins.scss`, `utilities.scss`, `variables.scss`. <!-- verify:ignore -->
- `src/app/globals.scss` (since `5472ce6`, 2026-01-31, replacing `globals.css`) holds Tailwind directives, `@layer base` CSS variables and custom `.auth-container` / `.auth-header-preview` rules for the MSG91 widget (see [DESIGN.md](DESIGN.md)), so `sass` stays a devDependency. <!-- verify:ignore -->
- DaisyUI was added in `afab62e` (2026-01-29) for a calendar (`9bd306e`, "added calender from daisy ui") and removed again in `7455b34` (2026-02-07). The calendar now lives in `src/components/ui/DateRangeCalendar.tsx` on plain Tailwind.

### Consequences & Trade-offs
- **Negative:** `next lint` was removed in Next 16, so `npm run lint` fails and TS is not linted at all (see [DEVELOPMENT](DEVELOPMENT.md#running-automated-checks--tests)).
- `postcss.config.js` is a `.js` file despite the "TypeScript only" rule. <!-- verify:ignore -->

### Superseded / Rejected Alternatives
1. **SCSS partials:** removed `43b1445`.
2. **DaisyUI components:** tried and removed within 10 days. The reason is not recorded; inference: the Tailwind-only rule.

---

## ADR-003: Redux Toolkit with redux-persist, one `companies` slice

### Status
Accepted.

### Context & Problem Statement
Company, account and balance data must survive reloads and be shared across pages of a session.

### Decision & Implementation
- Redux Toolkit since `3a9e03d`; redux-persist since `650299d` "session storage" (2026-01-07). Store: `src/store/store.ts:store`, persisted under key `companies` with `localStorage` storage and the `autoMergeLevel2` reconciler. The reconciler arrived in `8f97ac5` "SESSION ERROR" (2026-02-23), which also stopped reading `country` from `sessionStorage` and took it from the URL path instead (`src/lib/apiClient.ts`).
- `e78d528` (2026-02-25) removed `counterSlice` and `userSlice`. `RootState` is now `{ companies: CompanyState }`. <!-- verify:ignore -->
- `src/components/SessionGuard.tsx` (since `c462ccf`, 2026-01-14) and `src/components/PersistGateLoading.tsx` gate rendering. Details: [ARCHITECTURE](ARCHITECTURE.md).

### Consequences & Trade-offs
- **Negative:** server renders log `redux-persist failed to create sync storage`, which is expected. Persisted state is per browser profile and shared across tabs, which caused ADR-005.

### Superseded / Rejected Alternatives
1. **Per-feature slices (`userSlice`, `counterSlice`, balance-summary slice):** removed as unused (`e78d528`, `8c75be7`). <!-- verify:ignore -->

---

## ADR-004: Hard-coded prod/non-prod config, overridden at runtime by the white-label API

### Status
Accepted; supersedes the 2026-01-23 white-label service and the 2026-02-05 server proxy route.

### Context & Problem Statement
Each Giddh business can be white-labelled (brand, logos, domains, API host). Config must not need a rebuild per brand, and test and production need different API hosts.

### Decision & Implementation
- `src/config/default.ts` holds `PROD_CONFIG` / `NON_PROD_CONFIG`. `NEXT_PUBLIC_APP_ENV` (or server-only `APP_ENV`) picks one at build time (`a241525`, 2026-01-30).
- `src/contexts/ConfigContext.tsx:ConfigProvider` fetches `/white-label` from the Giddh API in the browser and caches it in `localStorage`. `src/config/default.ts:mergeWhiteLabelConfig` overlays it. `527053b` (2026-03-26) extended the overlay to brand name, logos, favicon (`src/components/FaviconUpdater.tsx`) and title (`src/components/TitleUpdater.tsx`).

### Supporting Evidence & Past Incidents
- `1b4cce3` (2026-01-23): first design. `src/services/whitelabel.ts` with a `disableWhiteLabel` flag and 10 s timeout; removed `.env.example` contents, `.nvmrc`, `amplify.yml`. `2b0236f`: removed env-var dependencies from API utilities. <!-- verify:ignore -->
- `a241525` (2026-01-30): deleted `src/services/whitelabel.ts` and added the env-based selector, `.env.production` and `docs/Environment-Setup.md`. <!-- verify:ignore -->
- `6c807a9` → `3b81a32` (both 2026-02-05): a server route `src/app/api/whitelabel/route.ts` proxied the white-label URL from env vars `GIDDH_WHITE_LABEL_URL` / `GIDDH_GB_WHITE_LABEL_URL`, then was deleted the same day. Only `src/app/api/instance-metadata/route.ts` remains. <!-- verify:ignore -->
- `1cc3973` (2026-02-04): `.env.production` deleted from git. <!-- verify:ignore -->

### Consequences & Trade-offs
- **Positive:** a new brand needs no deploy.
- **Negative / Constraints:** every client-side value in `src/config/default.ts` is public. `APP_ENV` alone does not reach the browser (verified; see [DEVELOPMENT](DEVELOPMENT.md#environment-variables-reference)). `docs/WHITELABEL_CONFIG.md` and `docs/Environment-Setup.md` still describe the superseded designs.

### Superseded / Rejected Alternatives
1. **Client service with on/off flag and timeout (`1b4cce3`):** replaced in a week; reason not recorded.
2. **Server-side `/api/whitelabel` proxy with env-configured URLs (`6c807a9`):** removed within hours (`3b81a32`); reason not recorded. <!-- verify:ignore -->
3. **Committed `.env.production` / `.env.prod`:** deleted (`1cc3973`) and reverted (`db727db`). The prod switch now lives outside the repo. <!-- verify:ignore -->

---

## ADR-005: Session keys in localStorage are namespaced per company

### Status
Accepted; supersedes the 2026-02-25 global keys.

### Context & Problem Statement
One browser can hold portal sessions for several businesses (`[company]`) and several tabs.

### Decision & Implementation
- `src/utils/getUserDataFromStorage.ts:userDataStorageKey` and `src/utils/getUserDataFromStorage.ts:userEmailStorageKey` store `userData:<company>` / `userEmail:<company>`. A read-only fallback to the legacy global `userData` applies when its `company` matches (`276cff8`, 2026-04-08, "Fixed multi tab issue").

### Supporting Evidence & Past Incidents
- Before 2026-02-25: per-company keys `userData_${company}`. `e78d528` unified them to global `userData` / `userEmail` "for cross-company session detection". Six weeks later `276cff8` re-namespaced them to fix the multi-tab bug.

### Consequences & Trade-offs
- **Constraint:** never reintroduce a global session key. Key list: [CONTRACTS](CONTRACTS.md).

### Superseded / Rejected Alternatives
1. **Global `userData` / `userEmail` (`e78d528`):** broke sessions across tabs and companies.

---

## ADR-006: Country segment in every route selects India vs UK APIs

### Status
Accepted.

### Decision & Implementation
- `b619777` (2026-04-09, "add country-based routing and UK API support") added `src/app/auth/[country]/page.tsx` and routed the UK proxy and API hosts through `[country]`.
- `src/lib/apiClient.ts` and `src/contexts/ConfigContext.tsx:ConfigProvider` read the country from the URL path. The `GIDDH_API_URL_UK` / `API_URL_UK` hosts are identical in the prod and non-prod config.

### Consequences & Trade-offs
- **Negative:** a local or test build on a `uk` route talks to the production UK API (see [DEVELOPMENT](DEVELOPMENT.md#safe-test-data-guidance)). Whether a UK test host exists is not recorded.

---

## ADR-007: Login via Google Identity and MSG91 OTP widget instead of the MSG91 proxy-auth widget

### Status
Accepted on `test` (`a244645`, 2026-10-29; fixes `7816662`, `7de5aa0`, `c338985`). Not yet merged to `main` at `88f8405`.

### Decision & Implementation
- The login page dropped the `proxy.msg91.com` proxy-auth script. It now uses `src/utils/auth/googleIdentity.ts` and `src/utils/auth/msg91OtpWidget.ts`, and verifies the resulting access token with `src/utils/auth/verifyPortalUserByAccessToken.ts`. The access token is still stored under the `proxy_auth_token` key. Journey: [FLOWS](FLOWS.md).
- The OTP widget id/token are not white-label overridable (`mergeWhiteLabelConfig`); the Google client id is.

### Superseded / Rejected Alternatives
1. **MSG91 proxy-auth widget (`proxy_auth_token` from the hosted widget):** replaced; rationale not recorded beyond the commit title.

---

## ADR-008: Magic link and legacy URLs kept working inside the portal

### Status
Accepted.

### Decision & Implementation
- Magic link ledger viewer at `src/app/magic/page.tsx` (`43aec7d`, `1dfadab`, 2026-01-20/21). `next.config.ts` rewrites `/magic.html` → `/magic` (`04ef757`, 2026-01-22). Old Angular-era links ended in `magic.html`, and the old `amplify.yml` had custom headers for it. <!-- verify:ignore -->
- `next.config.ts` redirects `/:company/:country/invoice-preview` → `/:company/:country/invoice/preview` (`dcdfd97`, 2026-02-18).
- Invoice pay: the first page was dropped and rebuilt (`0661e8c`, 2026-02-12, "reverting invoie-pay and creating a new page for it"). Both `src/app/[company]/[country]/invoice-pay/[...slug]/page.tsx` and `src/app/[company]/[country]/invoice-pay/account/[accountUniqueName]/voucher/[voucherUniqueName]/page.tsx` now exist (`5b7cc5b`, 2026-02-14).

### Consequences & Trade-offs
- **Constraint:** links already sent to customers must keep resolving. Never remove these rewrites/redirects without the owner's say-so.

---

## ADR-009: Build tooling: `typescript` as a runtime dependency, husky not auto-installed

### Status
Accepted.

### Decision & Implementation
- `typescript` moved from `devDependencies` to `dependencies` (`2fdafd8`, 2026-03-13, "changed dependencies") after the same move was reverted on 2026-03-10 (`b13d815`). *Inference:* the deploy installs production dependencies only, and Next needs `typescript` to load `next.config.ts`.
- `prepare` changed from `husky` to `echo 'skip husky in CI'` (`05c96a1`, 2026-01-21), the same commit that added `amplify.yml` and replaced `next.config.js` with `next.config.ts`. *Inference:* husky broke the CI install. The result is that `.husky/pre-commit` is not installed for anyone by default. <!-- verify:ignore -->

### Consequences & Trade-offs
- **Negative:** no enforced formatting. `prettier --check .` fails on 24 files at `88f8405`.

---

## Lessons Learned & Incident Log

- **Incident / Bug:** PR #152 (`69793ee`, 2026-03-05) merged a magic-link change straight into `main`. It added `transactionLimitExceeded` handling to `src/utils/magic/getMagicLinkData.ts` (`4a2c18e`). It was reverted the next day with a GitHub revert branch `revert-152-86d1vnkv1-main` (PR #153, `87dc3f4`). The handling was never re-applied. <!-- verify:ignore -->
  - **Root Cause:** no record. The change went to production without passing through `test`.
  - **Prevention Rule:** PRs go into `test` first; `main` only takes `test` (confirmed by the owner, 2026-11-17).
- **Incident / Bug:** 2026-03-10 on `main`, an env file `.env.prod` was committed (`f1197e9`) and dependency changes were merged (`f231d5f`). Both were reverted the same day (`db727db`, `b13d815`); the dependency part was re-applied three days later (`2fdafd8`). <!-- verify:ignore -->
  - **Root Cause:** production build configuration was being fixed by committing to `main`. *Inference* from the sequence.
  - **Prevention Rule:** never commit env files. Set `NEXT_PUBLIC_APP_ENV=prod` in the production build environment.
- **Incident / Bug:** "multi tab issue": sessions for different companies in one browser overwrote each other.
  - **Root Cause:** global `userData` / `userEmail` keys (`e78d528`).
  - **Prevention Rule:** namespace every per-session storage key by company (ADR-005).
- **Incident / Bug:** "SESSION ERROR" (`8f97ac5`, 2026-02-23): the country came from `sessionStorage`, and the persisted state merged badly on rehydrate.
  - **Root Cause:** a tab-scoped source of truth for a URL-scoped value, plus the default shallow persist merge (*Inference* from the diff: `autoMergeLevel2` was added in the same fix).
  - **Prevention Rule:** derive `[company]` / `[country]` from the URL, not storage.
- **Incident / Bug:** the docs went stale within days. `docs/WHITELABEL_CONFIG.md` still documents `disableWhiteLabel` and `src/services/whitelabel.ts`, both gone since `a241525`. <!-- verify:ignore -->
  - **Prevention Rule:** update the owning doc in the same change (see [DEVELOPMENT](DEVELOPMENT.md#how-an-agent-checks-its-work-verification-checklist)).
