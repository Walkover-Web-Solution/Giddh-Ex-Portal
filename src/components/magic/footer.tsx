import { CurrencyInfo } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";

interface FooterProps {
  summary: {
    totalTransactions: number;
    debitCount: number;
    creditCount: number;
    openingBalance: number;
    openingBalanceType: "Dr" | "Cr";
    netTotalCredit: number;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
    closingBalanceType: "Dr" | "Cr";
    reckoningDebitTotal?: number;
    reckoningCreditTotal?: number;
  };
  companyCurrency?: CurrencyInfo;
}

export function Footer({ summary, companyCurrency }: FooterProps) {
  const formatAmount = (amount: number | null) => {
    if (amount === null) return "-";
    const symbol = companyCurrency?.symbol || "₹";
    return formatCurrencyAmount(amount, symbol, { decimals: 2 });
  };

  return (
    <div className="rounded-xl border border-blue-900/20 bg-blue-900/[0.02] px-3 py-4 sm:px-6 sm:py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <div>
          <p className="text-xs text-blue-900/70 sm:text-sm">
            Total Transactions {summary.totalTransactions}
          </p>
          <p className="mt-1.5 text-base font-semibold text-blue-900 sm:mt-2 sm:text-lg">
            Dr {summary.debitCount} <span className="text-blue-900/40">|</span> Cr{" "}
            {summary.creditCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-blue-900/70 sm:text-sm">Opening Balance</p>
          <p className="mt-1.5 text-base font-semibold text-blue-900 sm:mt-2 sm:text-lg">
            {formatAmount(summary.openingBalance)} {summary.openingBalanceType}
          </p>
        </div>

        <div>
          <p className="text-xs text-blue-900/70 sm:text-sm">Net Total Credit</p>
          <p className="mt-1.5 text-lg font-semibold text-blue-900 sm:mt-2 sm:text-xl">
            {formatAmount(summary.netTotalCredit)}
          </p>
          <div className="mt-1 text-[10px] text-blue-900/60 sm:text-xs">
            <p>Dr Total {formatAmount(summary.totalDebit)}</p>
            <p>Cr Total {formatAmount(summary.totalCredit)}</p>
            {summary.reckoningDebitTotal !== undefined &&
              summary.reckoningCreditTotal !== undefined && (
                <>
                  <p className="mt-1 font-semibold">Reckoning:</p>
                  <p>Dr {formatAmount(summary.reckoningDebitTotal)}</p>
                  <p>Cr {formatAmount(summary.reckoningCreditTotal)}</p>
                </>
              )}
          </div>
        </div>

        <div>
          <p className="text-xs text-blue-900/70 sm:text-sm">Closing Balance</p>
          <p className="mt-1.5 text-lg font-semibold text-blue-900 sm:mt-2 sm:text-xl">
            {formatAmount(summary.closingBalance)} {summary.closingBalanceType}
          </p>
        </div>
      </div>
    </div>
  );
}
