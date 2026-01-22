"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccountUniqueName } from "@/store/slices/companySlice";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { logger } from "@/utils/logger";
import { TIMING } from "@/constants/timing";
import type { Account } from "@/types/auth";
import { ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SwitchAccountButton() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = params?.company as string;
  const country = params?.country as string;
  const currentAccountUniqueName = useAppSelector(selectAccountUniqueName(company));

  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isProcessing = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    if (fetchingAccounts || isProcessing.current) return;

    setFetchingAccounts(true);
    setError(null);

    try {
      const email = localStorage.getItem("userEmail");
      const proxyToken = localStorage.getItem("proxy_auth_token");

      if (!email || !proxyToken) {
        setError("Authentication data not found. Please log in again.");
        setFetchingAccounts(false);
        return;
      }

      const verifyResponse = await verifyPortalUser(email, company, proxyToken);

      if (verifyResponse.status === "success" && verifyResponse.body?.length > 0) {
        setAccounts(verifyResponse.body);
        if (verifyResponse.body.length === 1) {
          setError(null);
          // Still show the account, but user can't switch to it (it's already selected)
        }
      } else {
        setError("No accounts found.");
      }
    } catch (err: any) {
      logger.error("Error fetching accounts", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please check your connection and try again.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to fetch accounts. Please try again.");
      }
    } finally {
      setFetchingAccounts(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      if (accounts.length === 0 && !fetchingAccounts) {
        fetchAccounts();
      }
    }
  };

  const handleAccountSelect = async (selectedAccount: Account) => {
    if (isProcessing.current || loading) return;

    isProcessing.current = true;
    setLoading(true);
    setError(null);

    try {
      const proxyToken = localStorage.getItem("proxy_auth_token");
      const email = localStorage.getItem("userEmail");

      if (!proxyToken || !email) {
        setError("Authentication data not found. Please log in again.");
        setLoading(false);
        isProcessing.current = false;
        return;
      }

      const sessionResponse = await savePortalSession(
        selectedAccount.account,
        selectedAccount.vendorContactUniqueName,
        proxyToken,
        company
      );

      if (sessionResponse.status === "success") {
        const companyUniqueName = sessionResponse.body.companyUniqueName;
        const sessionId = sessionResponse.body.session.id;

        await setupUserSession({
          company,
          email,
          account: selectedAccount.account,
          vendorContactUniqueName: selectedAccount.vendorContactUniqueName,
          companyUniqueName,
          sessionId,
          dispatch,
        });

        await new Promise((resolve) => setTimeout(resolve, TIMING.REDIRECT_DELAY));

        // Refresh the page to reload with new account data
        router.refresh();
        window.location.reload();
      } else {
        setError("Failed to switch account");
        setLoading(false);
        isProcessing.current = false;
      }
    } catch (err: any) {
      logger.error("Error during account switch", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please check your connection and try again.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to switch account. Please try again.");
      }
      setLoading(false);
      isProcessing.current = false;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "bg-gray-50"
        )}
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        <span>Switch Account</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            {error && (
              <div className="mb-2">
                <ErrorMessage message={error} />
              </div>
            )}

            {fetchingAccounts ? (
              <div className="py-4">
                <LoadingSpinner message="Loading accounts..." fullScreen={false} />
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-1">
                {accounts.map((account, index) => {
                  const isCurrentAccount =
                    account.account.uniqueName === currentAccountUniqueName ||
                    (!currentAccountUniqueName &&
                      typeof window !== "undefined" &&
                      account.account.uniqueName ===
                        JSON.parse(localStorage.getItem("userData") || "{}")?.account?.uniqueName);
                  return (
                    <button
                      key={index}
                      onClick={() => handleAccountSelect(account)}
                      disabled={loading || isCurrentAccount}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        isCurrentAccount
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{account.account.name}</span>
                        {isCurrentAccount && <span className="text-xs text-blue-600">Current</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                {error ? "Error loading accounts" : "No accounts available"}
              </div>
            )}

            {loading && (
              <div className="mt-2">
                <LoadingSpinner message="Switching account..." fullScreen={false} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
