export interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: string;
  paymentAccount: string;
  unusedAmount: string;
}

/** Sortable column for payment list */
export type PaymentSortColumn = "Date" | "Amount";
