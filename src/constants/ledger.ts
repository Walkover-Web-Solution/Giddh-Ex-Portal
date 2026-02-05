/** Ledger transaction type values */
export const LEDGER_TYPE_DEBIT = "DEBIT" as const;
export const LEDGER_TYPE_CREDIT = "CREDIT" as const;

/** Type for DEBIT | CREDIT (ledger entry / transaction type) */
export type LedgerTransactionType = typeof LEDGER_TYPE_DEBIT | typeof LEDGER_TYPE_CREDIT;

/** Prefix for particular field in display */
export const PARTICULAR_PREFIX_DEBIT = "To ";
export const PARTICULAR_PREFIX_CREDIT = "By ";

/** Balance type display labels */
export const BALANCE_TYPE_DR = "Dr" as const;
export const BALANCE_TYPE_CR = "Cr" as const;

/** Type for Dr | Cr (balance type in statement display) */
export type BalanceType = typeof BALANCE_TYPE_DR | typeof BALANCE_TYPE_CR;

/** Default amount for missing closing */
export const DEFAULT_CLOSING_AMOUNT = 0;

/** Magic link ledger view (UI state & API param) */
export enum LedgerView {
  STATEMENT_VIEW = "STATEMENT_VIEW",
  T_VIEW = "T_VIEW",
}

/** Display label for each ledger view */
export const LEDGER_VIEW_LABEL: Record<LedgerView, string> = {
  [LedgerView.STATEMENT_VIEW]: "Statement View",
  [LedgerView.T_VIEW]: "T View",
};
