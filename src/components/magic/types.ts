export interface Transaction {
  date: string;
  particular: string;
  debit: number | null;
  credit: number | null;
  closingBalance: number;
  balanceType: "Dr" | "Cr";
  creditCurrency?: string;
}

export type Currency = "INR" | "GBP";
export type ViewMode = "statement" | "t";

export interface SummaryData {
  totalDebit: number;
  totalCredit: number;
  totalTransactions: number;
  debitCount: number;
  creditCount: number;
  openingBalance: number;
  openingBalanceType: "Dr" | "Cr";
  netTotalCredit: number;
  closingBalance: number;
  closingBalanceType: "Dr" | "Cr";
}
