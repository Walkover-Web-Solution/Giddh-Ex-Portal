"use client";

import {
  BALANCE_TYPE_DR,
  BALANCE_TYPE_CR,
  LEDGER_TYPE_DEBIT,
  LEDGER_TYPE_CREDIT,
  type LedgerTransactionType,
} from "@/constants/ledger";
import { Currency, CurrencyInfo, Transaction } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";
import { downloadMagicLinkVoucher } from "@/utils/magic/downloadVoucher";
import { useState, useMemo } from "react";
import { getCurrencyConfig } from "./currencyUtils";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { transformLedgerTransactionToDisplay } from "@/utils/magic/transformLedgerTransaction";
import { useToast } from "@/contexts/ToastContext";
import { DataTable } from "@/components/ui/DataTable";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/20/solid";

interface Props {
  selectedCurrency: Currency;
  debitCreditTransactions?: LedgerTransaction[];
  forwardedBalance?: {
    amount: number;
    type: LedgerTransactionType;
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

  const { totalDebit, totalCredit } = useMemo(() => {
    if (!debitCreditTransactions?.length) {
      return { totalDebit: 0, totalCredit: 0 };
    }

    return debitCreditTransactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === LEDGER_TYPE_DEBIT)
          accumulator.totalDebit += transaction.amount || 0;
        if (transaction.type === LEDGER_TYPE_CREDIT)
          accumulator.totalCredit += transaction.amount || 0;
        return accumulator;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [debitCreditTransactions]);

  const handleDownload = async (transaction: LedgerTransaction, index: number) => {
    if (!transaction.voucherNumber || !transaction.voucherName) return;

    const transactionId = `tx-${index}-${transaction.entryUniqueName ?? transaction.voucherNumber}`;
    if (downloadingTransactionId === transactionId) return;

    setDownloadingTransactionId(transactionId);
    try {
      await downloadMagicLinkVoucher({
        linkId,
        voucherNumber: transaction.voucherNumber,
        voucherName: transaction.voucherName,
        voucherUniqueName: transaction.voucherUniqueName,
        entryUniqueName: transaction.entryUniqueName,
        voucherVersion: 2,
      });
    } catch (e: any) {
      showToast(e.message || `Invoice ${transaction.voucherNumber} cannot be downloaded`, "error");
    } finally {
      setDownloadingTransactionId(null);
    }
  };

  const displayTransactions = useMemo(() => {
    if (!debitCreditTransactions?.length) return [];

    const rows = debitCreditTransactions.map(
      (transaction) =>
        transformLedgerTransactionToDisplay(transaction, true) as Transaction & {
          transaction: LedgerTransaction;
        }
    );

    if (forwardedBalance) {
      rows.unshift({
        date: "",
        particular: forwardedBalance.description || "To Balance b/d",
        debit: null,
        debitConverted: null,
        credit: null,
        creditConverted: null,
        closingBalance: forwardedBalance.amount,
        closingBalanceConverted: forwardedBalance.amount,
        balanceType:
          forwardedBalance.type === LEDGER_TYPE_DEBIT ? BALANCE_TYPE_DR : BALANCE_TYPE_CR,
        voucherGenerated: false,
        transaction: {} as LedgerTransaction,
      });
    }

    return rows;
  }, [debitCreditTransactions, forwardedBalance]);

  const currencyConfig = getCurrencyConfig(
    selectedCurrency,
    transactionCurrency,
    convertedCurrency
  );

  const { hasMultipleCurrencies, isConvertedCurrencySelected, primaryCurrency, secondaryCurrency } =
    currencyConfig;

  const format = (amount: number | null, symbol?: string) =>
    amount === null ? "" : formatCurrencyAmount(amount, symbol || "₹", { decimals: 2 });

  const getAmount = (base: number | null, converted: number | null, useConverted: boolean) =>
    useConverted && converted !== null ? converted : base;

  const AmountCell = ({
    amount,
    convertedAmount,
    showDownload,
    onDownload,
    isDownloading,
  }: any) => (
    <div className="flex items-center justify-end gap-2">
      <div className="text-right">
        <div className="font-medium">
          {format(
            getAmount(amount, convertedAmount, isConvertedCurrencySelected),
            primaryCurrency?.symbol
          ) || "-"}
        </div>

        {hasMultipleCurrencies &&
          getAmount(amount, convertedAmount, !isConvertedCurrencySelected) !== null && (
            <div className="text-[10px] text-blue-900/60">
              {format(
                getAmount(amount, convertedAmount, !isConvertedCurrencySelected),
                secondaryCurrency?.symbol
              )}
            </div>
          )}
      </div>

      {showDownload && (
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
          title="Download voucher"
        >
          {isDownloading ? (
            <ArrowPathIcon className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
          ) : (
            <ArrowDownTrayIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <DataTable>
      <table className="text-sm} relative mx-auto w-full min-w-full divide-y divide-gray-300">
        <thead className="bg-blue-900">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
            >
              Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
              Particular
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white">
              Debit
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white">
              Credit
            </th>
            <th
              scope="col"
              className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-white sm:pr-6"
            >
              Closing Balance
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {displayTransactions.map((item, i) => {
            const txId = `tx-${i}-${item.entryUniqueName ?? ""}`;
            const downloading = downloadingTransactionId === txId;

            return (
              <tr key={i}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {item.date}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {item.particular}
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <AmountCell
                    amount={item.debit}
                    convertedAmount={item.debitConverted}
                    showDownload={item.debit !== null && item.voucherGenerated}
                    onDownload={() => handleDownload(item.tx, i)}
                    isDownloading={downloading}
                  />
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <AmountCell
                    amount={item.credit}
                    convertedAmount={item.creditConverted}
                    showDownload={item.credit !== null && item.voucherGenerated}
                    onDownload={() => handleDownload(item.tx, i)}
                    isDownloading={downloading}
                  />
                </td>

                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-medium text-gray-900">
                      {format(
                        getAmount(
                          item.closingBalance,
                          item.closingBalanceConverted,
                          isConvertedCurrencySelected
                        ),
                        primaryCurrency?.symbol
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">{item.balanceType}</span>
                  </div>

                  {hasMultipleCurrencies &&
                    getAmount(
                      item.closingBalance,
                      item.closingBalanceConverted,
                      !isConvertedCurrencySelected
                    ) !== null && (
                      <div className="text-right text-[10px] text-gray-500">
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
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot className="divide-y divide-gray-200 bg-gray-50 font-semibold">
          <tr>
            <td colSpan={2} className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
              Total
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
              {format(totalDebit, primaryCurrency?.symbol)}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
              {format(totalCredit, primaryCurrency?.symbol)}
            </td>
            <td className="py-4 pl-3 pr-4 sm:pr-6" />
          </tr>
        </tfoot>
      </table>
    </DataTable>
  );
}
