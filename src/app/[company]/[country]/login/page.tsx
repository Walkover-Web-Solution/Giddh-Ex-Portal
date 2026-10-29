"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setCompanyData } from "@/store/slices/companySlice";
import { getSessionCookie } from "@/utils/cookies";
import { sessionManager } from "@/utils/sessionManager";
import { useAppConfig } from "@/hooks/useAppConfig";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { TIMING } from "@/constants/timing";
import {
  verifyPortalUserByAccessToken,
  type VerifyPortalUserProvider,
} from "@/utils/auth/verifyPortalUserByAccessToken";
import { ensureGoogleSdk, requestGoogleAccessToken, getGoogleUserEmail } from "@/utils/auth/googleIdentity";
import { openOtpWidget } from "@/utils/auth/msg91OtpWidget";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Logo36Blocks } from "@/components/icon/Logo36Blocks";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { logger } from "@/utils/logger";
import type { Account } from "@/types/auth";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { googleClientId, otpWidgetId, otpWidgetToken } = useAppConfig();
  const company = params?.company as string;
  const country = params?.country as string;

  const [isRedirecting, setIsRedirecting] = useState(() => {
    if (typeof window === "undefined" || !company || !country) return false;
    return Boolean(getSessionCookie(company));
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = isGoogleLoading || isOtpLoading;
  const isProcessing = useRef(false);

  useEffect(() => {
    if (company && country) {
      dispatch(setCompanyData({ companyName: company, country }));
      sessionManager.setCompanyData(company, country);
    }
  }, [company, country, dispatch]);

  useEffect(() => {
    if (!company || !country) return;

    const sessionId = getSessionCookie(company);
    if (sessionId) {
      setIsRedirecting(true);
      router.push(`/${company}/${country}/welcome`);
    }
  }, [company, country, router]);

  useEffect(() => {
    ensureGoogleSdk().catch((err) => logger.error("Failed to load Google SDK", err));
  }, []);

  const handleVerifiedAccounts = async (
    accounts: Account[],
    accessToken: string,
    provider: VerifyPortalUserProvider,
    fallbackEmail?: string
  ) => {
    // Store token for account switching (SwitchAccountButton/PayNow rely on these keys)
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("authProvider", provider);

    if (accounts.length > 1) {
      sessionManager.setPendingAuth(accounts, accessToken, accounts[0]?.email ?? fallbackEmail ?? "", "accessToken");
      router.push(`/${company}/${country}/auth`);
      return;
    }

    const selectedAccount = accounts[0];
    const email = selectedAccount.email ?? fallbackEmail ?? "";

    localStorage.setItem("proxy_auth_token", accessToken);

    const sessionResponse = await savePortalSession(
      selectedAccount.account,
      selectedAccount.vendorContactUniqueName,
      undefined,
      company,
      country,
      accessToken,
      provider
    );

    if (sessionResponse.status === "success") {
      await setupUserSession({
        company,
        country,
        email,
        account: selectedAccount.account,
        vendorContactUniqueName: selectedAccount.vendorContactUniqueName,
        companyUniqueName: sessionResponse.body.companyUniqueName,
        sessionId: sessionResponse.body.session.id,
        dispatch,
      });
      await new Promise((resolve) => setTimeout(resolve, TIMING.REDIRECT_DELAY));
      router.push(`/${company}/${country}/welcome`);
    } else {
      setError((sessionResponse as { message?: string }).message ?? "Failed to save session");
    }
  };

  const handleGoogleLogin = async () => {
    if (isProcessing.current || isBusy) return;
    isProcessing.current = true;
    setError(null);
    setIsGoogleLoading(true);

    try {
      await ensureGoogleSdk();

      if (!googleClientId) {
        setError("Google login is not configured for this environment.");
        return;
      }

      const accessToken = await requestGoogleAccessToken(googleClientId);
      const email = await getGoogleUserEmail(accessToken);

      if (!email) {
        setError("Unable to fetch your Google email. Please try again.");
        return;
      }

      const response = await verifyPortalUserByAccessToken(accessToken, company, "google", country, email);

      if (response.status === ApiResponseStatus.SUCCESS && response.body?.length > 0) {
        await handleVerifiedAccounts(response.body, accessToken, "google", email);
      } else {
        setError((response as { message?: string }).message ?? "Unable to login with Google.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      logger.error("Google login failed", err);
      setError(message || "Unable to login with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
      isProcessing.current = false;
    }
  };

  const handleOtpLogin = async () => {
    if (isProcessing.current || isBusy) return;
    isProcessing.current = true;
    setError(null);
    setIsOtpLoading(true);

    try {
      if (!otpWidgetId || !otpWidgetToken) {
        setError("OTP login is not configured for this environment.");
        return;
      }

      const otpResult = await openOtpWidget(otpWidgetId, otpWidgetToken);
      const accessToken = otpResult?.message;

      if (!accessToken) {
        setError("Unable to verify OTP. Please try again.");
        return;
      }

      const response = await verifyPortalUserByAccessToken(accessToken, company, "otp", country);

      if (response.status === ApiResponseStatus.SUCCESS && response.body?.length > 0) {
        await handleVerifiedAccounts(response.body, accessToken, "otp");
      } else {
        setError((response as { message?: string }).message ?? "Unable to login with OTP.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      logger.error("OTP login failed", err);
      setError(message || "Unable to login with OTP. Please try again.");
    } finally {
      setIsOtpLoading(false);
      isProcessing.current = false;
    }
  };

  if (isRedirecting) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md sm:max-w-md sm:p-8">
        <h1 className="mb-4 text-center text-xl font-bold sm:text-2xl">Login</h1>
        <p className="mb-6 text-center text-sm text-gray-600 sm:text-base">
          Welcome back! Please enter your details.
        </p>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="space-y-3 px-6">
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="h-11 w-full gap-3 text-sm border border-[#000]"
            onClick={handleGoogleLogin}
            disabled={isBusy}
          >
            <img
              src="https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span>{isGoogleLoading ? "Signing in..." : "Continue with Google"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xl"
            className="h-11 w-full gap-3 text-sm border border-[#000]"
            onClick={handleOtpLogin}
            disabled={isBusy}
          >
              <img
              src="https://campaignfileupload.s3.ap-south-1.amazonaws.com/featureServiceIcon/msg91.svg"
              alt="OTP"
              className="h-5 w-5"
            />
            <span>{isOtpLoading ? "Verifying..." : "Login With OTP"}</span>
          </Button>
        </div>

        {isBusy && (
          <div className="mt-4">
            <LoadingSpinner message="" variant="brand" fullScreen={false} size="sm" />
          </div>
        )}

        

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-gray-400">
          Powered by
          <Logo36Blocks />
        </p>
      </div>
    </div>
  );
}
