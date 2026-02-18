"use client";

import { getDetails } from "@/utils/proxy/getDetails";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllCompanies } from "@/store/slices/companySlice";
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
  const allCompanies = useAppSelector(selectAllCompanies);

  const companyName =
    companyParam ||
    Object.values(allCompanies)[0]?.companyName ||
    (typeof window !== "undefined" ? sessionStorage.getItem("companyName") : null);

  const country =
    countryParam ||
    Object.values(allCompanies)[0]?.country ||
    (typeof window !== "undefined" ? sessionStorage.getItem("country") : null);

  const hasCalledRef = useRef(false);

  useEffect(() => {
    const authenticateUser = async () => {
      if (!token || !companyName || hasCalledRef.current || configLoading) return;

      hasCalledRef.current = true;

      const goToLogin = () => {
        if (companyName && country) {
          router.push(`/${encodeURIComponent(companyName)}/${encodeURIComponent(country)}/login`);
        } else {
          router.push("/");
        }
      };

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
        logger.error("Error during authentication", err);
        const apiMessage =
          (err as { response?: { data?: { message?: string } }; message?: string }).response?.data
            ?.message ??
          (err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "Authentication failed. Please try again.");
        showToast(apiMessage, "error");
        goToLogin();
      }
    };

    authenticateUser();
  }, [token, companyName, country, router, configLoading, showToast]);
}
