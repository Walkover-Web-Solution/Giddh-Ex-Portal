"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { setSessionCookie } from "@/utils/cookies";
import { useAppDispatch } from "@/store/hooks";
import { setUserData, setAccount } from "@/store/slices/companySlice";

interface Account {
  account: {
    name: string;
    uniqueName: string;
  };
  vendorContactUniqueName: string;
}

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = params?.company as string;
  const country = params?.country as string;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAccountName, setSelectedAccountName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Retrieve pending accounts from sessionStorage
    const pendingAccounts = sessionStorage.getItem("pendingAccounts");
    const pendingToken = sessionStorage.getItem("pendingToken");
    const pendingEmail = sessionStorage.getItem("pendingEmail");

    if (pendingAccounts && pendingToken && pendingEmail) {
      setAccounts(JSON.parse(pendingAccounts));
      setToken(pendingToken);
      setEmail(pendingEmail);
    } else {
      // No pending accounts, redirect to login
      router.push(`/${company}/${country}/login`);
    }
  }, [company, country, router]);

  const handleAccountSelect = async (selectedAccount: Account) => {
    // Prevent multiple clicks
    if (isProcessing.current || loading) return;

    isProcessing.current = true;
    setLoading(true);
    setSelectedAccountName(selectedAccount.account.name);
    setError(null);

    try {
      const sessionResponse = await savePortalSession(
        selectedAccount.account,
        selectedAccount.vendorContactUniqueName,
        token,
        company
      );

      if (sessionResponse.status === "success") {
        const fullUserData = {
          email,
          account: selectedAccount.account,
          vendorContactUniqueName: selectedAccount.vendorContactUniqueName,
        };

        const companyUniqueName = sessionResponse.body.companyUniqueName;
        const sessionId = sessionResponse.body.session.id;

        // Store session only in cookie with companyName-session format
        setSessionCookie(company, sessionId);

        dispatch(
          setUserData({
            companyName: company,
            userData: fullUserData,
            companyUniqueName,
          })
        );

        dispatch(
          setAccount({
            companyName: company,
            accountUniqueName: selectedAccount.account.uniqueName,
          })
        );

        localStorage.setItem("userEmail", email);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...fullUserData,
            companyUniqueName,
          })
        );

        // Clear pending data from sessionStorage
        sessionStorage.removeItem("pendingAccounts");
        sessionStorage.removeItem("pendingToken");
        sessionStorage.removeItem("pendingEmail");

        // Small delay to ensure state is saved before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        router.push(`/${company}/${country}/welcome`);
      } else {
        setError("Failed to save session");
        setLoading(false);
        isProcessing.current = false;
      }
    } catch (err) {
      console.error("Error during account selection:", err);
      setError("Failed to select account. Please try again.");
      setLoading(false);
      isProcessing.current = false;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1e3a8a]/5 via-white to-[#1e3a8a]/10 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
          <div className="bg-[#1e3a8a] px-8 py-8 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">GIDDH</h1>
            <p className="mt-2 text-sm text-white/80">Select your account to continue</p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              {accounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleAccountSelect(account)}
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white px-6 py-4 text-center text-base font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-[#1e3a8a]/30 hover:bg-[#1e3a8a]/5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative z-10 transition-colors group-hover:text-[#1e3a8a]">
                    {account.account.name}
                  </span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#1e3a8a]/0 via-[#1e3a8a]/5 to-[#1e3a8a]/0 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a8a]/20 border-t-[#1e3a8a]"></div>
                <p className="mt-3 text-sm font-medium text-gray-600">Setting up your account...</p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">Secure access to your Giddh portal</p>
      </div>
    </div>
  );
}
