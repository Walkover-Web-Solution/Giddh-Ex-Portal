"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { useAppDispatch } from "@/store/hooks";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { sessionManager } from "@/utils/sessionManager";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Button } from "@/components/ui/button";
import { TIMING } from "@/constants/timing";
import type { Account } from "@/types/auth";
import { logger } from "@/utils/logger";
import { useConfig } from "@/contexts/ConfigContext";

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { config } = useConfig();
  const company = params?.company as string;
  const country = params?.country as string;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const pendingAuth = sessionManager.getPendingAuth();

    if (pendingAuth) {
      setAccounts(pendingAuth.accounts);
      setToken(pendingAuth.token);
      setEmail(pendingAuth.email);
    } else {
      router.push(`/${company}/${country}/login`);
    }
  }, [company, country, router]);

  const handleAccountSelect = async (selectedAccount: Account) => {
    // Prevent multiple clicks
    if (isProcessing.current || loading) return;

    isProcessing.current = true;
    setLoading(true);
    setError(null);

    try {
      // Store proxy token for account switching
      if (token) {
        localStorage.setItem("proxy_auth_token", token);
      }

      const sessionResponse = await savePortalSession(
        selectedAccount.account,
        selectedAccount.vendorContactUniqueName,
        token,
        company,
        country
      );

      if (sessionResponse.status === "success") {
        const companyUniqueName = sessionResponse.body.companyUniqueName;
        const sessionId = sessionResponse.body.session.id;

        await setupUserSession({
          company,
          country,
          email,
          account: selectedAccount.account,
          vendorContactUniqueName: selectedAccount.vendorContactUniqueName,
          companyUniqueName,
          sessionId,
          dispatch,
        });

        sessionManager.clearPendingAuth();

        await new Promise((resolve) => setTimeout(resolve, TIMING.REDIRECT_DELAY));

        router.push(`/${company}/${country}/welcome`);
      } else {
        setError("Failed to save session");
        setLoading(false);
        isProcessing.current = false;
      }
    } catch (err) {
      logger.error("Error during account selection", err);
      setError("Failed to select account. Please try again.");
      setLoading(false);
      isProcessing.current = false;
    }
  };

  if (accounts.length === 0) {
    return <LoadingSpinner message="Signing you in..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-giddh-primary/5 via-white to-giddh-primary/10 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-900/5">
          <div className="bg-giddh-primary px-8 py-8 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-sm">GIDDH</h1>
            <p className="mt-2 text-sm text-white/80">Select your account to continue</p>
          </div>

          <div className="px-6 py-6">
            {error && <ErrorMessage message={error} />}

            <div className="space-y-2">
              {accounts.map((account, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="xl"
                  onClick={() => handleAccountSelect(account)}
                  disabled={loading}
                  className="group relative h-auto min-h-12 w-full min-w-0 whitespace-normal px-4 py-4 text-center leading-snug"
                >
                  <span className="relative z-10 block max-w-full break-words text-pretty transition-colors group-hover:text-indigo-700">
                    {account.account.name}
                  </span>
                </Button>
              ))}
            </div>

            {loading && (
              <div className="mt-6">
                <LoadingSpinner message="Signing you in..." variant="brand" fullScreen={false} />
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Secure access to your {config.BRAND_NAME} portal
        </p>
      </div>
    </div>
  );
}
