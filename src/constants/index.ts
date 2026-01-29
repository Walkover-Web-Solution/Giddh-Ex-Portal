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

export const PAGINATION_LIMIT = 50;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

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
