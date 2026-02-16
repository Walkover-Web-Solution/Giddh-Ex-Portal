import type { BalanceType, LedgerTransactionType } from "@/constants/ledger";

export interface ForwardedBalanceShape {
  amount: number;
  type: LedgerTransactionType;
  description?: string;
}

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
  attachedFileName?: string;
  attachedFileUniqueName?: string;
  transaction?: any;
}

export type Currency = string;
export type { LedgerView as ViewMode } from "@/constants/ledger";

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
