"use client";

import { getDetails } from "@/utils/proxy/getDetails";
import { verifyPortalUser } from "@/utils/proxy/verifyPortalUser";
import { savePortalSession } from "@/utils/proxy/saveSession";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectAllCompanies } from "@/store/slices/companySlice";

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("proxy_auth_token");
  const allCompanies = useAppSelector(selectAllCompanies);
  const companyName = Object.values(allCompanies)[0]?.companyName;
  const country = Object.values(allCompanies)[0]?.country;
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

          if (verifyResponse.status === "success" && verifyResponse.body[0]) {
            const userData = verifyResponse.body[0];

            const sessionResponse = await savePortalSession(
              userData.account,
              userData.vendorContactUniqueName,
              token,
              companyName
            );

            if (sessionResponse.status === "success") {
              const fullUserData = {
                ...userData,
                session: sessionResponse.body.session,
                companyUniqueName: sessionResponse.body.companyUniqueName,
              };

              localStorage.setItem("token", token);
              localStorage.setItem("userEmail", email);
              localStorage.setItem("userData", JSON.stringify(fullUserData));
              localStorage.setItem("sessionId", sessionResponse.body.session.id);

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
        console.error("Error during authentication:", err);
        setError("Authentication failed. Please try again.");
      }
    };

    authenticateUser();
  }, [token, companyName, country, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
