/** Ledger transaction type values */
export const LEDGER_TYPE_DEBIT = "DEBIT" as const;
export const LEDGER_TYPE_CREDIT = "CREDIT" as const;

/** Prefix for particular field in display */
export const PARTICULAR_PREFIX_DEBIT = "To ";
export const PARTICULAR_PREFIX_CREDIT = "By ";

/** Balance type display labels */
export const BALANCE_TYPE_DR = "Dr" as const;
export const BALANCE_TYPE_CR = "Cr" as const;

/** Default amount for missing closing */
export const DEFAULT_CLOSING_AMOUNT = 0;
