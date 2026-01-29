import type { BalanceType } from "@/constants/ledger";

export interface Transaction {
  date: string;
  particular: string;
  debit: number | null;
  debitConverted: number | null;
  credit: number | null;
  creditConverted: number | null;
  closingBalance: number;
  closingBalanceConverted: number;
  balanceType: BalanceType;
  voucherGenerated?: boolean;
  voucherNumber?: string;
  voucherName?: string;
  voucherUniqueName?: string;
  entryUniqueName?: string;
  tx?: any; // Using any to avoid circular dependency, but should be LedgerTransaction
}

export type Currency = string;
export type { MagicLinkViewMode as ViewMode } from "@/constants/ledger";

export interface CurrencyInfo {
  code: string;
  symbol: string;
}

export interface CurrencyData {
  transactionCurrency: CurrencyInfo;
  convertedCurrency: CurrencyInfo;
  companyCurrency: CurrencyInfo;
}

export interface SummaryData {
  totalDebit: number;
  totalCredit: number;
  totalTransactions: number;
  debitCount: number;
  creditCount: number;
  openingBalance: number;
  openingBalanceType: BalanceType;
  netTotalCredit: number;
  closingBalance: number;
  closingBalanceType: BalanceType;
  reckoningDebitTotal?: number;
  reckoningCreditTotal?: number;
}
