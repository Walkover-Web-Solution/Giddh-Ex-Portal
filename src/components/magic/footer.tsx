import type { BalanceType } from "@/constants/ledger";
import { formatCurrencyAmount } from "@/utils/currency";
import { normalizeCode } from "./currencyUtils";
import { CurrencyInfo } from "./types";

interface FooterSummaryProps {
  totalTransactions: number;
  debitCount: number;
  creditCount: number;
  openingBalance?: number;
  openingBalanceType?: BalanceType;
  netTotalCredit: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance?: number;
  closingBalanceType?: BalanceType;
  reckoningDebitTotal?: number;
  reckoningCreditTotal?: number;
  convertedTotalDebit?: number;
  convertedTotalCredit?: number;
  convertedClosingBalance?: number;
  convertedClosingBalanceType?: BalanceType;
  convertedOpeningBalance?: number;
  convertedOpeningBalanceType?: BalanceType;
}

interface FooterProps {
  summary: FooterSummaryProps;
  companyCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  /** When true, Opening and Closing balance blocks are hidden (e.g. when search/filters applied). */
  hideOpeningClosingBalance?: boolean;
}

export function Footer({
  summary,
  companyCurrency,
  convertedCurrency,
  hideOpeningClosingBalance = false,
}: FooterProps) {
  const formatAmount = (amount: number | null, symbol?: string) => {
    if (amount === null) return "";
    return formatCurrencyAmount(amount, symbol ?? companyCurrency?.symbol, { decimals: 2 });
  };

  const companyCode = normalizeCode(companyCurrency?.code);
  const convertedCode = normalizeCode(convertedCurrency?.code);
  const hasTwoCurrencies =
    companyCode !== "" && convertedCode !== "" && companyCode !== convertedCode;
  const hasConverted =
    hasTwoCurrencies && summary.convertedTotalDebit != null && summary.convertedTotalCredit != null;

  return (
    <div className="my-4 overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <div
          className={
            hideOpeningClosingBalance
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
          }
        >
          <div>
            <p className="text-xs text-blue-900 sm:text-sm">
              Total Transactions {summary.totalTransactions}
            </p>
            <p className="mt-1.5 text-base font-semibold text-blue-900 sm:mt-2 sm:text-lg">
              Dr {summary.debitCount} <span className="text-blue-900/40">|</span> Cr{" "}
              {summary.creditCount}
            </p>
          </div>

          {!hideOpeningClosingBalance && (
            <div>
              <p className="text-xs text-blue-900 sm:text-sm">Opening Balance</p>
              <p className="mt-1.5 text-base font-semibold text-blue-900 sm:mt-2 sm:text-lg">
                {formatAmount(summary.openingBalance ?? null)} {summary.openingBalanceType ?? ""}
              </p>
              {hasConverted &&
                summary.convertedOpeningBalance !== undefined &&
                summary.convertedOpeningBalanceType !== undefined && (
                  <p className="mt-0.5 text-sm text-blue-900/70">
                    {formatAmount(summary.convertedOpeningBalance, convertedCurrency?.symbol)}{" "}
                    {summary.convertedOpeningBalanceType}
                  </p>
                )}
            </div>
          )}

          <div className="flex flex-col">
            <div>
              <p className="text-xs text-blue-900 sm:text-sm">Net Total</p>
              <p className="mt-1.5 text-lg font-semibold text-blue-900 sm:mt-2 sm:text-xl">
                {summary.totalCredit > summary.totalDebit &&
                  formatAmount(summary.totalCredit - summary.totalDebit)}
                {summary.totalCredit < summary.totalDebit &&
                  formatAmount(summary.totalDebit - summary.totalCredit)}
                {summary.totalCredit === summary.totalDebit && formatAmount(0)}
                {summary.totalCredit > summary.totalDebit && " Cr"}
                {summary.totalCredit < summary.totalDebit && " Dr"}
              </p>
              {hasConverted &&
                summary.convertedTotalDebit !== undefined &&
                summary.convertedTotalCredit !== undefined && (
                  <p className="mt-0.5 text-sm font-semibold text-blue-900">
                    {summary.convertedTotalCredit > summary.convertedTotalDebit &&
                      formatAmount(
                        summary.convertedTotalCredit - summary.convertedTotalDebit,
                        convertedCurrency?.symbol
                      )}
                    {summary.convertedTotalCredit < summary.convertedTotalDebit &&
                      formatAmount(
                        summary.convertedTotalDebit - summary.convertedTotalCredit,
                        convertedCurrency?.symbol
                      )}
                    {summary.convertedTotalCredit === summary.convertedTotalDebit &&
                      formatAmount(0, convertedCurrency?.symbol)}{" "}
                    {summary.convertedTotalCredit > summary.convertedTotalDebit && "Cr"}
                    {summary.convertedTotalCredit < summary.convertedTotalDebit && "Dr"}
                  </p>
                )}
            </div>
            <div className="mt-1 w-full text-[10px] text-blue-900 sm:text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1 text-left">
                  <p className="text-sm font-semibold">Debit</p>

                  <p className="text-sm">{formatAmount(summary.totalDebit)}</p>

                  {hasConverted && (
                    <p>
                      {formatAmount(summary.convertedTotalDebit ?? null, convertedCurrency?.symbol)}
                    </p>
                  )}

                  {summary.reckoningDebitTotal !== undefined && (
                    <p>{formatAmount(summary.reckoningDebitTotal)}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-1 text-left">
                  <p className="text-sm font-semibold">Credit</p>

                  <p className="text-sm">{formatAmount(summary.totalCredit)}</p>

                  {hasConverted && (
                    <p>
                      {formatAmount(
                        summary.convertedTotalCredit ?? null,
                        convertedCurrency?.symbol
                      )}
                    </p>
                  )}

                  {summary.reckoningCreditTotal !== undefined && (
                    <p>{formatAmount(summary.reckoningCreditTotal)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!hideOpeningClosingBalance && (
            <div className="flex flex-col">
              <p className="text-xs text-blue-900 sm:text-sm">Closing Balance</p>
              <p className="mt-1.5 text-lg font-semibold text-blue-900 sm:mt-2 sm:text-xl">
                {formatAmount(summary.closingBalance ?? null)} {summary.closingBalanceType ?? ""}
              </p>
              {hasConverted &&
                summary.convertedClosingBalance !== undefined &&
                summary.convertedClosingBalanceType !== undefined && (
                  <p className="mt-0.5 text-sm text-blue-900/70">
                    {formatAmount(summary.convertedClosingBalance, convertedCurrency?.symbol)}{" "}
                    {summary.convertedClosingBalanceType}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
