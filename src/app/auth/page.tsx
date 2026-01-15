"use client";

import { getDetails } from "@/utils/proxy/getDetails";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectAllCompanies } from "@/store/slices/companySlice";
import { setupUserSession } from "@/utils/auth/setupUserSession";
import { sessionManager } from "@/utils/sessionManager";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { logger } from "@/utils/logger";

export default function Auth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
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

  const [error, setError] = useState<string | null>(null);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    const authenticateUser = async () => {
      if (!token || !companyName || hasCalledRef.current) return;

      hasCalledRef.current = true;

      try {
        const detailsResponse = await getDetails(token);

        if (detailsResponse.status === "success" && detailsResponse.data[0]?.email) {
          const email = detailsResponse.data[0].email;

          const verifyResponse = await verifyPortalUser(email, companyName, token);

          if (verifyResponse.status === "success" && verifyResponse.body?.length > 0) {
            const accounts = verifyResponse.body;

            // If multiple accounts, redirect to account selection page
            if (accounts.length > 1) {
              sessionManager.setPendingAuth(accounts, token, email);
              router.push(`/${companyName}/${country}/auth`);
              return;
            }

            // Single account - proceed with normal flow
            const userData = accounts[0];

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
              setError("Failed to save session");
            }
          } else {
            setError("User verification failed");
          }
        } else {
          setError("Failed to get user details");
        }
      } catch (err) {
        logger.error("Error during authentication", err);
        setError("Authentication failed. Please try again.");
      }
    };

    authenticateUser();
  }, [token, companyName, country, router]);

  if (error) {
    return <ErrorMessage message={error} onRetry={() => router.push("/")} variant="page" />;
  }

  return <LoadingSpinner message="Authenticating..." variant="brand" />;
}
