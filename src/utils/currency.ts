export interface Currency {
  code: string;
  symbol: string;
}

export const DEFAULT_CURRENCY: Currency = {
  code: "INR",
  symbol: "₹",
};

export function formatCurrencyAmount(
  amount: number | undefined | null,
  currency?: Currency | string | null,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string {
  const { showSymbol = true, showCode = false, decimals = 2 } = options || {};

  const numericAmount = amount !== undefined && amount !== null ? amount : 0;

  let currencySymbol = DEFAULT_CURRENCY.symbol;
  let currencyCode = DEFAULT_CURRENCY.code;

  if (currency) {
    if (typeof currency === "string") {
      currencySymbol = currency;
    } else {
      currencySymbol = currency.symbol || DEFAULT_CURRENCY.symbol;
      currencyCode = currency.code || DEFAULT_CURRENCY.code;
    }
  }

  const formattedAmount = numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const parts: string[] = [];

  if (showSymbol) {
    parts.push(currencySymbol);
  }

  if (showCode) {
    parts.push(currencyCode);
  }

  parts.push(formattedAmount);

  return parts.join(" ");
}

export function getCurrencySymbol(currency?: Currency | string | null): string {
  if (!currency) {
    return DEFAULT_CURRENCY.symbol;
  }

  if (typeof currency === "string") {
    return currency;
  }

  return currency.symbol || DEFAULT_CURRENCY.symbol;
}

export function getCurrencyCode(currency?: Currency | null): string {
  if (!currency) {
    return DEFAULT_CURRENCY.code;
  }

  return currency.code || DEFAULT_CURRENCY.code;
}

export function getCurrencyDisplay(currency?: Currency | null): string {
  const code = getCurrencyCode(currency);
  const symbol = getCurrencySymbol(currency);
  return `${code} - ${symbol}`;
}
