import { LedgerView, LEDGER_VIEW_LABEL } from "@/constants/ledger";
import { Currency, ViewMode, CurrencyInfo } from "./types";
import { Input, InputGroup } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

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
          <div className="w-full sm:max-w-xs">
            <InputGroup
              icon={<MagnifyingGlassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />}
            >
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search transactions..."
                aria-label="Search transactions"
              />
            </InputGroup>
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
              {(Object.values(LedgerView) as LedgerView[]).map((value) => (
                <button
                  key={value}
                  onClick={() => onViewModeChange(value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition sm:px-4 sm:py-1.5 sm:text-sm ${
                    viewMode === value ? "bg-white text-blue-900 shadow-sm" : "text-blue-900"
                  }`}
                >
                  {LEDGER_VIEW_LABEL[value]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
