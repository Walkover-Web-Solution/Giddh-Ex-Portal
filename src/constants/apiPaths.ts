/**
 * Portal API path builders (used with apiClient; base URL is set in apiClient).
 * Company and account are encoded where required for query/URL safety.
 */
const portalAccount = (company: string, account: string, encode = false) => {
  const c = encode ? encodeURIComponent(company) : company;
  const a = encode ? encodeURIComponent(account) : account;
  return `/portal/company/${c}/accounts/${a}`;
};

export const API_PATHS = {
  /** GET account details */
  accountDetails: (c: string, a: string) => `${portalAccount(c, a)}/details`,

  /** GET company details */
  companyDetails: (c: string, a: string) => `${portalAccount(c, a)}/get-company-details`,

  /** GET contacts list */
  contacts: (c: string, a: string) => `${portalAccount(c, a)}/contacts`,

  /** GET payment methods (voucherVersion=2) */
  paymentMethods: (c: string, a: string) =>
    `${portalAccount(c, a)}/payment-methods?voucherVersion=2`,

  /** GET payment methods (no query - used by invoice preview) */
  paymentMethodsBase: (c: string, a: string) => `${portalAccount(c, a)}/payment-methods`,

  /** POST invoice pay request */
  invoicePayRequest: (c: string, a: string) =>
    `${portalAccount(c, a)}/invoice-pay-request?voucherVersion=2`,

  /** POST update payment / pay */
  invoicePay: (c: string, a: string, paymentId: string) =>
    `${portalAccount(c, a)}/invoices/${encodeURIComponent(paymentId)}/pay?voucherVersion=2`,

  /** POST download file (base64, voucherVersion=2); company/account encoded */
  downloadFile: (c: string, a: string) =>
    `${portalAccount(c, a, true)}/download-file?voucherVersion=2&fileType=base64`,

  /** POST download file (base path; params passed separately) */
  downloadFileBase: (c: string, a: string) => `${portalAccount(c, a)}/download-file`,

  /** POST vouchers get-all */
  vouchersGetAll: (c: string, a: string) => `${portalAccount(c, a)}/vouchers/get-all`,

  /** GET vouchers balance summary */
  vouchersBalanceSummary: (c: string, a: string) =>
    `${portalAccount(c, a)}/vouchers/balance-summary`,

  /** GET payment vouchers list (receipt type, single uniqueName) */
  paymentVouchersList: (c: string, a: string, uniqueName: string) =>
    `${portalAccount(c, a, true)}/vouchers?type=receipt&page=1&count=10&uniqueNames=${encodeURIComponent(uniqueName)}&voucherVersion=2`,

  /** GET view statement */
  viewStatement: (
    c: string,
    a: string,
    page: number,
    count: number,
    from: string,
    to: string,
    sort: string
  ) =>
    `${portalAccount(c, a, true)}/view-statement?page=${page}&count=${count}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sort=${encodeURIComponent(sort)}`,

  /** GET export account statement */
  exportAccountStatement: (
    c: string,
    a: string,
    page: number,
    count: number,
    from: string,
    to: string,
    sort: string
  ) =>
    `${portalAccount(c, a, true)}/export-account-statement?page=${page}&count=${count}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&sort=${encodeURIComponent(sort)}`,

  /** GET voucher comments */
  voucherComments: (c: string, a: string, voucherUniqueName: string) =>
    `${portalAccount(c, a)}/${encodeURIComponent(voucherUniqueName)}/comments?voucherVersion=2`,

  /** POST add comment to voucher */
  voucherAddComment: (c: string, a: string, voucherUniqueName: string) =>
    `${portalAccount(c, a)}/${encodeURIComponent(voucherUniqueName)}/add-comment?voucherVersion=2`,
} as const;

/**
 * Proxy API path suffixes.
 * - VERIFY_PORTAL_USER, SAVE_SESSION: base URL from NEXT_PUBLIC_API_URL
 * - GET_DETAILS: base URL from NEXT_PUBLIC_PROXY_URL
 */
export const PROXY_API_PATHS = {
  VERIFY_PORTAL_USER: "v2/verify-portal-user",
  SAVE_SESSION: "v2/portal-user/save-session",
  GET_DETAILS: "api/c/getDetails",
} as const;
