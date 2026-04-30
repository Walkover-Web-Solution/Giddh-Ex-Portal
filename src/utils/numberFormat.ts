import {
  DEFAULT_NUMBER_FORMAT_LOCALE,
  NUMBER_FORMAT_LOCALE_MAP,
} from "@/constants/numberFormat";

/**
 * Giddh-style round-off (exponential-safe). Exported for future use; portal
 * number display does not call this — formatting relies on Intl / simple round.
 */
export function giddhRoundOff(number: number, decimals = 0): number {
  if (!("" + number).includes("e")) {
    return +(Math.round(Number(number + "e+" + decimals)) + "e-" + decimals);
  }
  const arr = ("" + number).split("e");
  let sig = "";
  if (+arr[1] + decimals > 0) {
    sig = "+";
  }
  return +(
    Math.round(Number(+arr[0] + "e" + sig + (+arr[1] + decimals))) + "e-" + decimals
  );
}

/**
 * Maps company balanceDisplayFormat to an Intl.NumberFormat locale.
 */
export function getLocaleFromDisplayFormat(displayFormat: string): string {
  return NUMBER_FORMAT_LOCALE_MAP[displayFormat] || DEFAULT_NUMBER_FORMAT_LOCALE;
}

/**
 * Formats a number with locale-specific grouping and fixed decimal places.
 * Rounding follows `Intl.NumberFormat` (main path) or `Math.round` (fallback).
 *
 * For locales that use a comma as the decimal separator but not "." as the
 * thousands separator (e.g. fr-FR), the decimal mark is normalized to "."
 * so balances match Giddh portal expectations. Locales that use "." for
 * grouping (e.g. de-DE) keep native separators to avoid ambiguous output.
 */
export function formatNumber(value: number, decimalPlaces: number, locale: string): string {
  const formatLocale = locale || DEFAULT_NUMBER_FORMAT_LOCALE;
  const n = Number.isFinite(value) ? value : 0;

  try {
    const nf = new Intl.NumberFormat(formatLocale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: true,
    });

    if (typeof nf.formatToParts === "function") {
      const parts = nf.formatToParts(n);
      const usesDotAsGrouping = parts.some(
        (p) => p.type === "group" && p.value === "."
      );
      if (!usesDotAsGrouping) {
        return parts.map((p) => (p.type === "decimal" ? "." : p.value)).join("");
      }
    }

    return nf.format(n);
  } catch {
    return basicNumberFormat(n, decimalPlaces);
  }
}

function basicNumberFormat(value: number, decimalPlaces: number): string {
  const factor = 10 ** decimalPlaces;
  const roundedValue = Math.round(value * factor) / factor;
  const [integerPart, decimalPart = ""] = roundedValue.toString().split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPlaces > 0
    ? `${formattedInteger}.${decimalPart.padEnd(decimalPlaces, "0").substring(0, decimalPlaces)}`
    : formattedInteger;
}
