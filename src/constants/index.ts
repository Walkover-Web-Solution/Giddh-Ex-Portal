export { HttpStatus } from "./httpStatus";
export { TIMING } from "./timing";
export {
  LEDGER_TYPE_DEBIT,
  LEDGER_TYPE_CREDIT,
  PARTICULAR_PREFIX_DEBIT,
  PARTICULAR_PREFIX_CREDIT,
  BALANCE_TYPE_DR,
  BALANCE_TYPE_CR,
  DEFAULT_CLOSING_AMOUNT,
} from "./ledger";
export type { LedgerTransactionType, BalanceType } from "./ledger";
export { SortOrder } from "./sort";
export type { SortOrderType } from "./sort";

/** Default page number (1-based) */
export const DEFAULT_PAGE = 1;

/** Page size for invoice and payment lists */
export const PAGINATION_LIMIT = 20;

/** Page size for account statement and magic ledger */
export const STATEMENT_PAGE_SIZE = 50;

export enum PAYMENT_METHODS_ENUM {
  RAZORPAY = "RAZORPAY",
  PAYPAL = "PAYPAL",
  PAYU = "PAYU",
}

/** Enum for file type */
export enum FileType {
  PDF = "pdf",
  XLSX = "xlsx",
}

/** MIME and extension per FileType for exports (account statement, etc.). */
export const EXPORT_FILE_CONFIG: Record<FileType, { mime: string; extension: string }> = {
  [FileType.PDF]: {
    mime: "application/pdf",
    extension: "pdf",
  },
  [FileType.XLSX]: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  },
};
