import { Transaction, Currency } from "./types";
import { formatCurrencyAmount } from "@/utils/currency";

interface Props {
  transactions: Transaction[];
  selectedCurrency: Currency;
  totalDebit: number;
  totalCredit: number;
}

export function TAccountViewTable({
  transactions,
  selectedCurrency,
  totalDebit,
  totalCredit,
}: Props) {
  const format = (amount: number | null) => {
    if (amount === null) return "";
    const symbol = selectedCurrency === "INR" ? "₹" : "£";
    return formatCurrencyAmount(amount, symbol, { decimals: 2 });
  };

  const debitTx = transactions.filter((t) => t.debit !== null);
  const creditTx = transactions.filter((t) => t.credit !== null);

  const maxRows = Math.max(debitTx.length, creditTx.length);

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-900/30 bg-white">
      <div className="min-w-[640px]">
        {/* Top Blue Header */}
        <div className="grid grid-cols-2 bg-blue-900 text-white">
          <div className="py-2 text-center text-xs font-semibold sm:py-4 sm:text-base">
            Dr (Debit)
          </div>
          <div className="border-l border-white/20 py-2 text-center text-xs font-semibold sm:py-4 sm:text-base">
            Cr (Credit)
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-2 border-b border-blue-900/20">
          <div className="grid grid-cols-[80px_1fr_100px] gap-1 px-2 py-1.5 text-[10px] font-medium text-blue-900 sm:grid-cols-[120px_1fr_160px] sm:gap-0 sm:px-4 sm:py-2 sm:text-xs">
            <span>DATE</span>
            <span>PARTICULARS</span>
            <span className="text-right">AMOUNT</span>
          </div>
          <div className="grid grid-cols-[80px_1fr_100px] gap-1 border-l border-blue-900/20 px-2 py-1.5 text-[10px] font-medium text-blue-900 sm:grid-cols-[120px_1fr_160px] sm:gap-0 sm:px-4 sm:py-2 sm:text-xs">
            <span>DATE</span>
            <span>PARTICULARS</span>
            <span className="text-right">AMOUNT</span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-blue-900/10">
          {Array.from({ length: maxRows }).map((_, i) => {
            const dr = debitTx[i];
            const cr = creditTx[i];

            return (
              <div key={i} className="grid min-h-[48px] grid-cols-2 sm:min-h-[64px]">
                {/* Debit Side */}
                <div className="grid grid-cols-[80px_1fr_100px] gap-1 px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:gap-0 sm:px-4 sm:py-3">
                  {dr ? (
                    <>
                      <div className="text-[10px] sm:text-xs">{dr.date}</div>
                      <div className="break-words text-[10px] sm:text-xs">
                        <span className="line-clamp-2">{dr.particular}</span>
                      </div>
                      <div className="text-right text-[10px] font-medium sm:text-xs">
                        {format(dr.debit)}
                        {dr.creditCurrency && (
                          <div className="text-[9px] text-blue-900/60 sm:text-xs">
                            {dr.creditCurrency}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3" />
                  )}
                </div>

                {/* Credit Side */}
                <div className="grid grid-cols-[80px_1fr_100px] gap-1 border-l border-blue-900/20 px-2 py-2 sm:grid-cols-[120px_1fr_160px] sm:gap-0 sm:px-4 sm:py-3">
                  {cr ? (
                    <>
                      <div className="text-[10px] sm:text-xs">{cr.date}</div>
                      <div className="break-words text-[10px] sm:text-xs">
                        <span className="line-clamp-2">{cr.particular}</span>
                      </div>
                      <div className="text-right text-[10px] font-medium sm:text-xs">
                        {format(cr.credit)}
                        {cr.creditCurrency && (
                          <div className="text-[9px] text-blue-900/60 sm:text-xs">
                            {cr.creditCurrency}
                          </div>
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

        {/* Totals */}
        <div className="grid grid-cols-2 border-t border-blue-900/20 bg-blue-900/5">
          <div className="grid grid-cols-[1fr_100px] gap-1 px-2 py-2 text-[10px] font-semibold sm:grid-cols-[1fr_160px] sm:gap-0 sm:px-4 sm:py-4 sm:text-sm">
            <span>Total</span>
            <span className="text-right">{format(totalDebit)}</span>
          </div>
          <div className="grid grid-cols-[1fr_100px] gap-1 border-l border-blue-900/20 px-2 py-2 text-[10px] font-semibold sm:grid-cols-[1fr_160px] sm:gap-0 sm:px-4 sm:py-4 sm:text-sm">
            <span>Total</span>
            <span className="text-right">{format(totalCredit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
