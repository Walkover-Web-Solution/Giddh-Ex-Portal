/** Balance status values for invoice filtering and display */
export enum InvoiceBalanceStatus {
  PAID = "PAID",
  PARTIAL_PAID = "PARTIAL-PAID",
  UNPAID = "UNPAID",
  HOLD = "HOLD",
  CANCEL = "CANCEL",
  UNKNOWN = "UNKNOWN",
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  total: string;
  status: string;
  overdue: string;
  showPayNow: boolean;
}

/** Sortable column for invoice list */
export type InvoiceSortColumn = "Date" | "Total";
