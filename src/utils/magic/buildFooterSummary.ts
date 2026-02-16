import {
  BALANCE_TYPE_DR,
  BALANCE_TYPE_CR,
  LedgerView,
  type BalanceType,
  type LedgerTransactionType,
} from "@/constants/ledger";
import type { MagicLinkLedgerBalanceBody } from "./getMagicLinkLedgerBalance";
import type { LedgerTransaction } from "./getMagicLinkLedger";

export interface FooterSummary {
  totalTransactions: number;
  debitCount: number;
  creditCount: number;
  openingBalance: number;
  openingBalanceType: BalanceType;
  netTotalCredit: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingBalanceType: BalanceType;
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

function getCounts(
  viewMode: LedgerView,
  statement: LedgerTransaction[] | undefined | null,
  debitList: LedgerTransaction[] | undefined | null,
  creditList: LedgerTransaction[] | undefined | null,
  hasForwardedBalance: boolean
) {
  const totalTransactions =
    viewMode === LedgerView.STATEMENT_VIEW
      ? (statement?.length ?? 0) + (hasForwardedBalance ? 1 : 0)
      : Math.max(debitList?.length ?? 0, creditList?.length ?? 0);
  const debitCount =
    viewMode === LedgerView.STATEMENT_VIEW
      ? (statement?.filter((t) => t.type === "DEBIT").length ?? 0)
      : (debitList?.length ?? 0);
  const creditCount =
    viewMode === LedgerView.STATEMENT_VIEW
      ? (statement?.filter((t) => t.type === "CREDIT").length ?? 0)
      : (creditList?.length ?? 0);
  return { totalTransactions, debitCount, creditCount };
}

export function buildFooterSummary(params: {
  ledgerBalance: MagicLinkLedgerBalanceBody | undefined | null;
  forwardedBalance: { amount: number; type: LedgerTransactionType } | undefined | null;
  viewMode: LedgerView;
  filteredDebitCreditTransactions: LedgerTransaction[] | undefined | null;
  filteredDebitTransactions: LedgerTransaction[] | undefined | null;
  filteredCreditTransactions: LedgerTransaction[] | undefined | null;
  apiTotalTransactions?: number;
}): FooterSummary {
  const {
    ledgerBalance,
    forwardedBalance,
    viewMode,
    filteredDebitCreditTransactions,
    filteredDebitTransactions,
    filteredCreditTransactions,
    apiTotalTransactions,
  } = params;

  const countsFromData = getCounts(
    viewMode,
    filteredDebitCreditTransactions,
    filteredDebitTransactions,
    filteredCreditTransactions,
    Boolean(forwardedBalance)
  );

  const totalTransactions =
    viewMode === LedgerView.STATEMENT_VIEW && apiTotalTransactions != null
      ? apiTotalTransactions
      : countsFromData.totalTransactions;
  const { debitCount, creditCount } = countsFromData;

  if (ledgerBalance) {
    return {
      totalTransactions,
      debitCount,
      creditCount,
      openingBalance: ledgerBalance.forwardedBalance.amount,
      openingBalanceType: toDrCr(ledgerBalance.forwardedBalance.type),
      netTotalCredit: ledgerBalance.creditTotal,
      totalDebit: ledgerBalance.debitTotal,
      totalCredit: ledgerBalance.creditTotal,
      closingBalance: ledgerBalance.closingBalance.amount,
      closingBalanceType: toDrCr(ledgerBalance.closingBalance.type),
      convertedTotalDebit: ledgerBalance.convertedDebitTotal,
      convertedTotalCredit: ledgerBalance.convertedCreditTotal,
      convertedClosingBalance: ledgerBalance.convertedClosingBalance.amount,
      convertedClosingBalanceType: toDrCr(ledgerBalance.convertedClosingBalance.type),
      convertedOpeningBalance: ledgerBalance.convertedForwardedBalance.amount,
      convertedOpeningBalanceType: toDrCr(ledgerBalance.convertedForwardedBalance.type),
    };
  }

  return {
    totalTransactions,
    debitCount,
    creditCount,
    openingBalance: forwardedBalance?.amount ?? 0,
    openingBalanceType: forwardedBalance ? toDrCr(forwardedBalance.type) : BALANCE_TYPE_DR,
    netTotalCredit: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
    closingBalanceType: BALANCE_TYPE_DR,
  };
}
