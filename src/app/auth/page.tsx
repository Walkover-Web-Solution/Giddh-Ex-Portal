"use client";

import { getDetails } from "@/utils/proxy/getDetails";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { sessionManager } from "@/utils/sessionManager";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { logger } from "@/utils/logger";
import { useConfig } from "@/contexts/ConfigContext";
import { useToast } from "@/contexts/ToastContext";

export default function Auth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isLoading: configLoading } = useConfig();
  const token = searchParams.get("proxy_auth_token");
  const companyParam = searchParams.get("company");
  const countryParam = searchParams.get("country");
  const companyName =
    companyParam || (typeof window !== "undefined" ? sessionStorage.getItem("companyName") : null);

  const country =
    countryParam || (typeof window !== "undefined" ? sessionStorage.getItem("country") : null);

  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search || "";
    const hasDuplicateAuth = search.includes("/auth?");
    if (!hasDuplicateAuth) return;
    const tokenFromUrl = searchParams.get("proxy_auth_token");
    const companyFromUrl = searchParams.get("company");
    const countryFromUrl = searchParams.get("country");
    if (!tokenFromUrl) return;
    const params = new URLSearchParams();
    params.set("proxy_auth_token", tokenFromUrl);
    if (companyFromUrl) params.set("company", companyFromUrl);
    if (countryFromUrl) params.set("country", countryFromUrl);
    const cleanQuery = params.toString();
    if (window.location.search !== `?${cleanQuery}`) {
      router.replace(`/auth?${cleanQuery}`, { scroll: false });
    }
  }, [router, searchParams]);

  useEffect(() => {
    const goToLogin = () => {
      if (companyName && country) {
        router.push(`/${encodeURIComponent(companyName)}/${encodeURIComponent(country)}/login`);
      } else {
        router.push("/");
      }
    };

    // Token present but company/country missing (e.g. link from Giddh without company param)
    if (token && !configLoading && !companyName && !hasCalledRef.current) {
      hasCalledRef.current = true;
      showToast(
        "This sign-in link is incomplete. Please use the portal link from your invitation (it should open from your company's portal URL).",
        "error"
      );
      router.replace("/");
      return;
    }

    const authenticateUser = async () => {
      if (!token || !companyName || hasCalledRef.current || configLoading) return;

      hasCalledRef.current = true;

      try {
        const detailsResponse = await getDetails(token);

        if (detailsResponse.status === "success" && detailsResponse.data[0]?.email) {
          const email = detailsResponse.data[0].email;

          const verifyResponse = await verifyPortalUser(email, companyName, token);

          if (
            verifyResponse.status === ApiResponseStatus.SUCCESS &&
            verifyResponse.body?.length > 0
          ) {
            const accounts = verifyResponse.body;

            // If multiple accounts, redirect to account selection page
            if (accounts.length > 1) {
              sessionManager.setPendingAuth(accounts, token, email);
              router.push(`/${companyName}/${country}/auth`);
              return;
            }

            // Single account - proceed with normal flow
            const userData = accounts[0];

            // Store proxy token for account switching
            if (token) {
              localStorage.setItem("proxy_auth_token", token);
            }

            const sessionResponse = await savePortalSession(
              userData.account,
              userData.vendorContactUniqueName,
              token,
              companyName
            );

            if (sessionResponse.status === "success") {
              const companyUniqueName = sessionResponse.body.companyUniqueName;
              const sessionId = sessionResponse.body.session.id;

              await setupUserSession({
                company: companyName,
                email,
                account: userData.account,
                vendorContactUniqueName: userData.vendorContactUniqueName,
                companyUniqueName,
                sessionId,
                dispatch,
              });

              router.push(`/${companyName}/${country}/welcome`);
            } else {
              const msg =
                (sessionResponse as { message?: string }).message ?? "Failed to save session";
              showToast(msg, "error");
              goToLogin();
            }
          } else {
            const msg =
              (verifyResponse as { message?: string }).message ?? "User verification failed";
            showToast(msg, "error");
            goToLogin();
          }
        } else {
          const msg =
            (detailsResponse as { message?: string }).message ?? "Failed to get user details";
          showToast(msg, "error");
          goToLogin();
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const apiMessage =
          error.response?.data?.message ??
          (err instanceof Error ? err.message : typeof err === "string" ? err : null);
        if (!error.response?.data?.message) {
          logger.error("Error during authentication", err);
        }
        if (apiMessage) showToast(apiMessage, "error");
        goToLogin();
      }
    };

    authenticateUser();
  }, [token, companyName, country, router, configLoading, showToast]);

  if (token) {
    return <LoadingSpinner message="Signing you in..." />;
  }

  return null;
}
