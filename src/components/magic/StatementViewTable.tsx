"use client";

import { Currency, CurrencyInfo, Transaction } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";
import { downloadMagicLinkVoucher } from "@/utils/magic/downloadVoucher";
import { useState, useMemo } from "react";
import { getCurrencyConfig, getPrimaryAmount, getSecondaryAmount } from "./currencyUtils";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { transformLedgerTransactionToDisplay } from "@/utils/magic/transformLedgerTransaction";
import { useToast } from "@/contexts/ToastContext";

interface Props {
  selectedCurrency: Currency;
  debitCreditTransactions?: LedgerTransaction[];
  forwardedBalance?: {
    amount: number;
    type: "DEBIT" | "CREDIT";
    description?: string;
  };
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  linkId: string;
}

export function StatementViewTable({
  selectedCurrency,
  debitCreditTransactions,
  forwardedBalance,
  transactionCurrency,
  convertedCurrency,
  linkId,
}: Props) {
  const { showToast } = useToast();
  const [downloadingTransactionId, setDownloadingTransactionId] = useState<string | null>(null);
  const [downloadingVouchers, setDownloadingVouchers] = useState<Set<string>>(new Set());

  // Calculate totals from debitCreditTransactions
  const { totalDebit, totalCredit } = useMemo(() => {
    if (!debitCreditTransactions || debitCreditTransactions.length === 0) {
      return { totalDebit: 0, totalCredit: 0 };
    }

    const debit = debitCreditTransactions
      .filter((tx) => tx.type === "DEBIT")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const credit = debitCreditTransactions
      .filter((tx) => tx.type === "CREDIT")
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return { totalDebit: debit, totalCredit: credit };
  }, [debitCreditTransactions]);

  const handleDownload = async (tx: LedgerTransaction, index: number) => {
    if (!tx.voucherNumber || !tx.voucherName) {
      console.error("Missing voucher information for download");
      return;
    }

    // Always include index to ensure uniqueness even when entryUniqueName is duplicated
    const transactionId = `tx-${index}-${tx.entryUniqueName || tx.voucherNumber || "tx"}`;

    // Create a unique key for this voucher to prevent duplicate downloads
    const voucherKey = `${tx.voucherNumber}-${tx.voucherUniqueName || tx.entryUniqueName || transactionId}`;

    // Prevent multiple downloads of the same voucher or if this specific button is already downloading
    if (downloadingVouchers.has(voucherKey) || downloadingTransactionId === transactionId) {
      return;
    }

    setDownloadingTransactionId(transactionId);
    setDownloadingVouchers((prev) => new Set(prev).add(voucherKey));

    try {
      await downloadMagicLinkVoucher({
        linkId,
        voucherNumber: tx.voucherNumber,
        voucherName: tx.voucherName,
        voucherUniqueName: tx.voucherUniqueName,
        entryUniqueName: tx.entryUniqueName,
        voucherVersion: 2,
      });
    } catch (error: any) {
      console.error("Error downloading voucher:", error);
      showToast(
        error.message || `Invoice for ${tx.voucherNumber} cannot be downloaded now.`,
        "error"
      );
    } finally {
      setDownloadingTransactionId(null);
      setDownloadingVouchers((prev) => {
        const next = new Set(prev);
        next.delete(voucherKey);
        return next;
      });
    }
  };

  // Transform debitCreditTransactions using shared utility function
  const displayTransactions = useMemo(() => {
    if (!debitCreditTransactions || debitCreditTransactions.length === 0) {
      return [];
    }

    // Use shared utility function to transform, including original tx reference for downloads
    const transactions: Array<Transaction & { tx: LedgerTransaction }> =
      debitCreditTransactions.map(
        (tx) =>
          transformLedgerTransactionToDisplay(tx, true) as Transaction & { tx: LedgerTransaction }
      );

    // Add forwarded balance at the beginning if it exists
    if (forwardedBalance) {
      transactions.unshift({
        date: "", // Will be set from date range if available
        particular: forwardedBalance.description || "To Balance b/d",
        debit: null,
        debitConverted: null,
        credit: null,
        creditConverted: null,
        closingBalance: forwardedBalance.amount,
        closingBalanceConverted: forwardedBalance.amount,
        balanceType: forwardedBalance.type === "DEBIT" ? "Dr" : "Cr",
        voucherGenerated: false,
        voucherNumber: undefined,
        voucherName: undefined,
        voucherUniqueName: undefined,
        entryUniqueName: undefined,
        tx: {} as LedgerTransaction, // Placeholder, won't be used
      } as Transaction & { tx: LedgerTransaction });
    }

    return transactions;
  }, [debitCreditTransactions, forwardedBalance]);
  const currencyConfig = getCurrencyConfig(
    selectedCurrency,
    transactionCurrency,
    convertedCurrency
  );
  const { hasMultipleCurrencies, isConvertedCurrencySelected, primaryCurrency, secondaryCurrency } =
    currencyConfig;

  const format = (amount: number | null, symbol?: string) => {
    if (amount === null) return "-";
    return formatCurrencyAmount(amount, symbol || "₹", { decimals: 2 });
  };

  // Helper to get amount based on currency selection
  const getAmount = (
    amount: number | null,
    convertedAmount: number | null,
    useConverted: boolean
  ) => {
    if (useConverted && convertedAmount !== null) {
      return convertedAmount;
    }
    return amount;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-900/30 bg-white">
      <div className="min-w-[640px]">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-2 py-2 text-left uppercase sm:px-4 sm:py-4">Date</th>
              <th className="px-2 py-2 text-left uppercase sm:px-4 sm:py-4">Particular</th>
              <th className="px-2 py-2 text-right uppercase sm:px-4 sm:py-4">Debit</th>
              <th className="px-2 py-2 text-right uppercase sm:px-4 sm:py-4">Credit</th>
              <th className="px-2 py-2 text-right uppercase sm:px-4 sm:py-4">Closing Balance</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-900/10">
            {displayTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-sm text-gray-500 sm:px-4">
                  No transactions found
                </td>
              </tr>
            ) : (
              displayTransactions.map((item, i) => {
                // Always include index to ensure uniqueness even when entryUniqueName is duplicated
                const transactionId = `tx-${i}-${item.entryUniqueName ?? item.voucherNumber ?? "tx"}`;
                const isDownloadingThis = downloadingTransactionId === transactionId;

                return (
                  <tr key={i}>
                    <td className="px-2 py-2 sm:px-4 sm:py-4">{item.date}</td>

                    <td className="px-2 py-2 sm:px-4 sm:py-4">{item.particular}</td>

                    <td className="px-2 py-2 sm:px-4 sm:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right leading-tight">
                          <div className="font-medium">
                            {format(
                              getAmount(
                                item.debit,
                                item.debitConverted,
                                isConvertedCurrencySelected
                              ),
                              primaryCurrency?.symbol
                            )}
                          </div>

                          {hasMultipleCurrencies &&
                            getAmount(
                              item.debit,
                              item.debitConverted,
                              !isConvertedCurrencySelected
                            ) !== null && (
                              <div className="text-[10px] text-blue-900/60 sm:text-xs">
                                {format(
                                  getAmount(
                                    item.debit,
                                    item.debitConverted,
                                    !isConvertedCurrencySelected
                                  ),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>

                        {item.debit !== null &&
                          item.voucherGenerated &&
                          item.voucherNumber &&
                          item.tx && (
                            <button
                              onClick={() => handleDownload(item.tx, i)}
                              disabled={isDownloadingThis}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 hover:bg-blue-900/10 disabled:cursor-not-allowed disabled:opacity-50"
                              title={`Download ${item.voucherNumber}`}
                            >
                              {isDownloadingThis ? (
                                <svg
                                  className="h-3.5 w-3.5 animate-spin"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="opacity-25"
                                  />
                                  <path
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    className="opacity-75"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-3.5 w-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              )}
                            </button>
                          )}
                      </div>
                    </td>

                    <td className="px-2 py-2 sm:px-4 sm:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-right leading-tight">
                          <div className="font-medium">
                            {format(
                              getAmount(
                                item.credit,
                                item.creditConverted,
                                isConvertedCurrencySelected
                              ),
                              primaryCurrency?.symbol
                            )}
                          </div>

                          {hasMultipleCurrencies &&
                            getAmount(
                              item.credit,
                              item.creditConverted,
                              !isConvertedCurrencySelected
                            ) !== null && (
                              <div className="text-[10px] text-blue-900/60 sm:text-xs">
                                {format(
                                  getAmount(
                                    item.credit,
                                    item.creditConverted,
                                    !isConvertedCurrencySelected
                                  ),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>

                        {item.credit !== null &&
                          item.voucherGenerated &&
                          item.voucherNumber &&
                          item.tx && (
                            <button
                              onClick={() => handleDownload(item.tx, i)}
                              disabled={isDownloadingThis}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 hover:bg-blue-900/10 disabled:cursor-not-allowed disabled:opacity-50"
                              title={`Download ${item.voucherNumber}`}
                            >
                              {isDownloadingThis ? (
                                <svg
                                  className="h-3.5 w-3.5 animate-spin"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="opacity-25"
                                  />
                                  <path
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    className="opacity-75"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-3.5 w-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              )}
                            </button>
                          )}
                      </div>
                    </td>

                    <td className="px-2 py-2 text-right sm:px-4 sm:py-4">
                      <div className="leading-tight">
                        <div className="font-medium">
                          {format(
                            getAmount(
                              item.closingBalance,
                              item.closingBalanceConverted,
                              isConvertedCurrencySelected
                            ),
                            primaryCurrency?.symbol
                          )}
                        </div>

                        {hasMultipleCurrencies &&
                          getAmount(
                            item.closingBalance,
                            item.closingBalanceConverted,
                            !isConvertedCurrencySelected
                          ) !== null && (
                            <div className="text-[10px] text-blue-900/60 sm:text-xs">
                              {format(
                                getAmount(
                                  item.closingBalance,
                                  item.closingBalanceConverted,
                                  !isConvertedCurrencySelected
                                ),
                                secondaryCurrency?.symbol
                              )}
                            </div>
                          )}

                        <div className="text-[10px] text-blue-900/70 sm:text-xs">
                          {item.balanceType}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot className="bg-blue-900/5 font-semibold">
            <tr>
              <td colSpan={2} className="px-2 py-2 sm:px-4 sm:py-4">
                Total
              </td>
              <td className="px-2 py-2 text-right sm:px-4 sm:py-4">
                {format(totalDebit, primaryCurrency?.symbol)}
              </td>
              <td className="px-2 py-2 text-right sm:px-4 sm:py-4">
                {format(totalCredit, primaryCurrency?.symbol)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
