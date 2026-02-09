import {
  BALANCE_TYPE_CR,
  BALANCE_TYPE_DR,
  DEFAULT_CLOSING_AMOUNT,
  LEDGER_TYPE_CREDIT,
  LEDGER_TYPE_DEBIT,
  PARTICULAR_PREFIX_CREDIT,
  PARTICULAR_PREFIX_DEBIT,
} from "@/constants/ledger";
import { Transaction } from "@/components/magic/types";
import { LedgerTransaction } from "./getMagicLinkLedger";

/**
 * Transforms a LedgerTransaction into a Transaction display format
 * @param tx - The ledger transaction to transform
 * @param includeOriginalTx - Whether to include the original tx reference (needed for downloads)
 * @returns A Transaction object ready for display
 */
/**
 * Formats the particular field with appropriate prefix based on transaction type
 * @param particular - The particular name
 * @param type - The transaction type (DEBIT or CREDIT)
 * @returns Formatted particular with prefix
 */
export function formatParticularWithPrefix(
  particular: string,
  type: typeof LEDGER_TYPE_DEBIT | typeof LEDGER_TYPE_CREDIT
): string {
  if (type === LEDGER_TYPE_DEBIT) {
    return `${PARTICULAR_PREFIX_DEBIT}${particular}`;
  }
  return `${PARTICULAR_PREFIX_CREDIT}${particular}`;
}

export function transformLedgerTransactionToDisplay(
  tx: LedgerTransaction,
  includeOriginalTx: boolean = false
): Transaction & { tx?: LedgerTransaction } {
  const isDebit = tx.type === LEDGER_TYPE_DEBIT;
  const closing = tx.closing || {
    amount: DEFAULT_CLOSING_AMOUNT,
    convertedAmount: DEFAULT_CLOSING_AMOUNT,
    type: LEDGER_TYPE_DEBIT,
  };

  const transaction: Transaction & { tx?: LedgerTransaction } = {
    date: tx.entryDate,
    particular: formatParticularWithPrefix(tx.particular.name, tx.type),
    debit: isDebit ? tx.amount : null,
    debitConverted: isDebit && tx.convertedAmount ? tx.convertedAmount : null,
    credit: !isDebit ? tx.amount : null,
    creditConverted: !isDebit && tx.convertedAmount ? tx.convertedAmount : null,
    closingBalance: closing.amount,
    closingBalanceConverted: closing.convertedAmount ?? closing.amount,
    balanceType: closing.type === LEDGER_TYPE_DEBIT ? BALANCE_TYPE_DR : BALANCE_TYPE_CR,
    voucherGenerated: tx.voucherGenerated ?? false,
    voucherNumber: tx.voucherNumber,
    voucherName: tx.voucherName,
    voucherUniqueName: tx.voucherUniqueName,
    entryUniqueName: tx.entryUniqueName,
  };

  if (includeOriginalTx) {
    transaction.tx = tx;
  }

  return transaction;
}
