export const storage = {
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    if (typeof window === "undefined") return defaultValue || null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: (key: string, value: any): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },

  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(key) !== null;
  },
};

export const sessionStorage = {
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    if (typeof window === "undefined") return defaultValue || null;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: (key: string, value: any): void => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    window.sessionStorage.clear();
  },

  has: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(key) !== null;
  },
};
