import { Transaction, Currency } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";

interface Props {
  transactions: Transaction[];
  selectedCurrency: Currency;
  totalDebit: number;
  totalCredit: number;
}

export function StatementViewTable({
  transactions,
  selectedCurrency,
  totalDebit,
  totalCredit,
}: Props) {
  const format = (amount: number | null) => {
    if (amount === null) return "-";
    const symbol = selectedCurrency === "INR" ? "₹" : "£";
    return formatCurrencyAmount(amount, symbol, { decimals: 2 });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-900/30 bg-white">
      <div className="min-w-[640px]">
        <table className="w-full text-xs sm:text-sm">
          {/* Header */}
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase sm:px-4 sm:py-4 sm:text-xs">
                Date
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase sm:px-4 sm:py-4 sm:text-xs">
                Particular
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase sm:px-4 sm:py-4 sm:text-xs">
                Debit
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase sm:px-4 sm:py-4 sm:text-xs">
                Credit
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase sm:px-4 sm:py-4 sm:text-xs">
                Closing Balance
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-blue-900/10">
            {transactions.map((tx, i) => (
              <tr key={i}>
                {/* Date */}
                <td className="px-2 py-2 sm:px-4 sm:py-4">{tx.date}</td>

                {/* Particular */}
                <td className="break-words px-2 py-2 sm:px-4 sm:py-4">
                  <span className="line-clamp-2">{tx.particular}</span>
                </td>

                {/* Debit */}
                <td className="px-2 py-2 text-right sm:px-4 sm:py-4">{format(tx.debit)}</td>

                {/* Credit */}
                <td className="px-2 py-2 text-right sm:px-4 sm:py-4">
                  {tx.credit !== null ? (
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <div className="text-right">
                        <div className="font-medium">{format(tx.credit)}</div>
                        {tx.creditCurrency && (
                          <div className="text-[10px] text-blue-900/60 sm:text-xs">
                            {tx.creditCurrency}
                          </div>
                        )}
                      </div>

                      {/* Download Icon */}
                      <button className="mt-0.5 rounded-full bg-blue-900/5 p-0.5 text-blue-900 hover:bg-blue-900/10 sm:mt-1 sm:p-1">
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
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                {/* Closing Balance */}
                <td className="px-2 py-2 text-right font-medium sm:px-4 sm:py-4">
                  <div>{format(tx.closingBalance)}</div>
                  <div className="text-[10px] text-blue-900/70 sm:text-xs">{tx.balanceType}</div>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer */}
          <tfoot className="bg-blue-900/5 font-semibold">
            <tr>
              <td colSpan={2} className="px-2 py-2 sm:px-4 sm:py-4">
                Total
              </td>
              <td className="px-2 py-2 text-right sm:px-4 sm:py-4">{format(totalDebit)}</td>
              <td className="px-2 py-2 text-right sm:px-4 sm:py-4">{format(totalCredit)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
