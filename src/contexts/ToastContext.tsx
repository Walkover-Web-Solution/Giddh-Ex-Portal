"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

const toastStyles = {
  success: {
    container: "rounded-md bg-green-50 p-4",
    icon: CheckCircleIcon,
    iconClass: "size-5 text-green-400",
    messageClass: "text-sm font-medium text-green-800",
    dismissClass:
      "inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-green-50 focus-visible:outline-none",
  },
  error: {
    container: "rounded-md bg-red-50 p-4",
    icon: XCircleIcon,
    iconClass: "size-5 text-red-400",
    messageClass: "text-sm font-medium text-red-800",
    dismissClass:
      "inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50 focus-visible:outline-none",
  },
  info: {
    container: "rounded-md bg-blue-50 p-4",
    icon: InformationCircleIcon,
    iconClass: "size-5 text-blue-400",
    messageClass: "text-sm font-medium text-blue-800",
    dismissClass:
      "inline-flex rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50 focus-visible:outline-none",
  },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const item: ToastItem = { id, message, type };
      setToasts((prev) => [...prev, item]);

      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION_MS);
      timeoutsRef.current.set(id, timeoutId);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          const Icon = style.icon;
          return (
            <div key={toast.id} role="alert" className={style.container}>
              <div className="flex">
                <div className="shrink-0">
                  <Icon aria-hidden className={style.iconClass} />
                </div>
                <div className="ml-3">
                  <p className={style.messageClass}>{toast.message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => removeToast(toast.id)}
                      aria-label="Dismiss"
                    >
                      <XMarkIcon aria-hidden className="size-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
