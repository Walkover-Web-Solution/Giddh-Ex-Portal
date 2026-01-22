import { LedgerTransaction } from "./getMagicLinkLedger";
import { Transaction } from "@/components/magic/types";

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
export function formatParticularWithPrefix(particular: string, type: "DEBIT" | "CREDIT"): string {
  if (type === "DEBIT") {
    return `To ${particular}`;
  } else {
    return `By ${particular}`;
  }
}

export function transformLedgerTransactionToDisplay(
  tx: LedgerTransaction,
  includeOriginalTx: boolean = false
): Transaction & { tx?: LedgerTransaction } {
  const isDebit = tx.type === "DEBIT";
  const closing = tx.closing || { amount: 0, convertedAmount: 0, type: "DEBIT" as const };

  const transaction: Transaction & { tx?: LedgerTransaction } = {
    date: tx.entryDate,
    particular: formatParticularWithPrefix(tx.particular.name, tx.type),
    debit: isDebit ? tx.amount : null,
    debitConverted: isDebit && tx.convertedAmount ? tx.convertedAmount : null,
    credit: !isDebit ? tx.amount : null,
    creditConverted: !isDebit && tx.convertedAmount ? tx.convertedAmount : null,
    closingBalance: closing.amount,
    closingBalanceConverted: closing.convertedAmount ?? closing.amount,
    balanceType: closing.type === "DEBIT" ? "Dr" : "Cr",
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
