/** Invoice/balance status values (normalized: uppercase, spaces as hyphen) */
export enum InvoiceBalanceStatus {
  UNPAID = "UNPAID",
  PARTIAL_PAID = "PARTIAL-PAID",
  PAID = "PAID",
  HOLD = "HOLD",
  CANCEL = "CANCEL",
  UNKNOWN = "UNKNOWN",
}
