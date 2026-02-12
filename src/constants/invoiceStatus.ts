/** Invoice/balance status values (normalized: uppercase, spaces as hyphen) */
export enum InvoiceBalanceStatus {
  UNPAID = "UNPAID",
  PARTIAL_PAID = "PARTIAL-PAID",
  PAID = "PAID",
  HOLD = "HOLD",
  CANCEL = "CANCEL",
  UNKNOWN = "UNKNOWN",
}

/** Display label for each balance status (single source of truth) */
export const INVOICE_BALANCE_STATUS_LABELS: Record<InvoiceBalanceStatus, string> = {
  [InvoiceBalanceStatus.PAID]: "Paid",
  [InvoiceBalanceStatus.PARTIAL_PAID]: "Partial Paid",
  [InvoiceBalanceStatus.UNPAID]: "Unpaid",
  [InvoiceBalanceStatus.HOLD]: "Hold",
  [InvoiceBalanceStatus.CANCEL]: "Cancel",
  [InvoiceBalanceStatus.UNKNOWN]: "Unknown",
};
