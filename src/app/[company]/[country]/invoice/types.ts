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
