"use client";

import { LEDGER_TYPE_CREDIT, LEDGER_TYPE_DEBIT } from "@/constants/ledger";
import { Transaction, Currency, CurrencyInfo, ForwardedBalanceShape } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { useMemo, useState } from "react";
import {
  downloadMagicLinkVoucher,
  downloadMagicLinkAttachment,
} from "@/utils/magic/downloadVoucher";
import { formatParticularWithPrefix } from "@/utils/magic/transformLedgerTransaction";
import { hasAttachmentId, getAttachmentTooltipTitle } from "@/utils/magic/attachmentUtils";
import { useToast } from "@/contexts/ToastContext";
import { DataTable } from "@/components/ui/DataTable";
import { ArrowDownTrayIcon, ArrowPathIcon, PaperClipIcon } from "@heroicons/react/20/solid";
import { getForwardedBalanceParticular, BalanceSide } from "@/utils/magic/forwardedBalanceLabels";
import type { LedgerTotals } from "./StatementViewTable";

export interface ForwardedBalanceRow {
  _isOpeningBalanceRow: true;
  side: "debit" | "credit";
  date: string;
  particular: string;
  amount: number;
  convertedAmount: number;
}

interface Props {
  transactions: Transaction[];
  selectedCurrency: Currency;
  debitTransactions?: LedgerTransaction[];
  creditTransactions?: LedgerTransaction[];
  forwardedBalance?: ForwardedBalanceShape;
  convertedForwardedBalance?: ForwardedBalanceShape;
  ledgerTotals?: LedgerTotals;
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  linkId: string;
}

