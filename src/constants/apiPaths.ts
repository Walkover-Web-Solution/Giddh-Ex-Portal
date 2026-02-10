/**
 * Portal API path builders (used with apiClient; base URL is set in apiClient).
 * Company and account are encoded where required for query/URL safety.
 */
const portalAccount = (company: string, account: string, encode = false) => {
  const companySegment = encode ? encodeURIComponent(company) : company;
  const accountSegment = encode ? encodeURIComponent(account) : account;
  return `/portal/company/${companySegment}/accounts/${accountSegment}`;
};

export const API_PATHS = {
  /** GET account details */
  accountDetails: (company: string, account: string) =>
    `${portalAccount(company, account)}/details`,

  /** GET company details */
  companyDetails: (company: string, account: string) =>
    `${portalAccount(company, account)}/get-company-details`,

  /** GET contacts list */
  contacts: (company: string, account: string) => `${portalAccount(company, account)}/contacts`,

  /** GET payment methods (voucherVersion=2) */
  paymentMethods: (company: string, account: string) =>
    `${portalAccount(company, account)}/payment-methods?voucherVersion=2`,

  /** GET payment methods (no query - used by invoice preview) */
  paymentMethodsBase: (company: string, account: string) =>
    `${portalAccount(company, account)}/payment-methods`,

  /** POST invoice pay request */
  invoicePayRequest: (company: string, account: string) =>
    `${portalAccount(company, account)}/invoice-pay-request?voucherVersion=2`,

  /** POST update payment / pay */
  invoicePay: (company: string, account: string, paymentId: string) =>
    `${portalAccount(company, account)}/invoices/${encodeURIComponent(paymentId)}/pay?voucherVersion=2`,

  /** POST download file (base64, voucherVersion=2); company/account encoded */
  downloadFile: (company: string, account: string) =>
    `${portalAccount(company, account, true)}/download-file?voucherVersion=2&fileType=base64`,

  /** POST download file (base path; params passed separately) */
  downloadFileBase: (company: string, account: string) =>
    `${portalAccount(company, account)}/download-file`,

  /** POST vouchers get-all */
  vouchersGetAll: (company: string, account: string) =>
    `${portalAccount(company, account)}/vouchers/get-all`,

  /** GET vouchers balance summary */
  vouchersBalanceSummary: (company: string, account: string) =>
    `${portalAccount(company, account)}/vouchers/balance-summary`,

  /** GET payment vouchers list (receipt type, single uniqueName) */
  paymentVouchersList: (company: string, account: string, uniqueName: string) =>
    `${portalAccount(company, account, true)}/vouchers?type=receipt&page=1&count=10&uniqueNames=${encodeURIComponent(uniqueName)}&voucherVersion=2`,

  /** GET view statement */
  viewStatement: (
    company: string,
    account: string,
    page: number,
    count: number,
    from: string,
    to: string,
    sort: string
  ) =>
    `${portalAccount(company, account, true)}/view-statement?page=${page}&count=${count}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sort=${encodeURIComponent(sort)}`,

  /** GET export account statement (fileType: pdf | xlsx | xls) */
  exportAccountStatement: (
    company: string,
    account: string,
    page: number,
    count: number,
    from: string,
    to: string,
    sort: string,
    fileType: string
  ) =>
    `${portalAccount(company, account, true)}/export-account-statement?page=${page}&count=${count}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sort=${encodeURIComponent(sort)}&fileType=${fileType}`,

  /** GET voucher comments */
  voucherComments: (company: string, account: string, voucherUniqueName: string) =>
    `${portalAccount(company, account)}/${encodeURIComponent(voucherUniqueName)}/comments?voucherVersion=2`,

  /** POST add comment to voucher */
  voucherAddComment: (company: string, account: string, voucherUniqueName: string) =>
    `${portalAccount(company, account)}/${encodeURIComponent(voucherUniqueName)}/add-comment?voucherVersion=2`,
} as const;

/**
 * Proxy API path suffixes.
 * - VERIFY_PORTAL_USER, SAVE_SESSION: base URL from API_URL
 * - GET_DETAILS: base URL from PROXY_URL
 */
export const PROXY_API_PATHS = {
  VERIFY_PORTAL_USER: "v2/verify-portal-user",
  SAVE_SESSION: "v2/portal-user/save-session",
  GET_DETAILS: "api/c/getDetails",
} as const;

/**
 * Giddh Magic Link API path builders (used with config.GIDDH_API_URL as base).
 */
export const GIDDH_MAGIC_LINK_PATHS = {
  /** GET ledger transactions (append ?sort=...&ledgerView=...&from=...&to=...) */
  ledger: (linkId: string) => `/magic-link-ledger/${encodeURIComponent(linkId)}`,
  /** GET ledger balance summary for footer */
  ledgerBalance: (linkId: string) => `/magic-link-ledger-balance/${encodeURIComponent(linkId)}`,
} as const;
