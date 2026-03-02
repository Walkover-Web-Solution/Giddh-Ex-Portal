import { LedgerView, LEDGER_VIEW_LABEL } from "@/constants/ledger";

const LEDGER_VIEW_TOGGLE_LABEL: Record<LedgerView, string> = {
  [LedgerView.STATEMENT_VIEW]: "Statement\u00A0View",
  [LedgerView.T_VIEW]: "T View",
};
import { Currency, ViewMode, CurrencyInfo } from "./types";
import { Input, InputGroup } from "@/components/ui/input";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface SearchAndViewControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  viewMode?: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  staticTransactionCode?: string;
  staticConvertedCode?: string;
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
  staticTransactionCode,
  staticConvertedCode,
}: SearchAndViewControlsProps) {
  const transactionCode = transactionCurrency?.code?.trim().toUpperCase();
  const convertedCode = convertedCurrency?.code?.trim().toUpperCase();
  const hasTwoDistinct = !!transactionCode && !!convertedCode && transactionCode !== convertedCode;

  const useStaticLabels =
    !!staticTransactionCode?.trim() &&
    !!staticConvertedCode?.trim() &&
    staticTransactionCode.trim().toUpperCase() !== staticConvertedCode.trim().toUpperCase();
  const availableCurrencies =
    useStaticLabels && staticTransactionCode && staticConvertedCode
      ? [
          { code: staticTransactionCode.trim(), label: staticTransactionCode.trim() },
          { code: staticConvertedCode.trim(), label: staticConvertedCode.trim() },
        ]
      : transactionCurrency && convertedCurrency && hasTwoDistinct
        ? [
            { code: transactionCurrency.code, label: transactionCurrency.code },
            { code: convertedCurrency.code, label: convertedCurrency.code },
          ]
        : [];
  const showCurrencyToggle = availableCurrencies.length === 2;
  return (
    <div className="w-full border-blue-900/20 bg-white">
      <div className="mx-auto max-w-7xl py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:max-w-xs">
            <InputGroup
              icon={<MagnifyingGlassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />}
            >
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Ledger"
                aria-label="Search Ledger"
                className={searchQuery.trim() ? "pr-8 sm:pr-9" : undefined}
              />
            </InputGroup>
            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-blue-900/60 hover:text-blue-900 sm:pr-3"
              >
                <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3 md:flex-nowrap">
            {showCurrencyToggle &&
              (() => {
                const currencySelectedIndex = availableCurrencies.findIndex(
                  (c) => c.code === selectedCurrency
                );
                const segmentCount = availableCurrencies.length;
                return (
                  <div
                    className="group relative inline-flex w-auto shrink-0 rounded-full bg-gray-200 p-0.5 shadow-inner outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out focus-within:outline-2 has-[:focus-visible]:outline-2"
                    style={
                      {
                        "--segment-count": segmentCount,
                        "--selected-index": currencySelectedIndex,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className="pointer-events-none absolute bottom-0.5 left-[0.125rem] top-0.5 w-[calc((100%-0.25rem)/var(--segment-count))] rounded-full bg-white transition-[transform] duration-200 ease-in-out"
                      style={{
                        transform: "translateX(calc(var(--selected-index) * 100%))",
                      }}
                      aria-hidden
                    />
                    {availableCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => onCurrencyChange(currency.code)}
                        aria-label={`Show amounts in ${currency.label}`}
                        className="relative z-10 min-w-0 flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-2 focus-visible:outline-indigo-600 sm:text-sm"
                      >
                        {currency.label}
                      </button>
                    ))}
                  </div>
                );
              })()}

            {(() => {
              const ledgerValues = Object.values(LedgerView) as LedgerView[];
              const viewChecked = viewMode === LedgerView.T_VIEW;
              return (
                <div className="group relative inline-flex w-auto min-w-[16rem] shrink-0 rounded-full bg-gray-200 p-0.5 shadow-inner outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-[:focus-visible]:outline-2">
                  <span
                    className="shadow-xs pointer-events-none absolute bottom-0.5 left-[0.125rem] top-0.5 w-[calc((100%-0.25rem)/2)] rounded-full bg-white ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-[:checked]:translate-x-full"
                    aria-hidden
                  />
                  <input
                    type="checkbox"
                    checked={viewChecked}
                    readOnly
                    tabIndex={-1}
                    aria-label="Toggle view"
                    className="pointer-events-none absolute inset-0 size-full appearance-none focus:outline-none"
                  />
                  {ledgerValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onViewModeChange(value)}
                      aria-label={`View: ${LEDGER_VIEW_LABEL[value]}`}
                      className={`relative z-10 flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-2 focus-visible:outline-indigo-600 sm:px-3 sm:py-2 sm:text-sm ${
                        value === LedgerView.STATEMENT_VIEW ? "min-w-[7.5rem]" : "min-w-0"
                      }`}
                    >
                      {LEDGER_VIEW_TOGGLE_LABEL[value]}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        {searchQuery.trim() ? (
          <p className="text-xs font-semibold text-yellow-500 sm:text-sm">
            We do not show Opening and Closing balance when filters applied.
          </p>
        ) : null}
      </div>
    </div>
  );
}
