export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  total: string;
  status: string;
  overdue: string;
}

/** Sortable column for invoice list */
export type InvoiceSortColumn = "Date" | "Total";
