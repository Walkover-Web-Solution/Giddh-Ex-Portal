---
covers: ["*"]
verified_at: 88f8405
verified_on: 2026-11-17
---
# Open Questions & Known Ambiguities

Product and ownership decisions the repository does not answer. When one is resolved, update the doc that owns the answer (usually [VISION.md](VISION.md)) and move the entry to **Resolved** with the date and source.

OQ-001 to OQ-010 come from the first vision draft (PR #173). OQ-011 onward were found while writing the doc set on 2026-11-17.

## Active Questions Table

| ID | Topic / Question | Affected Code | Conflicting Evidence / Current Status | What Would Resolve It |
|---|---|---|---|---|
| OQ-001 | Official product name: **Giddh Portal**, **Giddh Ex Portal** (the repo name), or something else? | `src/components/TitleUpdater.tsx`, `package.json` | The package is `giddh-portal`; the repo is `Giddh-Ex-Portal` | Owner picks one name |
| OQ-002 | Should docs and copy say "vendor" or "customer"? | `src/store/`, `src/utils/` | Owner confirmed, 2026-11-17: users are the **customers** of Giddh businesses. The code still says `vendorContactUniqueName` / `fetchVendorsList` | Owner decides whether the code naming should change or stay as an API term |
| OQ-003 | Are auditors or read-only collaborators in scope? | — | No role model in the code | Owner decision |
| OQ-004 | Success metrics (adoption, pay-through rate, session errors…) | — | None written down | Owner input into [VISION.md](VISION.md) |
| OQ-005 | Is the old "Future Improvements" list (dark mode, i18n, PWA, WebSockets…) a roadmap or just ideas? | — | Removed from ARCHITECTURE; treat it as ideas until an owner promotes it | Owner decision |
| OQ-006 | The old `WHITELABEL_CONFIG.md` describes `disableWhiteLabel`, but the code always fetches `/white-label` except on `/magic` | `src/contexts/ConfigContext.tsx` | The flag doesn't exist in the code ([FLOWS.md](FLOWS.md)) | Owner says which behaviour is intended | <!-- verify:ignore -->
| OQ-007 | Which auth example is canonical? | `src/utils/` | Resolved by reading the code: the cookie + `Session-Id` flow in [CONTRACTS.md](CONTRACTS.md) is real, and the `localStorage.token` interceptor in the old `API.md` was stale | — (close on review) |
| OQ-008 | Should there be a root entry point? | `AGENTS.md` | Added on 2026-11-17 | — (close on review) |
| OQ-009 | Is the UK (`country=uk`) path a product requirement or a technical workaround? | `src/config/`, `src/contexts/ConfigContext.tsx` | `REFERENCE_ID_UK` is never used (UK guest login uses the India id), and `/auth?country=uk` loads the India config | Owner states UK parity requirements |
| OQ-010 | Who approves this vision and its updates? | `docs/VISION.md` | Not stated | Owner names a team or role |
| OQ-011 | Is a captured payment reconciled on the server (webhook or IPN) when the browser's `invoices/:id/pay` call fails or never happens? | `src/components/PayNow.tsx`, `src/utils/payment.ts` | PayPal's return never calls the pay endpoint; a Razorpay pay-call failure is only logged; PayU accepts any window `message` that has a `status` | Backend team confirms reconciliation; then fix the client paths |
| OQ-012 | Can a guest with no `Session-Id` fetch voucher details and pay through `invoice-pay`? | `src/utils/payment.ts` | Public links depend on it; the backend behaviour isn't documented | Backend confirmation |
| OQ-013 | Does anything outside the app use `/api/instance-metadata`? | `src/app/api/instance-metadata/route.ts` | Nothing in `src/` calls it; it returns the EC2 identity document to anyone | Ops confirms; then remove it or protect it |
| OQ-014 | Where do `brandName` and logos sit in the `/white-label` response: at the top level, or under `giddhWhiteLabel`? | `src/contexts/ConfigContext.tsx` | The code reads the top level, but the old docs showed them nested. If the old docs were right, branding never applies | A real response sample from the test API |
| OQ-015 | Should `giddhWhiteLabel.apiDomain` override `API_URL` (the MSG91 proxy base) as well as `GIDDH_API_URL`? | `src/contexts/ConfigContext.tsx` | Both are overwritten (`a244645`); `proxyApiUrl` is ignored | Owner / backend decision |
| OQ-016 | Does `export-account-statement` ignore `page` / `count`? | `src/utils/` | Export sends only the current page and count | Backend confirmation |
| OQ-017 | Do upstream proxy-auth redirects always include `company`? | `src/app/auth/` | `/auth` with no company spins forever | Backend / MSG91 confirmation |
| OQ-018 | Is `OTP_WIDGET_TOKEN` (committed in `src/config/default.ts`) a public widget token? | `src/config/default.ts` | It ships to the browser by design, but that should be confirmed | MSG91 / owner confirmation |
| OQ-019 | Should pages reachable by link without a session be `noindex`? | `src/app/layout.tsx` | There is no robots meta tag or sitemap ([DESIGN.md](DESIGN.md)) | Owner decision |
| OQ-020 | What runs the deploy, and does production set `NEXT_PUBLIC_APP_ENV=prod` at build time? | `src/config/default.ts`, `next.config.ts` | `APP_ENV` alone gives a split build (server on prod, browser on test). The buildspec in the old docs ships `next.config.js`, which doesn't exist | Owner shows the pipeline / buildspec ([DEVELOPMENT.md](DEVELOPMENT.md)) | <!-- verify:ignore -->
| OQ-021 | Should linting be restored? | `package.json`, `eslint.config.mjs` | `next lint` was removed in Next 16; `eslint.config.mjs` only lists ignores; husky is never installed (`05c96a1`) | Owner decision; then a working ESLint config |
| OQ-022 | Is `main` meant to be 11 commits behind `test`? | — | Production lacks the new Google/OTP login (`a244645`) | Owner confirms the promotion plan |
| OQ-023 | Should UK use separate test hosts? | `src/config/default.ts` | Prod and non-prod config share the UK hosts | Backend / infra answer |
| OQ-024 | Why was the app rewritten from Angular to Next.js, and when can `master` be retired? | — | `e12742d` (2026-01-02) replaced the Angular code; no reason is recorded ([DECISIONS.md](DECISIONS.md)) | Owner explains; decide the default branch |

## Security & Defects Found While Documenting (not fixed)

These come from reading the code in init mode (docs only) and were not reproduced in a browser. Each needs a ticket, not an owner decision. Details are in [CONTRACTS.md](CONTRACTS.md), [FLOWS.md](FLOWS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md).

- **Public AWS metadata:** `/api/instance-metadata` answers every HTTP method with no auth, and returns the AWS account id, region, instance id and private IP.
- **Session-expired modal stops working:** `localStorage.proxy_auth_token` is set by every login and never removed. After the first login on a browser the modal never fires again, and the next user on that browser inherits the old token.
- **Session cookie:** `<company>-session` can be read by page scripts and has no `Secure` or `SameSite` attribute. <!-- verify:ignore -->
- **PayPal posts to live paypal.com even on test:** `PayNow` hard-codes the live URL and ignores `PAYPAL_URL`.
- **PayU trusts any message:** its success handler has no `origin` check.
- **Lookups without a token:** `v2/verify-portal-user` (proxy flow) sends `{emailId, subDomain}` with no token, and `save-session` sends no token for OTP logins. If the backend doesn't guard these, anyone could look up accounts by email.
- **Account switching may fail** for Google/OTP users: `proxy_auth_token` is sent as `proxyAuthToken` whatever the login method.
- **`localStorage.token` is read but never written,** so the `sessionId` passed to payment methods is always undefined.
- **UI bugs:**
  - `Pagination` with more than 7 pages can't reach the middle pages by number.
  - `DataTable` crashes when there's no `keyExtractor`.
  - `/images/note.svg` and the default `LOGOS.*` files are missing from `public/`.
  - `SidebarToggleButton` points at an id that doesn't exist.
- **Tailwind-only rule broken:** `src/app/globals.scss` and several inline `style=` props break the rule (listed in [DESIGN.md](DESIGN.md)).

## Known Technical Limitations & Verification Gaps

- **Unavailable service:** a Giddh business account with portal customers, and live payment-gateway test credentials.
  - **Verification gap:** no login, payment or white-label flow was run end to end. Flow claims are read from the code.
  - **Safe handling:** walk the affected journey on the test environment (after merging to `test`) before promoting to `main`.
- **No automated tests and no working lint:** typecheck and build are the only mechanical checks ([DEVELOPMENT.md](DEVELOPMENT.md)).

## Resolved

| ID | Answer | Source |
|---|---|---|
| OQ-002 (part) | End users are the customers of Giddh businesses, who share the portal with them | Confirmed by the owner, 2026-11-17 |
| — | The Next.js app on `test` / `main` is the product; `master` (Angular) is legacy | Confirmed by the owner, 2026-11-17 |
| — | Ship flow: PR into `test` → test env; `test` → `main` → production | Confirmed by the owner, 2026-11-17 |
