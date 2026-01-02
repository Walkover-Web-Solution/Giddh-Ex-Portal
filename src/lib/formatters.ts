import { format, formatDistance, formatRelative, parseISO } from "date-fns";

export const formatDate = (date: Date | string, formatStr: string = "PPP"): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
};

export const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const truncateText = (text: string, maxLength: number, suffix: string = "..."): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};
