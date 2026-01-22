import { LedgerTransaction } from "./getMagicLinkLedger";
import { Transaction } from "@/components/magic/types";

/**
 * Transforms a LedgerTransaction into a Transaction display format
 * @param tx - The ledger transaction to transform
 * @param includeOriginalTx - Whether to include the original tx reference (needed for downloads)
 * @returns A Transaction object ready for display
 */
export function transformLedgerTransactionToDisplay(
  tx: LedgerTransaction,
  includeOriginalTx: boolean = false
): Transaction & { tx?: LedgerTransaction } {
  const isDebit = tx.type === "DEBIT";
  const closing = tx.closing || { amount: 0, convertedAmount: 0, type: "DEBIT" as const };

  const transaction: Transaction & { tx?: LedgerTransaction } = {
    date: tx.entryDate,
    particular: tx.particular.name,
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
