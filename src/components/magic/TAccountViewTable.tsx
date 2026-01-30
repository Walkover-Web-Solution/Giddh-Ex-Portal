"use client";

import { Transaction, Currency, CurrencyInfo } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { useMemo, useState } from "react";
import { downloadMagicLinkVoucher } from "@/utils/magic/downloadVoucher";
import { formatParticularWithPrefix } from "@/utils/magic/transformLedgerTransaction";
import { useToast } from "@/contexts/ToastContext";

interface Props {
  transactions: Transaction[];
  selectedCurrency: Currency;
  debitTransactions?: LedgerTransaction[];
  creditTransactions?: LedgerTransaction[];
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  linkId: string;
}

export function TAccountViewTable({
  transactions,
  selectedCurrency,
  debitTransactions,
  creditTransactions,
  transactionCurrency,
  convertedCurrency,
  linkId,
}: Props) {
  const { showToast } = useToast();
  const [downloadingTransactionId, setDownloadingTransactionId] = useState<string | null>(null);
  const [downloadingVouchers, setDownloadingVouchers] = useState<Set<string>>(new Set());

  const handleDownload = async (tx: LedgerTransaction, index: number, side: "debit" | "credit") => {
    if (!tx.voucherNumber || !tx.voucherName) {
      console.error("Missing voucher information for download");
      return;
    }

    // Always include index and side to ensure uniqueness even when entryUniqueName is duplicated
    const transactionId = `tx-${side}-${index}-${tx.entryUniqueName || tx.voucherNumber || "tx"}`;

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

  const hasMultipleCurrencies: boolean = Boolean(
    transactionCurrency?.code &&
    convertedCurrency?.code &&
    transactionCurrency.code !== convertedCurrency.code
  );

  const isConvertedCurrencySelected: boolean = Boolean(
    hasMultipleCurrencies && selectedCurrency === convertedCurrency?.code
  );

  const primaryCurrency = isConvertedCurrencySelected ? convertedCurrency : transactionCurrency;

  const secondaryCurrency = isConvertedCurrencySelected ? transactionCurrency : convertedCurrency;

  const format = (amount: number | null, symbol?: string) => {
    if (amount === null) return "";
    return formatCurrencyAmount(amount, symbol || "₹", { decimals: 2 });
  };

  // Helper to get amount from LedgerTransaction
  const getAmount = (tx: LedgerTransaction, useConverted: boolean) => {
    if (useConverted && tx.convertedAmount) {
      return tx.convertedAmount;
    }
    return tx.amount;
  };

  // Calculate totals from raw arrays
  const { totalDebit, totalCredit } = useMemo(() => {
    const useConverted = isConvertedCurrencySelected ?? false;
    const debit = (debitTransactions || []).reduce(
      (sum, tx) => sum + getAmount(tx, useConverted),
      0
    );
    const credit = (creditTransactions || []).reduce(
      (sum, tx) => sum + getAmount(tx, useConverted),
      0
    );
    return { totalDebit: debit, totalCredit: credit };
  }, [debitTransactions, creditTransactions, isConvertedCurrencySelected]);

  // Use raw arrays directly, fallback to transactions if not available
  const debitTx = debitTransactions || transactions.filter((t) => t.debit !== null);
  const creditTx = creditTransactions || transactions.filter((t) => t.credit !== null);
  const maxRows = Math.max(debitTx.length, creditTx.length);

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-900/30 bg-white">
      <div className="min-w-[510px]">
        <div className="grid grid-cols-2 bg-blue-900 text-white">
          <div className="py-2 text-center text-xs font-semibold sm:py-4 sm:text-base">
            Dr (Debit)
          </div>
          <div className="border-l border-white/20 py-2 text-center text-xs font-semibold sm:py-4 sm:text-base">
            Cr (Credit)
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-blue-900/20">
          <div className="grid grid-cols-[80px_1fr_70px] px-2 py-1.5 text-[10px] font-medium sm:px-4 sm:py-2 sm:text-xs">
            <span>DATE</span>
            <span>PARTICULARS</span>
            <span className="text-right">AMOUNT</span>
          </div>
          <div className="grid grid-cols-[80px_1fr_100px] border-l border-blue-900/20 px-2 py-1.5 text-[10px] font-medium sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:py-2 sm:text-xs">
            <span>DATE</span>
            <span>PARTICULARS</span>
            <span className="text-right">AMOUNT</span>
          </div>
        </div>

        <div className="divide-y divide-blue-900/10">
          {Array.from({ length: maxRows }).map((_, i) => {
            const dr = debitTx[i] as LedgerTransaction | Transaction | undefined;
            const cr = creditTx[i] as LedgerTransaction | Transaction | undefined;

            // Check if it's a LedgerTransaction (has 'particular' as object) or Transaction (has 'particular' as string)
            const isLedgerTransaction = (tx: any): tx is LedgerTransaction => {
              return tx && typeof tx.particular === "object" && tx.particular !== null;
            };

            const debitTransactionId =
              dr && isLedgerTransaction(dr)
                ? `tx-debit-${i}-${dr.entryUniqueName || dr.voucherNumber || "tx"}`
                : null;
            const creditTransactionId =
              cr && isLedgerTransaction(cr)
                ? `tx-credit-${i}-${cr.entryUniqueName || cr.voucherNumber || "tx"}`
                : null;
            const isDownloadingDebit = downloadingTransactionId === debitTransactionId;
            const isDownloadingCredit = downloadingTransactionId === creditTransactionId;

            return (
              <div key={i} className="grid min-h-[48px] grid-cols-2 sm:min-h-[48px]">
                <div className="grid grid-cols-[80px_1fr_100px] items-center px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:py-3">
                  {dr ? (
                    <>
                      <div className="text-[10px] sm:text-xs">
                        {isLedgerTransaction(dr) ? dr.entryDate : (dr as Transaction).date}
                      </div>
                      <div className="line-clamp-2 text-[10px] sm:text-xs">
                        {isLedgerTransaction(dr)
                          ? formatParticularWithPrefix(dr.particular.name, dr.type)
                          : (dr as Transaction).particular}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="text-right text-[10px] font-medium sm:text-xs">
                          <div>
                            {format(
                              isLedgerTransaction(dr)
                                ? getAmount(dr, isConvertedCurrencySelected ?? false)
                                : isConvertedCurrencySelected
                                  ? ((dr as Transaction).debitConverted ?? null)
                                  : ((dr as Transaction).debit ?? null),
                              primaryCurrency?.symbol
                            )}
                          </div>

                          {hasMultipleCurrencies && isLedgerTransaction(dr) && (
                            <div className="text-[9px] text-blue-900/60 sm:text-xs">
                              {format(
                                getAmount(dr, !(isConvertedCurrencySelected ?? false)),
                                secondaryCurrency?.symbol
                              )}
                            </div>
                          )}
                          {hasMultipleCurrencies &&
                            !isLedgerTransaction(dr) &&
                            (isConvertedCurrencySelected
                              ? ((dr as Transaction).debit ?? null)
                              : ((dr as Transaction).debitConverted ?? null)) !== null && (
                              <div className="text-[9px] text-blue-900/60 sm:text-xs">
                                {format(
                                  isConvertedCurrencySelected
                                    ? ((dr as Transaction).debit ?? null)
                                    : ((dr as Transaction).debitConverted ?? null),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>
                        {isLedgerTransaction(dr) && dr.voucherGenerated && dr.voucherNumber && (
                          <button
                            onClick={() => handleDownload(dr, i, "debit")}
                            disabled={isDownloadingDebit}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 hover:bg-blue-900/10 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                            title={`Download ${dr.voucherNumber}`}
                          >
                            {isDownloadingDebit ? (
                              <svg
                                className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5"
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
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
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
                    </>
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>

                <div className="grid grid-cols-[80px_1fr_100px] items-center border-l border-blue-900/20 px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:py-3">
                  {cr ? (
                    <>
                      <div className="text-[10px] sm:text-xs">
                        {isLedgerTransaction(cr) ? cr.entryDate : (cr as Transaction).date}
                      </div>
                      <div className="line-clamp-2 text-[10px] sm:text-xs">
                        {isLedgerTransaction(cr)
                          ? formatParticularWithPrefix(cr.particular.name, cr.type)
                          : (cr as Transaction).particular}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="text-right text-[10px] font-medium sm:text-xs">
                          <div>
                            {format(
                              isLedgerTransaction(cr)
                                ? getAmount(cr, isConvertedCurrencySelected ?? false)
                                : isConvertedCurrencySelected
                                  ? ((cr as Transaction).creditConverted ?? null)
                                  : ((cr as Transaction).credit ?? null),
                              primaryCurrency?.symbol
                            )}
                          </div>

                          {hasMultipleCurrencies && isLedgerTransaction(cr) && (
                            <div className="text-[9px] text-blue-900/60 sm:text-xs">
                              {format(
                                getAmount(cr, !(isConvertedCurrencySelected ?? false)),
                                secondaryCurrency?.symbol
                              )}
                            </div>
                          )}
                          {hasMultipleCurrencies &&
                            !isLedgerTransaction(cr) &&
                            (isConvertedCurrencySelected
                              ? ((cr as Transaction).credit ?? null)
                              : ((cr as Transaction).creditConverted ?? null)) !== null && (
                              <div className="text-[9px] text-blue-900/60 sm:text-xs">
                                {format(
                                  isConvertedCurrencySelected
                                    ? ((cr as Transaction).credit ?? null)
                                    : ((cr as Transaction).creditConverted ?? null),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>
                        {isLedgerTransaction(cr) && cr.voucherGenerated && cr.voucherNumber && (
                          <button
                            onClick={() => handleDownload(cr, i, "credit")}
                            disabled={isDownloadingCredit}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-900/5 text-blue-900 hover:bg-blue-900/10 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                            title={`Download ${cr.voucherNumber}`}
                          >
                            {isDownloadingCredit ? (
                              <svg
                                className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5"
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
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
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
                    </>
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 border-t border-blue-900/20 bg-blue-900/5">
          <div className="grid grid-cols-[1fr_100px] px-2 py-2 font-semibold sm:grid-cols-[1fr_160px] sm:px-4 sm:py-4">
            <span>Total</span>
            <span className="text-right">{format(totalDebit, primaryCurrency?.symbol)}</span>
          </div>
          <div className="grid grid-cols-[1fr_100px] border-l border-blue-900/20 px-2 py-2 font-semibold sm:grid-cols-[1fr_160px] sm:px-4 sm:py-4">
            <span>Total</span>
            <span className="text-right">{format(totalCredit, primaryCurrency?.symbol)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