export function TAccountViewTable({
  transactions,
  selectedCurrency,
  debitTransactions,
  creditTransactions,
  forwardedBalance,
  convertedForwardedBalance,
  ledgerTotals,
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
    if (!tx?.voucherNumber || !tx?.voucherName) {
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

  const transactionCode = (transactionCurrency?.code ?? "").trim().toUpperCase();
  const convertedCode = (convertedCurrency?.code ?? "").trim().toUpperCase();
  const hasMultipleCurrencies =
    transactionCode.length > 0 && convertedCode.length > 0 && transactionCode !== convertedCode;

  const selectedNorm = (selectedCurrency ?? "").trim().toUpperCase();
  const isConvertedCurrencySelected = hasMultipleCurrencies && selectedNorm === convertedCode;

  const primaryCurrency = isConvertedCurrencySelected ? convertedCurrency : transactionCurrency;

  const secondaryCurrency = isConvertedCurrencySelected ? transactionCurrency : convertedCurrency;

  const format = (amount: number | null, symbol?: string) => {
    if (amount === null) return "";
    return formatCurrencyAmount(amount, symbol || "₹", { decimals: 2 });
  };

  const isForwardedBalanceRow = (tx: unknown): tx is ForwardedBalanceRow =>
    Boolean(
      tx &&
      typeof tx === "object" &&
      "_isOpeningBalanceRow" in tx &&
      (tx as ForwardedBalanceRow)._isOpeningBalanceRow
    );

  const getAmount = (tx: LedgerTransaction, useConverted: boolean) => {
    if (useConverted && tx.convertedAmount) {
      return tx.convertedAmount;
    }
    return tx.amount;
  };

  const baseDebitTransactions = useMemo(
    () =>
      debitTransactions?.length ? debitTransactions : transactions.filter((t) => t.debit !== null),
    [debitTransactions, transactions]
  );
  const baseCreditTransactions = useMemo(
    () =>
      creditTransactions?.length
        ? creditTransactions
        : transactions.filter((t) => t.credit !== null),
    [creditTransactions, transactions]
  );

  const debitTx = useMemo(() => {
    if (!forwardedBalance || forwardedBalance.type !== LEDGER_TYPE_DEBIT)
      return baseDebitTransactions;
    const convertedAmount = convertedForwardedBalance?.amount ?? forwardedBalance.amount;
    const bfRow: ForwardedBalanceRow = {
      _isOpeningBalanceRow: true,
      side: "debit",
      date: "",
      particular: getForwardedBalanceParticular(forwardedBalance.description, BalanceSide.DEBIT),
      amount: forwardedBalance.amount,
      convertedAmount,
    };
    return [bfRow, ...baseDebitTransactions];
  }, [baseDebitTransactions, forwardedBalance, convertedForwardedBalance]);

  const creditTx = useMemo(() => {
    if (!forwardedBalance || forwardedBalance.type !== LEDGER_TYPE_CREDIT)
      return baseCreditTransactions;
    const convertedAmount = convertedForwardedBalance?.amount ?? forwardedBalance.amount;
    const bfRow: ForwardedBalanceRow = {
      _isOpeningBalanceRow: true,
      side: "credit",
      date: "",
      particular: getForwardedBalanceParticular(forwardedBalance.description, BalanceSide.CREDIT),
      amount: forwardedBalance.amount,
      convertedAmount,
    };
    return [bfRow, ...baseCreditTransactions];
  }, [baseCreditTransactions, forwardedBalance, convertedForwardedBalance]);

  const debitRowCount =
    forwardedBalance?.type === LEDGER_TYPE_CREDIT ? debitTx.length + 1 : debitTx.length;
  const creditRowCount =
    forwardedBalance?.type === LEDGER_TYPE_DEBIT ? creditTx.length + 1 : creditTx.length;
  const maxRows = Math.max(debitRowCount, creditRowCount);

  const { totalDebit, totalCredit, totalDebitConverted, totalCreditConverted } = useMemo(() => {
    if (ledgerTotals) {
      return {
        totalDebit: ledgerTotals.totalDebit,
        totalCredit: ledgerTotals.totalCredit,
        totalDebitConverted: ledgerTotals.convertedTotalDebit ?? null,
        totalCreditConverted: ledgerTotals.convertedTotalCredit ?? null,
      };
    }
    const useConverted = isConvertedCurrencySelected ?? false;
    const getBFRowAmount = (tx: ForwardedBalanceRow, useConv: boolean) =>
      useConv ? tx.convertedAmount : tx.amount;
    const getDebitAmount = (
      tx: LedgerTransaction | Transaction | ForwardedBalanceRow,
      useConv: boolean
    ) => {
      if (isForwardedBalanceRow(tx)) return getBFRowAmount(tx, useConv);
      if (typeof (tx as LedgerTransaction).amount === "number")
        return getAmount(tx as LedgerTransaction, useConv);
      return useConv ? ((tx as Transaction).debitConverted ?? 0) : ((tx as Transaction).debit ?? 0);
    };
    const getCreditAmount = (
      tx: LedgerTransaction | Transaction | ForwardedBalanceRow,
      useConv: boolean
    ) => {
      if (isForwardedBalanceRow(tx)) return getBFRowAmount(tx, useConv);
      if (typeof (tx as LedgerTransaction).amount === "number")
        return getAmount(tx as LedgerTransaction, useConv);
      return useConv
        ? ((tx as Transaction).creditConverted ?? 0)
        : ((tx as Transaction).credit ?? 0);
    };
    const dr = debitTx.reduce((sum, tx) => sum + getDebitAmount(tx, useConverted), 0);
    const cr = creditTx.reduce((sum, tx) => sum + getCreditAmount(tx, useConverted), 0);
    const drConv = hasMultipleCurrencies
      ? debitTx.reduce((sum, tx) => sum + getDebitAmount(tx, !useConverted), 0)
      : null;
    const crConv = hasMultipleCurrencies
      ? creditTx.reduce((sum, tx) => sum + getCreditAmount(tx, !useConverted), 0)
      : null;
    return {
      totalDebit: dr,
      totalCredit: cr,
      totalDebitConverted: drConv,
      totalCreditConverted: crConv,
    };
  }, [ledgerTotals, debitTx, creditTx, isConvertedCurrencySelected, hasMultipleCurrencies]);

  return (
    <DataTable>
      <div className="w-max min-w-full">
        <div className="grid grid-cols-[1fr_1fr] bg-blue-900">
          <div className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold capitalize text-white sm:pl-6">
            Dr (Debit)
          </div>
          <div className="border-l border-white/20 py-3.5 pl-3 pr-4 text-center text-sm font-semibold capitalize text-white sm:pr-6">
            Cr (Credit)
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr] border-b border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(90px,auto)_minmax(150px,1fr)_minmax(100px,auto)] px-4 py-3.5 pl-6 text-xs font-semibold text-gray-900">
            <span>Date</span>
            <span>Particular</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-[minmax(90px,auto)_minmax(150px,1fr)_minmax(100px,auto)] border-l border-gray-200 px-4 py-3.5 pr-6 text-xs font-semibold text-gray-900">
            <span>Date</span>
            <span>Particular</span>
            <span className="text-right">Amount</span>
          </div>
        </div>

        <div className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: maxRows }).map((_, i) => {
            const hasOpeningBalanceOnCredit = forwardedBalance?.type === LEDGER_TYPE_CREDIT;
            const hasOpeningBalanceOnDebit = forwardedBalance?.type === LEDGER_TYPE_DEBIT;
            const dr = hasOpeningBalanceOnCredit
              ? i === 0
                ? undefined
                : debitTx[i - 1]
              : debitTx[i];
            const cr = hasOpeningBalanceOnDebit
              ? i === 0
                ? undefined
                : creditTx[i - 1]
              : creditTx[i];

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
              <div key={i} className="grid min-h-[48px] grid-cols-[1fr_1fr]">
                <div className="grid grid-cols-[minmax(90px,auto)_minmax(150px,1fr)_minmax(100px,auto)] items-center px-4 py-3">
                  {dr ? (
                    isForwardedBalanceRow(dr) ? (
                      <>
                        <div className="whitespace-nowrap text-sm text-gray-900">{dr.date}</div>
                        <div className="line-clamp-2 text-sm">{dr.particular}</div>
                        <div className="whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          <div>
                            {format(
                              isConvertedCurrencySelected ? dr.convertedAmount : dr.amount,
                              primaryCurrency?.symbol
                            )}
                          </div>
                          {hasMultipleCurrencies && (
                            <div className="whitespace-nowrap text-xs text-gray-500">
                              {format(
                                isConvertedCurrencySelected ? dr.amount : dr.convertedAmount,
                                secondaryCurrency?.symbol
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
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
                          <div className="whitespace-nowrap text-right text-sm font-medium text-gray-900">
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
                              <div className="whitespace-nowrap text-xs text-gray-500">
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
                                <div className="whitespace-nowrap text-xs text-gray-500">
                                  {format(
                                    isConvertedCurrencySelected
                                      ? ((dr as Transaction).debit ?? null)
                                      : ((dr as Transaction).debitConverted ?? null),
                                    secondaryCurrency?.symbol
                                  )}
                                </div>
                              )}
                          </div>
                          {isLedgerTransaction(dr) &&
                            hasAttachmentId(dr.attachedFileUniqueName) && (
                              <div className="group/attachment relative shrink-0">
                                <span
                                  className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/attachment:opacity-100"
                                  role="tooltip"
                                >
                                  {getAttachmentTooltipTitle(dr.attachedFileName)}
                                </span>
                                <button
                                  type="button"
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
                            <div className="group/voucher relative shrink-0">
                              <span
                                className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/voucher:opacity-100"
                                role="tooltip"
                              >
                                {`DOWNLOAD INVOICE : ${dr.voucherNumber}`}
                              </span>
                              <button
                                onClick={() => handleDownload(dr, i, "debit")}
                                disabled={isDownloadingDebit}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                                aria-label={`Download ${dr.voucherNumber}`}
                              >
                                {isDownloadingDebit ? (
                                  <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                                ) : (
                                  <ArrowDownTrayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>

                <div className="grid grid-cols-[minmax(90px,auto)_minmax(150px,1fr)_minmax(100px,auto)] items-center border-l border-gray-200 px-4 py-3">
                  {cr ? (
                    isForwardedBalanceRow(cr) ? (
                      <>
                        <div className="whitespace-nowrap text-sm text-gray-900">{cr.date}</div>
                        <div className="line-clamp-2 text-sm">{cr.particular}</div>
                        <div className="whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          <div>
                            {format(
                              isConvertedCurrencySelected ? cr.convertedAmount : cr.amount,
                              primaryCurrency?.symbol
                            )}
                          </div>
                          {hasMultipleCurrencies && (
                            <div className="whitespace-nowrap text-xs text-gray-500">
                              {format(
                                isConvertedCurrencySelected ? cr.amount : cr.convertedAmount,
                                secondaryCurrency?.symbol
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
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
                          <div className="whitespace-nowrap text-right text-sm font-medium text-gray-900">
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
                              <div className="whitespace-nowrap text-xs text-gray-500">
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
                                <div className="whitespace-nowrap text-xs text-gray-500">
                                  {format(
                                    isConvertedCurrencySelected
                                      ? ((cr as Transaction).credit ?? null)
                                      : ((cr as Transaction).creditConverted ?? null),
                                    secondaryCurrency?.symbol
                                  )}
                                </div>
                              )}
                          </div>
                          {isLedgerTransaction(cr) &&
                            hasAttachmentId(cr.attachedFileUniqueName) && (
                              <div className="group/attachment relative shrink-0">
                                <span
                                  className="pointer-events-none absolute bottom-full left-[-110px] mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/attachment:opacity-100"
                                  role="tooltip"
                                >
                                  {getAttachmentTooltipTitle(cr.attachedFileName)}
                                </span>
                                <button
                                  type="button"
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
                            <div className="group/voucher relative shrink-0">
                              <span
                                className="pointer-events-none absolute bottom-full left-[-70px] mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/voucher:opacity-100"
                                role="tooltip"
                              >
                                {`DOWNLOAD INVOICE : ${cr.voucherNumber}`}
                              </span>
                              <button
                                onClick={() => handleDownload(cr, i, "credit")}
                                disabled={isDownloadingCredit}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                                aria-label={`Download ${cr.voucherNumber}`}
                              >
                                {isDownloadingCredit ? (
                                  <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                                ) : (
                                  <ArrowDownTrayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DataTable>
  );
}
