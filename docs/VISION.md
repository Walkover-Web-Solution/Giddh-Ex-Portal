---
covers: ["*"]
verified_at: 88f8405
verified_on: 2026-11-17
---

# Product Vision & Strategic Direction

Giddh Portal (package name `giddh-portal`) is the external, browser-based customer portal for [Giddh](https://giddh.com) accounting. Giddh businesses share it with their own customers (confirmed by the owner, 2026-11-17), who view balances, invoices, payments, and account statements—and pay open invoices—under company- and country-scoped URLs, backed by Giddh’s portal APIs and optional white-label branding.

## Authoritative Sources & Status

**Sources used (read for this draft):** `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/ROUTING.md`, `docs/REDUX.md`, `docs/WHITELABEL_CONFIG.md`, `docs/White-Label-Flow.md`, `docs/Environment-Setup.md`, `package.json`, `src/app/page.tsx`, `src/components/Sidebar.tsx`, `src/contexts/ConfigContext.tsx`, `src/config/default.ts`, `.windsurf/rules/giddh-portal.md`, recent `git log`. At that time there was no root `AGENTS.md` (added 2026-11-17) and no PRD.

### Approved Direction

**Confirmed by the owner, 2026-11-17:**

- **Who uses it:** Giddh's direct customers (businesses using Giddh) share this portal with **their own customers**. Those customers are the portal's end users: they sign in to see invoices, payments and statements, and to pay.
- **Which code:** the Next.js app on `test` / `main` is the product. `master` (the GitHub default branch) still holds the legacy Angular portal and is out of scope for these docs.
- **Ship flow:** feature branch (often `<clickup-id>-main`) → PR into `test` → test environment; `test` merged into `main` → production.

**Recovered from repo sources (inferred, not yet approved by an owner):**


- **Companion portal, not core ledger:** A self-service web front for parties linked to a Giddh company account (code and APIs refer to `vendorContactUniqueName` and account switching via vendor lists). Scope is read-and-pay workflows surfaced in navigation: home summary, invoices, payments made, account statement, plus previews, public invoice-pay links, and magic-link ledger viewing.
- **Multi-tenant by URL:** Authenticated experience lives under `/:companyUniqueName/:country/…` with session scoped per company (`SessionGuard`, `<company>-session` cookie set in `src/utils/cookies.ts`).
- **Giddh backend as system of record:** All business data and payment orchestration come from Giddh portal APIs (`/portal/company/...`, `voucherVersion=2`) and related Giddh/proxy auth flows—not from logic invented in this repo.
- **Payments where the company enables them:** Integrate Razorpay, PayPal, and PayU as exposed by the payment-methods API; portal collects payer details when a gateway requires them (e.g. PayU).
- **White-label and regional configuration:** Brand name, logos, domains, and API bases are driven by environment config and the Giddh `/white-label` API (with localStorage cache and merge fallbacks), including separate UK API base when `country` is `uk`.
- **Engineering constraints (team rules):** Next.js 16 App Router, TypeScript only, primary routes under `[company]/[country]`, Tailwind for styling, backward-compatible changes (`.windsurf/rules/giddh-portal.md`).

### Current Implementation

- Next.js 16 + Redux Toolkit (`companySlice` + redux-persist), Axios API utilities under `src/utils/`, Tailwind UI.
- Auth: company login via Google and MSG91 OTP, proxy-token auth entry at `/auth`, session via `savePortalSession` / `verifyPortalUser`; account switching within one company.
- Features implemented per `docs/README.md` key features list (invoice list/preview/pay, payment list/preview, account statement PDF export, magic link ledger, guest preview routes).
- White-label fetch runs on app load in `ConfigProvider` (skipped on `/magic` routes); merged into runtime config.
- Deployed as a static/Node Next build (pipeline not in git; see [DEVELOPMENT.md](DEVELOPMENT.md) and OQ-020); `APP_ENV` / `NEXT_PUBLIC_APP_ENV` selects prod vs non-prod API defaults.

### Proposals & Roadmaps

- **Documented backlog only (not approved product commitments):** the old ARCHITECTURE “Future Improvements” list (removed 2026-11-17; see OQ-005) named dark mode, comprehensive testing, caching, analytics, i18n, PWA, WebSockets, accessibility improvements.
- **In-flight engineering history (git):** Recent work includes OTP/login fixes, magic-link company settings, and API error messaging (see `git log` on branch `test`).

### Unknowns & Ambiguities

Open product and ownership questions are tracked in [docs/OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md). Treat that file as the queue for human decisions this draft cannot infer.

## Target Audience & Ideal Customer Profile (ICP)

### Primary persona

**A customer of a Giddh business** (confirmed by the owner, 2026-11-17). The business shares the portal with them, and they sign in as a contact tied to one or more accounts under that company. The code calls them a "vendor" (`vendorContactUniqueName`); see OQ-002.

| Attribute | As stated in repo |
|-----------|-------------------|
| Role | Party who owes or transacts with the Giddh company; switches among linked vendor accounts (`SwitchAccountButton`, `fetchVendorsList`). |
| Workflow | Log in → review balance and last payment → list/preview/download invoices → pay online → review payments and running account statement; optional magic-link statement without full portal session. |
| Technical level | Business user in a browser; no accounting software expertise required. |

### Secondary personas

| Persona | Relationship | Typical use |
|---------|--------------|-------------|
| **Giddh business (Giddh's direct customer)** | Shares the portal with its customers; configures portal, branding, and gateways in Giddh (out of scope for this repo). Confirmed by the owner, 2026-11-17. | Issues magic links, expects customers to self-serve invoices and statements. |
| **White-label / reseller operator** | Uses Giddh white-label domains and branding (`giddhWhiteLabel`, `portalDomain`). | Same portal UX under partner brand and API domain. |
| **Payee without full login** | Recipient of invoice-pay or preview URLs (`invoice-pay`, guest preview routes in `Sidebar`). | View or pay a specific voucher with reduced navigation. |
| **Auditor / collaborator** | Not stated: an owner decides (see OPEN_QUESTIONS). | — |

## Problems Solved & Value Proposition

| Customer problem | How the product solves it | What sets it apart (from repo evidence) |
|------------------|---------------------------|----------------------------------------|
| “I don’t know what I owe my supplier.” | Welcome balance summary, invoice list with due/status, account statement. | Tied to live Giddh ledger via portal APIs, not a static PDF inbox. |
| “I need to pay an invoice quickly.” | PayNow + gateway-specific flows; public `invoice-pay` routes. | Uses company-configured Razorpay / PayPal / PayU from Giddh. |
| “I need proof of payment and history.” | Payments list, payment voucher preview/download. | Same session and account context as invoices. |
| “I manage multiple accounts with one company.” | Switch account within company after auth. | Single-company session model; vendor list from API. |
| “I only have a link, not a login.” | Magic-link ledger viewer; guest preview paths. | Lightweight access without full portal onboarding. |
| “We sell Giddh under our brand.” | White-label config (brand, logos, API domain). | Runtime merge from Giddh `/white-label` + defaults. |

## Core Principles & Design Philosophy

| Principle | Trade-off it encodes |
|-----------|------------------------|
| **Portal reflects Giddh truth** | Prefer API-backed lists and PDFs over local business rules; trade local offline richness for consistency with the company’s books. |
| **Tenant isolation in the URL and session** | Company and country live in the path and cookies; trade simpler global routing for explicit multi-tenant boundaries and per-company logout. |
| **Thin client, fat backend** | No server-side ledger in this repo; trade feature velocity in the portal for dependency on Giddh API availability and contracts. |
| **Progressive access** | Full session for sidebar features; magic/guest routes for narrow tasks; trade uniform UX for lower friction on shared links. |
| **Configurable brand and region** | White-label and UK vs default API base; trade build-time simplicity for runtime configuration and extra fetch/caching complexity. |
| **Stability over drive-by refactors** | Team rule: backward-compatible, TypeScript/Tailwind conventions; trade fast stylistic churn for predictable upgrades for existing tenants. |

## Strategic Priorities & Success Measures

**Stated engineering priorities (implicit in docs and structure):** reliable auth/session, correct voucher/payment flows, responsive multi-tenant routing, white-label correctness, payment gateway completion.

**Success metrics:** Not stated in the repository; an owner decides (OPEN_QUESTIONS).

## Boundaries & Non-Goals

**Deliberately out of scope (from structure and docs):**

- Full accounting, inventory, payroll, or tax filing (marketing on root page points users to main Giddh site for “Smart Accounting”).
- Authoritative business logic or voucher posting in this codebase—only consumption of Giddh portal APIs.
- Native mobile apps, desktop clients, or offline-first ledger editing.
- Implementing payment gateways beyond those returned by Giddh’s payment-methods API.
- Next.js API routes as a BFF layer for core portal data (frontend calls Giddh and proxies directly per current architecture).

**Anti-patterns (break the vision):**

- Mock or fabricated Giddh endpoints instead of documenting real contracts.
- Cross-company session sharing or routing that bypasses `SessionGuard` / per-company cookies.
- Parallel root app structures outside `[company]/[country]` for primary features.
- Embedding accounting rules (tax, interest, dunning) in the UI without API backing.
- Breaking white-label or UK/IN API selection silently (wrong ledger domain).

## How Future Agents Must Evaluate Requests

1. **Compare to direction:** Ask whether the request serves self-service for the customers of a Giddh business, within portal APIs and payment gateways—not general ERP features.
2. **ICP fit:** Favor workflows a vendor contact or payee-on-a-link would run; defer company-admin configuration to Giddh admin surfaces unless explicitly portal-facing.
3. **Principles:** Keep Giddh as source of truth, preserve tenant/session boundaries, maintain backward compatibility and TypeScript/Tailwind conventions.
4. **Non-goals:** Decline or redirect full accounting, fake backends, and cross-tenant shortcuts; explain the conflict and suggest a portal-scoped alternative.
5. **Clarify before coding:** If the request is ambiguous against this file or OPEN_QUESTIONS, ask the owner or record the question—do not guess product intent.
6. **Direction changes:** If the team approves a deliberate vision change, update this file in the same change set as the code (brief delta only—do not dilute boundaries to approve work).
7. **Missing backend capabilities:** When a feature needs a new Giddh or proxy capability, describe the contract in `docs/CONTRACTS.md` (create or extend that file). Do not ship pretend integrations or undocumented endpoints.