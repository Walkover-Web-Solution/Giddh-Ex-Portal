---
covers: [src/utils/**, src/types/**, src/lib/**, src/config/**, src/app/api/**, src/store/**, src/constants/apiPaths.ts, src/constants/httpStatus.ts, src/contexts/ConfigContext.tsx]
verified_at: 88f8405
verified_on: 2026-11-17
---
# Contracts & Data Schemas

Every call this portal makes to the Giddh backend (directly or through the MSG91 proxy), what it sends, how it authenticates, and every key it keeps in the browser. Replaces the endpoint and persistence parts of the older `docs/API.md` and `docs/REDUX.md` (see [Stale claims](#stale-claims-in-the-old-docs)).

There is **no OpenAPI / Swagger spec** in the repository (no `openapi*` or `swagger*` file; confirmed by search). The backend is not in this repo. Response types are hand-written TypeScript interfaces that live next to the function that calls the endpoint, so they are the frontend's *expectation*, not a guarantee.

## Authoritative Type Definitions

| Domain Entity | Primary TS Type / Interface | Source File | Description |
|---|---|---|---|
| Portal account (login result) | `Account` | `src/types/auth.ts:Account` | One customer account a signed-in email can act as; `session` is optional |
| Session user | `UserData` | `src/types/auth.ts:UserData` | What `setupUserSession` stores in Redux and `localStorage` |
| Verify response | `VerifyPortalUserResponse` | `src/utils/proxy/types.ts:VerifyPortalUserResponse` | `{ status, body: Account-like[] }`; `ApiResponseStatus` enum in the same file |
| Company | `CompanyData`, `CompanyDetailsResponse` | `src/types/company.ts:CompanyData` | Company the portal belongs to (currency, decimals, `razorpayIntegrated`) |
| Account details | `AccountDetailsResponse` | `src/utils/getAccountDetails.ts:AccountDetailsResponse` | The signed-in customer's own ledger account |
| Contacts | `AccountsListResponse` | `src/utils/getAccountsList.ts:AccountsListResponse` | Contacts of the account |
| Invoice row | `InvoiceVoucher`, `InvoiceListResponse` | `src/utils/getInvoiceList.ts:InvoiceVoucher` | Sales vouchers list |
| Payment row | `PaymentVoucher`, `LastPaymentResponse` | `src/utils/getLastPayment.ts:PaymentVoucher` | Receipts; `invoiceNumber`/`invoiceUniqueName` are *derived client-side* |
| Gateway config | `PaymentMethodsResponse` | `src/utils/payment.ts:PaymentMethodsResponse` | Which of `RAZORPAY`/`PAYPAL`/`PAYU` are enabled, with public key |
| Pay order | `PaymentDetailsResponse` | `src/utils/payment.ts:PaymentDetailsResponse` | Order created by backend: `paymentId`, `orderId`, `paymentKey`, `htmlString` (PayU) |
| Statement | `AccountStatementResponse` | `src/utils/accountStatement.ts:AccountStatementResponse` | Opening/closing balances and transactions |
| Magic link ledger | `MagicLinkLedgerResponse` | `src/utils/magic/getMagicLinkLedger.ts` | Public ledger behind a magic link |
| Runtime config | `AppConfig`, `WhiteLabelConfig` | `src/config/default.ts:AppConfig` | Base URLs and brand, merged from white-label |
| Redux state | `CompanyState` | `src/store/slices/companySlice.ts:CompanyState` | Keyed by URL company slug |

> [!NOTE]
> Two different interfaces are both called `Account` (`src/types/auth.ts:Account` vs `src/utils/getAccountsList.ts:Account`) and two are called `PaymentDetailsResponse` (`src/utils/payment.ts` vs `src/utils/invoicePreview.ts`). Import from the file you mean.

## Base URLs

Four bases, chosen per call. `getConfig()` (`src/config/default.ts:getConfig`) merges the cached white-label body over the environment defaults; on the server it returns the defaults.

| Config key | Used for | Chosen by |
|---|---|---|
| `API_URL` | All `apiClient` calls (`/portal/...`) and proxy `v2/...` calls for India | `src/lib/apiClient.ts` request interceptor: URL segment 2 is not `uk` |
| `API_URL_UK` | Same calls when the URL is `/<company>/uk/...` | URL segment 2 equals `uk` |
| `GIDDH_API_URL` / `GIDDH_API_URL_UK` | `GET /white-label` (by country segment, always the *default*, never white-labelled); magic-link calls use `GIDDH_API_URL` only | `src/contexts/ConfigContext.tsx:ConfigProvider`, `src/utils/magic/*` |
| `PROXY_URL` | MSG91 `api/c/getDetails` | `src/utils/proxy/getDetails.ts:getDetails` |

Environment default: `PROD_CONFIG` when `APP_ENV` or `NEXT_PUBLIC_APP_ENV` equals `prod`, otherwise `NON_PROD_CONFIG` (`src/config/default.ts`). Env setup is owned by [DEVELOPMENT](DEVELOPMENT.md).

White-label override, as the code does it (`src/config/default.ts:mergeWhiteLabelConfig`):

| White-label field | Overrides |
|---|---|
| `giddhWhiteLabel.apiDomain` | **both** `API_URL` and `GIDDH_API_URL` |
| `proxyApiUrlUk` | `API_URL_UK` |
| `proxyUrl`, `proxyReferenceId`, `proxyReferenceIdUk`, `websiteDomain`, `brandName`, `logos`, `googleClientId`, `portalMessages.switchAccountAuthError` | `PROXY_URL`, `REFERENCE_ID`, `REFERENCE_ID_UK`, `WEBSITE_DOMAIN`, `BRAND_NAME`, `LOGOS`, `GOOGLE_CLIENT_ID`, `SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE` |
| `proxyApiUrl`, `otpWidgetIdWeb`, `otpWidgetTokenWeb` | nothing (declared in `WhiteLabelConfig`, ignored) |

> [!WARNING]
> `proxyApiUrl` is **not** used: when a white-label body exists, India `API_URL` becomes `giddhWhiteLabel.apiDomain` (the Giddh API host), while UK `API_URL_UK` stays on the MSG91 proxy. `GIDDH_API_URL_UK` is never overridden. Whether this asymmetry is intended is open (notes). Do not "fix" it without the backend owner.

## Backend API Endpoints & Contracts

Conventions for the `/portal/...` group:
- Prefix `P` = `/portal/company/{companyUniqueName}/accounts/{accountUniqueName}`, built by `src/constants/apiPaths.ts:API_PATHS`. Some builders `encodeURIComponent` the two segments, some do not.
- Client: `apiClient` (`src/lib/apiClient.ts:apiClient`), base `API_URL` / `API_URL_UK`, header `Session-Id` from the cookie (see [auth](#authentication--authorization-assumptions)).
- Envelope: `{ status: "success" | "error", body: T }`; errors may carry `message` and `code`.
- `voucherVersion=2` is sent on every voucher, payment and download call except contacts, details, company details, vendors, view-statement and export. It selects Giddh's v2 voucher model; keep sending it.

### Auth: login, OTP, Google, proxy

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `{PROXY_URL}/api/c/getDetails` | header `proxy_auth_token` | none | `{ status, data: [{ email }] }` | not handled; throws |
| POST | `{API_URL}/v2/verify-portal-user` (proxy flow) | **none sent** | `{ emailId, subDomain }` | `VerifyPortalUserResponse` | throws |
| POST | `{API_URL}/v2/verify-portal-user` (Google / OTP) | token in body | `{ accessToken \| otpAccessToken, subDomain, emailId? }` | `VerifyPortalUserResponse` | throws |
| POST | `{API_URL}/v2/portal-user/save-session` | token in body | `SaveSessionRequest`: `{ account, vendorContactUniqueName, subDomain, proxyAuthToken?, accessToken? }` | `{ status, body: { companyUniqueName, session: { id, createAt, expiresAt } } }` | throws |
| GET | `https://www.googleapis.com/oauth2/v3/userinfo` <!-- verify:ignore --> | `Authorization: Bearer <google token>` | none | `{ email }` | returns `null` |

Callers: `src/utils/proxy/getDetails.ts:getDetails`, `src/utils/proxy/verifyPortalUser.ts:verifyPortalUser`, `src/utils/auth/verifyPortalUserByAccessToken.ts:verifyPortalUserByAccessToken`, `src/utils/proxy/saveSession.ts:savePortalSession`, `src/utils/auth/googleIdentity.ts:getGoogleUserEmail`. All use bare `axios`, not `apiClient`, so no interceptors and no `Session-Id`. `subDomain` is the URL company slug. Base is `API_URL_UK` when the passed `country` is `uk`.

> [!WARNING]
> - `verifyPortalUser` receives the proxy token but sends neither it nor any credential (`proxy_auth_token` header is commented out). The endpoint accepts `{ emailId, subDomain }` alone and returns accounts plus, optionally, `session.id`. If the backend does not check something else, that is an account-enumeration surface. Backend question, see notes.
> - `savePortalSession` with `provider === "otp"` sends neither `accessToken` nor `otpAccessToken` (the type declares `otpAccessToken` but it is never set). OTP sessions therefore rely on the backend linking the earlier verify call. Confirm with backend before changing.

### Session-scoped data: company, account, contacts, vendors

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `P/get-company-details` | Session-Id | none | `CompanyDetailsResponse` | 401/403 → session-expired |
| GET | `P/details` | Session-Id | none | `AccountDetailsResponse` | 401/403 |
| GET | `P/contacts` | Session-Id | none | `AccountsListResponse` | 401/403 |
| GET | `P/get-vendors-list?emailId=` | Session-Id | query `emailId` | `{ status, body: Account[] }` | 401/403 |
| GET | `P/vouchers/balance-summary?voucherVersion=2` | Session-Id | none | `{ currency, balancePayable, noOfInvoices }` | 401/403 |

Callers: `src/utils/getCompanyDetails.ts`, `src/utils/getAccountDetails.ts`, `src/utils/getAccountsList.ts`, `src/utils/getVendorsList.ts`, and `src/store/slices/companySlice.ts:fetchBalanceSummary` (inline call; it also passes `voucherVersion` as a param, so it is sent twice). The Redux thunks in `companySlice.ts` wrap these (owned by [ARCHITECTURE](ARCHITECTURE.md)). The vendors list puts the user's email in the query string.

### Invoices and vouchers

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| POST | `P/vouchers/get-all?voucherVersion=2&type=sales&page&count&sort&sortBy` | Session-Id | `{ companyUniqueName, accountUniqueName, balanceStatus[], uniqueNames[] }` | `InvoiceListResponse` | 401/403 |
| POST | `P/vouchers/get-all?...&type=receipt` | Session-Id | same | `LastPaymentResponse` | 401/403 |
| GET | `P/vouchers?type=receipt&page=1&count=10&uniqueNames={u}&voucherVersion=2` | Session-Id | none | `PaymentListResponse` | errors swallowed → empty list |
| POST | `P/download-file?voucherVersion=2&fileType=base64` | Session-Id | JSON array `[voucherUniqueName]` | `{ status, body: base64 }` | 401/403 |
| GET | `P/{voucherUniqueName}/comments?voucherVersion=2` | Session-Id | none | `{ status, body: Comment[] }` | 401/403 |
| POST | `P/{voucherUniqueName}/add-comment?voucherVersion=2` | Session-Id | `{ description }` | `{ status, message }` | 401/403 |

Callers: `src/utils/getInvoiceList.ts:getInvoiceList` (defaults `sortBy=voucherDate`), `src/utils/getLastPayment.ts:getLastPayment` (defaults `sortBy=grandTotal`; fills `invoiceNumber` from `referenceVouchers[0]`, then `linkedInvoice`, then `adjustments[0]`), `src/utils/paymentPreview.ts:getPaymentList`, `src/utils/downloadInvoice.ts`, `src/utils/paymentPreview.ts:downloadPaymentVoucher`, `src/utils/invoicePreview.ts:downloadVoucher`, `src/utils/invoicePreview.ts:getInvoiceComments`, `src/utils/invoicePreview.ts:addComment`. PDFs come back base64; decode with `base64ToBlob` (three copies exist: `src/utils/invoicePreview.ts`, `src/utils/paymentPreview.ts`, `src/utils/magic/downloadVoucher.ts`).

### Payments and gateway order creation / verification

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `P/payment-methods?voucherVersion=2` | Session-Id | none | `{ status, body: PaymentMethodsResponse }` | 401/403 |
| GET | `P/payment-methods` (no version) | Session-Id | none | untyped | 401/403 |
| GET | `P/payment-method` | Session-Id | none | `Record<gateway, Record<type,label>>` | 401/403 |
| POST | `P/invoice-pay-request?voucherVersion=2` (details) | Session-Id | JSON array of voucher unique names | `InvoicePayVoucherDetailsResponse` | 401/403 |
| POST | `P/invoice-pay-request?voucherVersion=2` (create order) | Session-Id | `{ paymentGatewayType, voucherUniqueNames[], name?, email?, contactNo? }` (contact fields PayU only) | `PaymentDetailsResponse` | 401/403; `message` shown as toast |
| POST | `P/invoices/{paymentId}/pay?voucherVersion=2` | Session-Id (cookie) | `PaymentUpdatePayload`: `{ paymentGatewayType, razorPayPaymentId?, totalAmount?, date? }` | `{ status, body: string }` | logged only |

Callers: `src/utils/payment.ts:getPaymentMethods`, `src/utils/invoicePreview.ts:getPaymentMethods`, `src/utils/payment.ts:getPaymentMethodList`, `src/utils/payment.ts:getInvoicePayVoucherDetails`, `src/utils/payment.ts:getVoucherPaymentDetails`, `src/utils/payment.ts:updatePaymentStatus`; orchestrated by `src/components/PayNow.tsx:PayNow` (journey in [FLOWS](FLOWS.md)). The same `invoice-pay-request` URL is both "show me these vouchers" (array body) and "create a gateway order" (object body). `src/utils/invoicePreview.ts:getVoucherDetails` also posts the array form.

Per gateway, after the order is created:

| Gateway | Client side | Verification call |
|---|---|---|
| Razorpay | loads `https://checkout.razorpay.com/v1/checkout.js` <!-- verify:ignore -->; opens `window.Razorpay` with `key = paymentKey`, `order_id`, `amount`, `currency` | `pay` with `razorPayPaymentId`, `totalAmount`, `date` (dd-MM-yyyy) |
| PayPal | hidden form POST (`cmd=_xclick`, `business = paymentKey`) to a **hard-coded production** PayPal URL; `return` = current URL + `payment_id` | none from the client; nothing reads `payment_id` on return |
| PayU | opens `htmlString` from the order in a popup; waits for any window message whose `data.status` is set | `pay` with `{ paymentGatewayType: "PAYU" }` only |

> [!WARNING]
> - PayPal ignores `PAYPAL_URL` (sandbox in non-prod config); `src/components/PayNow.tsx` posts to the live PayPal URL in every environment. `PAYPAL_URL` is exposed by `src/hooks/useAppConfig.ts` but nothing reads it.
> - The PayU listener checks neither `event.origin` nor the payload beyond `status`, so any window that can post a message to the portal triggers the "paid" call. Payment truth must stay server-side; never trust the client signal.
> - Gateway credentials come only from the backend at runtime: `RAZORPAY.key`, `PAYPAL.businessEmail`, `PAYU.merchantKey` in `PaymentMethodsResponse`, and `paymentKey` in `PaymentDetailsResponse`. No gateway key is in this repo; keep it that way.

### Account statement

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `P/view-statement?page&count&from&to&sort` | Session-Id | dates dd-MM-yyyy | `AccountStatementResponse` | 401/403 |
| GET | `P/export-account-statement?...&fileType=pdf\|xlsx\|xls` | Session-Id | same | `{ status, message?, body?: { data (base64), type, name? } }` | 401/403 |

Callers: `src/utils/accountStatement.ts:getAccountStatement`, `src/utils/accountStatement.ts:downloadAccountStatement` (default `FileType.PDF`). Both encode company/account.

### White-label

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `{GIDDH_API_URL or GIDDH_API_URL_UK}/white-label` | none | none (browser `fetch`) | `{ body: WhiteLabelConfig }` | error stored in context; cached copy used |

Caller: `src/contexts/ConfigContext.tsx:ConfigProvider`, on every mount except `/magic` and `/magic.html`. No tenant parameter is sent; the backend must pick the white label from the request's `Origin`/host (inference). The response is cached under `localStorage.whiteLabel` and read synchronously by `getConfig()`.

### Magic link (public, no session)

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| GET | `{GIDDH_API_URL}/magic-link-ledger/{linkId}?sort&ledgerView&from&to&page\|token&reversePage&count&q&accountCurrency` | link id; pagination `token` also as header | none | `MagicLinkLedgerResponse` | `code: NOT_FOUND` → "link invalid or expired"; returned as `{ status: "error", message }` |
| GET | `{GIDDH_API_URL}/magic-link-ledger-balance/{linkId}?q&from&to&accountCurrency` | link id | none | `MagicLinkLedgerBalanceResponse` | same mapping |
| POST | `{GIDDH_API_URL}/magic-link/{linkId}/download-voucher?voucherVersion=2&downloadOption=VOUCHER` | link id | `{ voucherType, uniqueName? \| entryUniqueName? }` | blob | message toasted |
| GET | `{GIDDH_API_URL}/magic-link/{linkId}/download-invoice/{voucherNumber}` | link id | voucher version ≠ 2 | JSON with base64 `body` | same |
| POST | `.../download-voucher?voucherVersion=2&downloadOption=ATTACHMENT` | link id | `{ attachedFileUniqueName, voucherType?, uniqueName? \| entryUniqueName? }` | blob; JSON blob with `status: "error"` = failure | "Attachment cannot be downloaded now." |
| GET | `{GIDDH_API_URL}/magic-link/{linkId}/ledger/upload/{attachedFileUniqueName}` | link id | voucher version ≠ 2 | blob, name from `content-disposition` | same |

Callers: `src/utils/magic/getMagicLinkLedger.ts:getMagicLinkLedger` (via `src/utils/magic/getMagicLinkData.ts:getMagicLinkData`), `src/utils/magic/getMagicLinkLedgerBalance.ts:getMagicLinkLedgerBalance`, `src/utils/magic/downloadVoucher.ts:downloadMagicLinkVoucher`, `src/utils/magic/downloadVoucher.ts:downloadMagicLinkAttachment`. `linkId` is the `?id=` query of `/magic`. Bare `axios`, no `Session-Id`. Always the India/default `GIDDH_API_URL`, even for UK companies.

> [!NOTE]
> The magic-link helpers set `origin`, `referer` and `accept-language` request headers by hand. Browsers forbid scripts from setting `origin`/`referer` and drop them, so they have no effect; do not rely on them for backend checks.

### Next.js API route

| Method | Endpoint Path | Auth Required | Request Type | Response Type | Error Statuses |
|---|---|---|---|---|---|
| ANY (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD) | `/api/instance-metadata` | **none** | ignored | AWS EC2 instance identity document (IMDSv2, 3 s timeout) | 503 token/metadata failure, 504 timeout |

Handler: `src/app/api/instance-metadata/route.ts:GET` (all methods share `fetchInstanceMetadata`). Nothing in `src/` calls it (inference: a host/health probe for the deployment).

> [!WARNING]
> This route returns the server's AWS account id, region, instance id and private IP to any anonymous caller. It is the only server-side route in the app. Flagged for the owner; do not extend it.

## Authentication & Authorization Assumptions

- **Token Storage:** The session id lives in a **non-httpOnly cookie named `<company>-session`** (`src/utils/cookies.ts:setSessionCookie`, 7 days, `path=/`, no `Secure` flag, no SameSite attribute, so the browser default Lax applies). Note: the name is `<slug>-session`, not `session_<slug>`. Written only by `src/utils/auth/setupUserSession.ts:setupUserSession` with `session.id` from `save-session`.
- **What is sent where:** `apiClient` reads URL segment 1 as the company slug and sends `Session-Id: <cookie>` on every `/portal/...` call. Some helpers also pass a `Session-id` header themselves from `localStorage.token`, which nothing ever writes (dead path; the interceptor's value wins). Credentials are headers, never cookies sent cross-site (axios credentials mode is never enabled), so classic CSRF does not apply to the API; the trade-off is that any XSS can read the session (inference).
- **Login tokens:** MSG91 proxy token (`proxy_auth_token` query param on `/auth`), Google OAuth access token (scope `openid email profile`, via `https://accounts.google.com/gsi/client`) <!-- verify:ignore -->, or MSG91 OTP widget access token (`https://verify.msg91.com/otp-provider.js`) <!-- verify:ignore -->. Each is exchanged for a portal session through `verify-portal-user` + `save-session`. The token is then kept in `localStorage.proxy_auth_token` so the account switcher (`src/components/SwitchAccountButton.tsx`) can call `save-session` again without a new login.
- **Token Refresh Cycle:** None. There is no refresh call; when the backend answers 401 or 403, `apiClient` dispatches a `window` `session-expired` event (heard by `src/components/SessionVerification.tsx`), whose modal deletes the cookie and sends the user to `/<company>/<country>/login`. The event is suppressed on public routes (`/invoice/preview`, `/payment/preview`, `/invoice-pay`, `/auth`, `/login`) **and whenever `localStorage.proxy_auth_token` exists**.
- **Tenant Isolation:** By URL. The first path segment selects the cookie, the second selects IN vs UK base URL; one browser can hold sessions for several companies at once. The backend enforces that the session belongs to `companyUniqueName`/`accountUniqueName` in the path (inference; not checkable here).

> [!WARNING]
> `proxy_auth_token` is never removed (not by logout, not by the session-expired modal). After any login on a browser, 401/403s stop raising the session-expired modal for every company on that origin, so an expired session fails silently. Logout is `src/utils/logout.ts:logoutCompany` and clears only the cookie and the two `userData`/`userEmail` keys.

## Standard Error Envelope

```json
{ "status": "error", "message": "Human-readable reason", "code": "NOT_FOUND" }
```

There is no shared error mapper. Observed handling:

| Where | Behaviour |
|---|---|
| `apiClient` response interceptor | 401/403 → `session-expired` event (rules above), then rejects; no retry, no redirect inside the interceptor. Timeout 60 s. |
| Callers of `apiClient` | Read `error.response.data.message` for a toast (e.g. `PayNow`), else a fixed string. |
| Magic-link helpers | Never throw for ledger/balance: return `{ status: "error", message }`, mapping `code === "NOT_FOUND"` to a friendly sentence. Downloads throw with the API message. |
| `getPaymentList` | Swallows all errors, returns an empty list. |
| `logger` (`src/utils/logger.ts`) | Logs only when `NODE_ENV` is `development`; production errors are silent. |

A "success" HTTP 200 can still carry `status: "error"`; every caller checks `response.status === "success"` (`ApiResponseStatus.SUCCESS`).

## Persistence & Client Cache Contracts

| Store Name | Storage Key | Format | Owner / Invalidator |
|---|---|---|---|
| cookie | `<company>-session` | session id string | write `setupUserSession`; read `apiClient`, `SessionGuard`, `src/app/[company]/[country]/layout.tsx`, `Sidebar`, `src/app/[company]/[country]/login/page.tsx`, preview pages; delete `logoutCompany`, `SessionExpiredModal` |
| `localStorage` | `persist:companies` | redux-persist JSON of `CompanyState` (includes user email, account, cached lists) | `src/store/store.ts` (`key: "companies"`, `autoMergeLevel2`); cleared per company by `clearCompanyData` |
| `localStorage` | `userData:<company>` | JSON `{ email, account, vendorContactUniqueName, companyUniqueName, company, country }` | write `setupUserSession`; read `src/utils/getUserDataFromStorage.ts:getUserDataFromStorage`, `PayNow` (PayU prefill); delete `logoutCompany` |
| `localStorage` | `userEmail:<company>` | email string | write `setupUserSession`; read `getUserEmailFromStorage`; delete `logoutCompany` |
| `localStorage` | `userData`, `userEmail` (legacy, flat) | as above | read-only fallback; removed by `setupUserSession` |
| `localStorage` | `whiteLabel` | JSON `WhiteLabelConfig` | write `ConfigProvider`; read `getConfig`, `ConfigProvider` |
| `localStorage` | `proxy_auth_token` | MSG91 or Google/OTP token | write `/auth`, `/auth/[country]`, `[company]/[country]/auth`, `login`; read `apiClient`, `SwitchAccountButton`; never deleted |
| `localStorage` | `accessToken`, `authProvider` | token, `"google" \| "otp"` | write `src/app/[company]/[country]/login/page.tsx`; `authProvider` read by `src/app/[company]/[country]/auth/page.tsx`; `accessToken` never read |
| `localStorage` | `token` | — | read by `PayNow`, invoice and preview pages; **never written** (dead) |
| `localStorage` | `portalSidebarCollapsed` | `"true" \| "false"` | `src/contexts/SidebarContext.tsx` |
| `sessionStorage` | `pendingAccounts`, `pendingToken`, `pendingEmail`, `pendingTokenType` | account picker hand-off | `src/utils/sessionManager.ts:sessionManager` (`setPendingAuth` on multi-account login, `clearPendingAuth` after choice) |
| `sessionStorage` | `companyName`, `country` | strings | write `sessionManager.setCompanyData` and preview pages; read `/auth` pages to know where to return after proxy login |
| Redux (in memory + persisted) | `companies[<slug>].*` | per-slice `{ data, loading, error, lastFetchTimestamp }` | thunks in `companySlice.ts`; staleness `DATA_FRESHNESS_TTL` = 5 min; `invalidatePaymentsData` / `invalidateInvoicesData` after a payment |

> [!NOTE]
> Because `CompanyState` is persisted whole, `loading: true` can be rehydrated from a reload mid-request. The store is wrapped in `PersistGate` by `src/providers/ReduxProvider.tsx`. Treat persisted lists as a cache; the source of truth is the API.

## Analytics & Telemetry Event Contracts

None. No analytics, tag manager, error tracker or telemetry SDK is present (searched `src/` and `package.json` for gtag, GTM, PostHog, Mixpanel, Segment, Hotjar, Clarity, Sentry, Datadog). Third-party scripts loaded at runtime:

| Script | Loaded by | Purpose |
|---|---|---|
| `https://checkout.razorpay.com/v1/checkout.js` <!-- verify:ignore --> | `src/components/PayNow.tsx` | Razorpay checkout |
| `https://accounts.google.com/gsi/client` <!-- verify:ignore --> | `src/utils/auth/googleIdentity.ts:ensureGoogleSdk` | Google sign-in |
| `https://verify.msg91.com/otp-provider.js` <!-- verify:ignore --> | `src/utils/auth/msg91OtpWidget.ts:ensureOtpProviderScript` (cache-busted) | OTP widget, keys `OTP_WIDGET_ID`, `OTP_WIDGET_TOKEN` |
| `https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js` <!-- verify:ignore --> | invoice preview, payment preview, invoice-pay pages | MSG91 proxy login for guests, key `REFERENCE_ID` |

Client identifiers by name only: `GOOGLE_CLIENT_ID`, `OTP_WIDGET_ID`, `OTP_WIDGET_TOKEN`, `REFERENCE_ID`, `REFERENCE_ID_UK` are committed in `src/config/default.ts` and ship to the browser (they are public widget ids, but `OTP_WIDGET_TOKEN` is a token; see notes). `REFERENCE_ID_UK` is never used: guest login on UK preview pages uses the India `REFERENCE_ID`.

## Required / Unavailable Backend Capabilities

Do not build these as mocks; they need the backend first.

### Proposed Endpoint: `POST P/invoices/{paymentId}/verify` <!-- verify:ignore -->
- **Purpose:** PayPal and PayU have no client-verifiable completion (PayPal return is unread; PayU trusts any window message). The frontend needs one call that returns the server-verified status of a payment so it can show "paid" honestly and refresh lists.
- **Required Query/Body Parameters:**
  ```json
  { "paymentGatewayType": "PAYPAL | PAYU | RAZORPAY (required)" }
  ```
- **Expected Success Response (200 OK):**
  ```json
  { "status": "success", "body": { "paymentStatus": "PAID | PENDING | FAILED", "vouchers": ["uniqueName"] } }
  ```
- **Blocking Status:** Not implemented; need the backend owner to confirm whether `/pay` already verifies with the gateway.

### Proposed Endpoint: `POST {API_URL}/v2/portal-user/logout` <!-- verify:ignore -->
- **Purpose:** Logout only deletes the cookie; the session id stays valid server-side until `expiresAt`.
- **Required Query/Body Parameters:**
  ```json
  { "sessionId": "string (required, or from Session-Id header)" }
  ```
- **Expected Success Response (200 OK):**
  ```json
  { "status": "success" }
  ```
- **Blocking Status:** Not implemented.

## Stale claims in the old docs

`docs/API.md` and `docs/REDUX.md` are superseded by this file for endpoints and persistence:

- `docs/API.md` interceptor example (reads `localStorage.token`, sets `Session-id`, on 401 removes `token` and redirects to `/auth`) is **not the real code**. Real: cookie `<company>-session` → `Session-Id`; 401 **or 403** → `session-expired` event; no redirect in the interceptor; per-request base URL by country.
- `docs/API.md` "Token Storage: localStorage key token" and the "Security / Session Expiry" snippet: wrong, as above.
- `docs/API.md` section 5 cites `src/lib/api.ts` (does not exist) and wrong paths: `company-details` (real `get-company-details`), `balance-summary` (real `vouchers/balance-summary`), `account-details` (real `details`); shapes differ. <!-- verify:ignore -->
- `docs/API.md` white-label mapping: `proxyApiUrl → API_URL` and `giddhWhiteLabel.baseDomain → WEBSITE_DOMAIN` are not in code; `giddhWhiteLabel.apiDomain` feeds `API_URL` too; `logo` is `logos`.
- `docs/API.md` cURL example `GET .../invoices` does not exist (invoices are `POST vouchers/get-all`).
- `docs/REDUX.md` `fetchCompanyAddress` thunk does not exist; "flat `userData` key set by `setupUserSession`" is wrong (namespaced `userData:<company>`, flat key is removed); `getCompanyAndAccountNames` now takes the company slug first. <!-- verify:ignore -->
