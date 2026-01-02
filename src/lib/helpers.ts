import { debounce as _debounce, throttle as _throttle } from "lodash";

export const debounce = _debounce;
export const throttle = _throttle;

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadFile = (data: Blob | string, filename: string): void => {
  const blob = typeof data === "string" ? new Blob([data]) : data;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getQueryParams = (url?: string): Record<string, string> => {
  const searchParams = new URLSearchParams(url || window.location.search);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

export const setQueryParams = (params: Record<string, string>): void => {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, "", newUrl);
};

export const removeQueryParam = (key: string): void => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete(key);
  const newUrl = searchParams.toString()
    ? `${window.location.pathname}?${searchParams.toString()}`
    : window.location.pathname;
  window.history.pushState({}, "", newUrl);
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

export const sortBy = <T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};
