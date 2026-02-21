import {
  BALANCE_TYPE_DR,
  BALANCE_TYPE_CR,
  type BalanceType,
  type LedgerTransactionType,
} from "@/constants/ledger";
import type { MagicLinkLedgerBalanceBody } from "./getMagicLinkLedgerBalance";

export interface FooterSummary {
  totalTransactions: number;
  debitCount: number;
  creditCount: number;
  openingBalance?: number;
  openingBalanceType?: BalanceType;
  netTotalCredit: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance?: number;
  closingBalanceType?: BalanceType;
  convertedTotalDebit?: number;
  convertedTotalCredit?: number;
  convertedClosingBalance?: number;
  convertedClosingBalanceType?: BalanceType;
  convertedOpeningBalance?: number;
  convertedOpeningBalanceType?: BalanceType;
}

function toDrCr(type: LedgerTransactionType): BalanceType {
  return type === "DEBIT" ? BALANCE_TYPE_DR : BALANCE_TYPE_CR;
}

export function buildFooterSummary(params: {
  ledgerBalance: MagicLinkLedgerBalanceBody | undefined | null;
  forwardedBalance: { amount: number; type: LedgerTransactionType } | undefined | null;
  apiTotalTransactions?: number;
  apiDebitCount?: number;
  apiCreditCount?: number;
}): FooterSummary {
  const {
    ledgerBalance,
    forwardedBalance,
    apiTotalTransactions = 0,
    apiDebitCount = 0,
    apiCreditCount = 0,
  } = params;

  // Always use API counts only; no fallback to client-side array counts
  const totalTransactions = apiTotalTransactions;
  const debitCount = apiDebitCount;
  const creditCount = apiCreditCount;

  if (ledgerBalance) {
    return {
      totalTransactions,
      debitCount,
      creditCount,
      openingBalance: ledgerBalance.forwardedBalance?.amount,
      openingBalanceType: ledgerBalance.forwardedBalance
        ? toDrCr(ledgerBalance.forwardedBalance.type)
        : undefined,
      netTotalCredit: ledgerBalance.creditTotal,
      totalDebit: ledgerBalance.debitTotal,
      totalCredit: ledgerBalance.creditTotal,
      closingBalance: ledgerBalance.closingBalance?.amount,
      closingBalanceType: ledgerBalance.closingBalance
        ? toDrCr(ledgerBalance.closingBalance.type)
        : undefined,
      convertedTotalDebit: ledgerBalance.convertedDebitTotal,
      convertedTotalCredit: ledgerBalance.convertedCreditTotal,
      convertedClosingBalance: ledgerBalance.convertedClosingBalance?.amount,
      convertedClosingBalanceType: ledgerBalance.convertedClosingBalance
        ? toDrCr(ledgerBalance.convertedClosingBalance.type)
        : undefined,
      convertedOpeningBalance: ledgerBalance.convertedForwardedBalance?.amount,
      convertedOpeningBalanceType: ledgerBalance.convertedForwardedBalance
        ? toDrCr(ledgerBalance.convertedForwardedBalance.type)
        : undefined,
    };
  }

  return {
    totalTransactions,
    debitCount,
    creditCount,
    openingBalance: forwardedBalance?.amount,
    openingBalanceType: forwardedBalance ? toDrCr(forwardedBalance.type) : undefined,
    netTotalCredit: 0,
    totalDebit: 0,
    totalCredit: 0,
  };
}
