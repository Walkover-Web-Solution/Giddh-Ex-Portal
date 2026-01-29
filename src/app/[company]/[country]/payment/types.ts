export interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: string;
  paymentAccount: string;
  unusedAmount: string;
}

/** Sortable column for payment list (includes Payment ID from sort dropdown) */
export type PaymentSortColumn = "Date" | "Amount" | "Payment ID";
