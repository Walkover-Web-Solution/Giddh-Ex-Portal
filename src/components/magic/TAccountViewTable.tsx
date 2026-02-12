"use client";

import { Transaction, Currency, CurrencyInfo } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { useMemo, useState } from "react";
import {
  downloadMagicLinkVoucher,
  downloadMagicLinkAttachment,
} from "@/utils/magic/downloadVoucher";
import { formatParticularWithPrefix } from "@/utils/magic/transformLedgerTransaction";
import {
  hasAttachmentId,
  getAttachmentTooltipTitle,
  getAttachmentDisplayName,
} from "@/utils/magic/attachmentUtils";
import { useToast } from "@/contexts/ToastContext";
import { DataTable } from "@/components/ui/DataTable";
import { ArrowDownTrayIcon, ArrowPathIcon, PaperClipIcon } from "@heroicons/react/20/solid";

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
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<string | null>(null);

  const handleDownloadAttachment = async (
    tx: LedgerTransaction,
    index: number,
    side: "debit" | "credit"
  ) => {
    if (!hasAttachmentId(tx.attachedFileUniqueName)) return;

    const attachmentId = `att-${side}-${index}-${tx.entryUniqueName ?? tx.attachedFileUniqueName}`;
    if (downloadingAttachmentId === attachmentId) return;

    setDownloadingAttachmentId(attachmentId);
    try {
      await downloadMagicLinkAttachment({
        linkId,
        attachedFileUniqueName: tx.attachedFileUniqueName!,
        attachedFileName: tx.attachedFileName,
        voucherName: tx.voucherName,
        voucherUniqueName: tx.voucherUniqueName,
        entryUniqueName: tx.entryUniqueName,
        voucherVersion: 2,
        onError: (msg) => showToast(msg, "error"),
      });
    } catch {
      // Toast already shown via onError
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

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

  // Use raw arrays when they have data; otherwise derive from transactions (e.g. when API returns only combined list or paginated slice)
  const debitTx =
    debitTransactions && debitTransactions.length > 0
      ? debitTransactions
      : transactions.filter((t) => t.debit !== null);
  const creditTx =
    creditTransactions && creditTransactions.length > 0
      ? creditTransactions
      : transactions.filter((t) => t.credit !== null);
  const maxRows = Math.max(debitTx.length, creditTx.length);

  const { totalDebit, totalCredit } = useMemo(() => {
    const useConverted = isConvertedCurrencySelected ?? false;
    const sumDebit = debitTx.reduce((sum, tx) => {
      const amount =
        typeof (tx as LedgerTransaction).amount === "number"
          ? getAmount(tx as LedgerTransaction, useConverted)
          : ((useConverted ? (tx as Transaction).debitConverted : (tx as Transaction).debit) ?? 0);
      return sum + (typeof amount === "number" ? amount : 0);
    }, 0);
    const sumCredit = creditTx.reduce((sum, tx) => {
      const amount =
        typeof (tx as LedgerTransaction).amount === "number"
          ? getAmount(tx as LedgerTransaction, useConverted)
          : ((useConverted ? (tx as Transaction).creditConverted : (tx as Transaction).credit) ??
            0);
      return sum + (typeof amount === "number" ? amount : 0);
    }, 0);
    return { totalDebit: sumDebit, totalCredit: sumCredit };
  }, [debitTx, creditTx, isConvertedCurrencySelected]);

  return (
    <DataTable>
      <div className="min-w-[510px]">
        <div className="grid grid-cols-2 bg-blue-900">
          <div className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold capitalize text-white sm:pl-6">
            Dr (Debit)
          </div>
          <div className="border-l border-white/20 py-3.5 pl-3 pr-4 text-center text-sm font-semibold capitalize text-white sm:pr-6">
            Cr (Credit)
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-[80px_1fr_70px] px-3 py-3.5 text-xs font-semibold text-gray-900 sm:px-4 sm:pl-6">
            <span>Date</span>
            <span>Particulars</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-[80px_1fr_100px] border-l border-gray-200 px-3 py-3.5 text-xs font-semibold text-gray-900 sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:pr-6">
            <span>Date</span>
            <span>Particulars</span>
            <span className="text-right">Amount</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 bg-white">
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
            const debitAttachmentId =
              dr && isLedgerTransaction(dr) && hasAttachmentId(dr.attachedFileUniqueName)
                ? `att-debit-${i}-${dr.entryUniqueName ?? dr.attachedFileUniqueName}`
                : null;
            const creditAttachmentId =
              cr && isLedgerTransaction(cr) && hasAttachmentId(cr.attachedFileUniqueName)
                ? `att-credit-${i}-${cr.entryUniqueName ?? cr.attachedFileUniqueName}`
                : null;
            const isDownloadingDebit = downloadingTransactionId === debitTransactionId;
            const isDownloadingCredit = downloadingTransactionId === creditTransactionId;
            const isDownloadingDebitAtt = downloadingAttachmentId === debitAttachmentId;
            const isDownloadingCreditAtt = downloadingAttachmentId === creditAttachmentId;

            return (
              <div key={i} className="grid min-h-[48px] grid-cols-2 sm:min-h-[48px]">
                <div className="grid grid-cols-[80px_1fr_100px] items-center px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:py-3">
                  {dr ? (
                    <>
                      <div className="whitespace-nowrap text-sm text-gray-900">
                        {isLedgerTransaction(dr) ? dr.entryDate : (dr as Transaction).date}
                      </div>
                      <div className="line-clamp-2 text-sm">
                        {isLedgerTransaction(dr)
                          ? formatParticularWithPrefix(dr.particular.name, dr.type)
                          : (dr as Transaction).particular}
                        {isLedgerTransaction(dr) && dr.inventory?.stock?.name
                          ? ` (${dr.inventory.stock.name})`
                          : ""}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="text-right text-sm font-medium text-gray-900">
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
                            <div className="text-xs text-gray-500">
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
                              <div className="text-xs text-gray-500">
                                {format(
                                  isConvertedCurrencySelected
                                    ? ((dr as Transaction).debit ?? null)
                                    : ((dr as Transaction).debitConverted ?? null),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>
                        {isLedgerTransaction(dr) && hasAttachmentId(dr.attachedFileUniqueName) && (
                          <div className="group/attachment relative shrink-0">
                            <span
                              className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/attachment:opacity-100"
                              role="tooltip"
                            >
                              {getAttachmentTooltipTitle(dr.attachedFileName)}
                            </span>
                            <button
                              onClick={() => handleDownloadAttachment(dr, i, "debit")}
                              disabled={isDownloadingDebitAtt}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                              aria-label={getAttachmentTooltipTitle(dr.attachedFileName)}
                            >
                              {isDownloadingDebitAtt ? (
                                <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                              ) : (
                                <PaperClipIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                        {isLedgerTransaction(dr) && dr.voucherGenerated && dr.voucherNumber && (
                          <button
                            onClick={() => handleDownload(dr, i, "debit")}
                            disabled={isDownloadingDebit}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                            title={`Download ${dr.voucherNumber}`}
                          >
                            {isDownloadingDebit ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <ArrowDownTrayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>

                <div className="grid grid-cols-[80px_1fr_100px] items-center border-l border-gray-200 px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:px-4 sm:py-3">
                  {cr ? (
                    <>
                      <div className="whitespace-nowrap text-sm text-gray-900">
                        {isLedgerTransaction(cr) ? cr.entryDate : (cr as Transaction).date}
                      </div>
                      <div className="line-clamp-2 text-sm">
                        {isLedgerTransaction(cr)
                          ? formatParticularWithPrefix(cr.particular.name, cr.type)
                          : (cr as Transaction).particular}
                        {isLedgerTransaction(cr) && cr.inventory?.stock?.name
                          ? ` (${cr.inventory.stock.name})`
                          : ""}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="text-right text-sm font-medium text-gray-900">
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
                            <div className="text-xs text-gray-500">
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
                              <div className="text-xs text-gray-500">
                                {format(
                                  isConvertedCurrencySelected
                                    ? ((cr as Transaction).credit ?? null)
                                    : ((cr as Transaction).creditConverted ?? null),
                                  secondaryCurrency?.symbol
                                )}
                              </div>
                            )}
                        </div>
                        {isLedgerTransaction(cr) && hasAttachmentId(cr.attachedFileUniqueName) && (
                          <div className="group/attachment relative shrink-0">
                            <span
                              className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/attachment:opacity-100"
                              role="tooltip"
                            >
                              {getAttachmentTooltipTitle(cr.attachedFileName)}
                            </span>
                            <button
                              onClick={() => handleDownloadAttachment(cr, i, "credit")}
                              disabled={isDownloadingCreditAtt}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                              aria-label={getAttachmentTooltipTitle(cr.attachedFileName)}
                            >
                              {isDownloadingCreditAtt ? (
                                <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                              ) : (
                                <PaperClipIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                        {isLedgerTransaction(cr) && cr.voucherGenerated && cr.voucherNumber && (
                          <button
                            onClick={() => handleDownload(cr, i, "credit")}
                            disabled={isDownloadingCredit}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                            title={`Download ${cr.voucherNumber}`}
                          >
                            {isDownloadingCredit ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <ArrowDownTrayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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

        <div className="grid grid-cols-2 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-[1fr_100px] px-4 py-4 font-semibold text-gray-900 sm:grid-cols-[1fr_160px] sm:pl-6 sm:pr-6">
            <span>Total</span>
            <span className="text-right">{format(totalDebit, primaryCurrency?.symbol)}</span>
          </div>
          <div className="grid grid-cols-[1fr_100px] border-l border-gray-200 px-4 py-4 font-semibold text-gray-900 sm:grid-cols-[1fr_160px] sm:pr-6">
            <span>Total</span>
            <span className="text-right">{format(totalCredit, primaryCurrency?.symbol)}</span>
          </div>
        </div>
      </div>
    </DataTable>
  );
}
