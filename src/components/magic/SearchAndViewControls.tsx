import { MagicLinkViewMode } from "@/constants/ledger";
import { Currency, ViewMode, CurrencyInfo } from "./types";

interface SearchAndViewControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
}

export function SearchAndViewControls({
  searchQuery,
  onSearchChange,
  selectedCurrency,
  onCurrencyChange,
  viewMode,
  onViewModeChange,
  transactionCurrency,
  convertedCurrency,
}: SearchAndViewControlsProps) {
  const transactionCode = transactionCurrency?.code?.trim().toUpperCase();
  const convertedCode = convertedCurrency?.code?.trim().toUpperCase();
  const hasTwoDistinct = !!transactionCode && !!convertedCode && transactionCode !== convertedCode;

  const availableCurrencies =
    transactionCurrency && convertedCurrency && hasTwoDistinct
      ? [
          { code: transactionCurrency.code, label: transactionCurrency.code },
          { code: convertedCurrency.code, label: convertedCurrency.code },
        ]
      : [];
  const showCurrencyToggle = hasTwoDistinct && availableCurrencies.length === 2;
  return (
    <div className="w-full border-blue-900/20 bg-white">
      <div className="mx-auto max-w-7xl py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:max-w-xs">
            <svg
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-900/60 sm:left-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.6-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-md border border-blue-900/30 bg-white py-1.5 pl-8 pr-3 text-xs text-blue-900 placeholder-gray-500 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 sm:py-2 sm:pl-9 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {showCurrencyToggle && (
              <div className="flex rounded-md bg-blue-900/5 p-0.5 sm:p-1">
                {availableCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => onCurrencyChange(currency.code)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
                      selectedCurrency === currency.code
                        ? "bg-blue-900 text-white"
                        : "text-blue-900"
                    }`}
                  >
                    {currency.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex rounded-md bg-blue-900/5 p-0.5 sm:p-1">
              {(
                [
                  { label: "Statement View", value: MagicLinkViewMode.STATEMENT },
                  { label: "T View", value: MagicLinkViewMode.T },
                ] as { label: string; value: ViewMode }[]
              ).map((view) => (
                <button
                  key={view.value}
                  onClick={() => onViewModeChange(view.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
                    viewMode === view.value ? "bg-white text-blue-900 shadow-sm" : "text-blue-900"
                  }`}
                >
                  <span className="hidden sm:inline">{view.label}</span>
                  <span className="sm:hidden">
                    {view.value === MagicLinkViewMode.STATEMENT ? "Statement" : "T"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
