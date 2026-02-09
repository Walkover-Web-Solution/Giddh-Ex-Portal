"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccountUniqueName } from "@/store/slices/companySlice";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { logger } from "@/utils/logger";
import { TIMING } from "@/constants/timing";
import type { Account } from "@/types/auth";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { mergeClassNames } from "@/lib/utils";

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

  // Fetch accounts on mount to know if we should show the button (hide when single account)
  useEffect(() => {
    if (company) {
      fetchAccounts();
    }
  }, [company]);

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

      if (verifyResponse.status === ApiResponseStatus.SUCCESS && verifyResponse.body?.length > 0) {
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

  if (accounts.length === 1) {
    return null;
  }
  if (fetchingAccounts && accounts.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={mergeClassNames(
          "inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "bg-gray-50"
        )}
      >
        <span className="text-xs sm:text-sm">Switch Account</span>
        <ChevronDownIcon
          aria-hidden
          className={mergeClassNames(
            "-mr-1 size-5 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none">
          <div className="py-1">
            {error && (
              <div className="px-4 py-2">
                <ErrorMessage message={error} />
              </div>
            )}

            {fetchingAccounts ? (
              <div className="py-4">
                <LoadingSpinner message="Loading accounts..." fullScreen={false} />
              </div>
            ) : accounts.length > 0 ? (
              <div className="space-y-0">
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
                      className={mergeClassNames(
                        "block w-full px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50",
                        isCurrentAccount
                          ? "bg-indigo-50 font-medium text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{account.account.name}</span>
                        {isCurrentAccount && (
                          <span className="text-xs text-indigo-600">Current</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                {error ? "Error loading accounts" : "No accounts available"}
              </div>
            )}

            {loading && (
              <div className="border-t border-gray-100 px-4 py-2">
                <LoadingSpinner message="Switching account..." fullScreen={false} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
