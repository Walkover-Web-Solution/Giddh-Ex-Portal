import { Currency, CurrencyInfo, Transaction } from "./types";

export interface CurrencyConfig {
  hasMultipleCurrencies: boolean;
  isConvertedCurrencySelected: boolean;
  primaryCurrency?: CurrencyInfo;
  secondaryCurrency?: CurrencyInfo;
}

export function normalizeCode(code: string | undefined): string {
  return (code ?? "").trim().toUpperCase();
}

export function getCurrencyConfig(
  selectedCurrency: Currency,
  transactionCurrency?: CurrencyInfo,
  convertedCurrency?: CurrencyInfo
): CurrencyConfig {
  const transactionCode = normalizeCode(transactionCurrency?.code);
  const convertedCode = normalizeCode(convertedCurrency?.code);
  const hasMultipleCurrencies =
    transactionCode.length > 0 && convertedCode.length > 0 && transactionCode !== convertedCode;

  const selectedNorm = normalizeCode(selectedCurrency);
  const isConvertedCurrencySelected = hasMultipleCurrencies && selectedNorm === convertedCode;

  const primaryCurrency = isConvertedCurrencySelected ? convertedCurrency : transactionCurrency;

  const secondaryCurrency = isConvertedCurrencySelected ? transactionCurrency : convertedCurrency;

  return {
    hasMultipleCurrencies,
    isConvertedCurrencySelected,
    primaryCurrency,
    secondaryCurrency,
  };
}

export function getPrimaryAmount(
  tx: Transaction,
  field: "debit" | "credit" | "closingBalance",
  isConvertedCurrencySelected: boolean
): number | null {
  if (isConvertedCurrencySelected) {
    if (field === "debit") return tx.debitConverted ?? null;
    if (field === "credit") return tx.creditConverted ?? null;
    return tx.closingBalanceConverted ?? null;
  }
  return tx[field] ?? null;
}

export function getSecondaryAmount(
  tx: Transaction,
  field: "debit" | "credit" | "closingBalance",
  hasMultipleCurrencies: boolean,
  isConvertedCurrencySelected: boolean
): number | null {
  if (!hasMultipleCurrencies) return null;
  if (isConvertedCurrencySelected) {
    return tx[field] ?? null;
  }
  if (field === "debit") return tx.debitConverted ?? null;
  if (field === "credit") return tx.creditConverted ?? null;
  return tx.closingBalanceConverted ?? null;
}
