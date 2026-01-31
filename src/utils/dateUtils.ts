import { format as formatDateFns, parse, isValid } from "date-fns";

/** API/ledger date format: dd-MM-yyyy */
const API_DATE_FORMAT = "dd-MM-yyyy";

/**
 * Format a Date for API requests (dd-MM-yyyy).
 */
export function formatDateToAPI(date: Date): string {
  return formatDateFns(date, API_DATE_FORMAT);
}

/**
 * Format a date string for display (dd-MM-yyyy).
 * Accepts any parseable date string and returns dd-MM-yyyy.
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString);
  if (!isValid(date)) return dateString;
  return formatDateFns(date, API_DATE_FORMAT);
}

/**
 * Parse a date string from API (dd-MM-yyyy or d-M-yyyy).
 */
export function parseDateFromAPI(dateStr: string): Date {
  if (!dateStr?.trim()) return new Date(NaN);
  const trimmed = dateStr.trim();
  try {
    const parsed = parse(trimmed, API_DATE_FORMAT, new Date());
    if (isValid(parsed)) return parsed;
    const relaxed = parse(trimmed, "d-M-yyyy", new Date());
    return isValid(relaxed) ? relaxed : new Date(trimmed);
  } catch {
    return new Date(trimmed);
  }
}

/**
 * Parse a transaction/ledger date string (dd-MM-yyyy or dd-MM-yy).
 * Returns start-of-day Date or invalid Date on failure.
 */
export function parseTransactionDate(dateString: string): Date {
  if (!dateString?.trim()) return new Date();

  const parts = dateString.trim().split("-");
  if (parts.length !== 3) {
    const parsed = new Date(dateString);
    if (!isValid(parsed)) return new Date();
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  try {
    const parsed = parse(dateString, API_DATE_FORMAT, new Date());
    if (isValid(parsed)) return parsed;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return isValid(d) ? d : new Date();
  } catch {
    return new Date();
  }
}

/**
 * Get timestamp for sorting (dd-MM-yyyy or dd-MM-yy string).
 */
export function parseDateToTimestamp(dateStr: string): number {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const month = parts[1].padStart(2, "0");
    const day = parts[0].padStart(2, "0");
    const normalized = `${year}-${month}-${day}`;
    const parsed = parse(normalized, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed.getTime() : NaN;
  }
  return new Date(dateStr).getTime();
}
