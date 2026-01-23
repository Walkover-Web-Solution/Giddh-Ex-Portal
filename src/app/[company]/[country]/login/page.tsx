"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCompanyData } from "@/store/slices/companySlice";
import { getSessionCookie } from "@/utils/cookies";
import { sessionManager } from "@/utils/sessionManager";
import { useAppConfig } from "@/hooks/useAppConfig";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { referenceId } = useAppConfig();
  const company = params?.company as string;
  const country = params?.country as string;

  useEffect(() => {
    if (company && country) {
      dispatch(setCompanyData({ companyName: company, country }));
      sessionManager.setCompanyData(company, country);
    }
  }, [company, country, dispatch]);

  useEffect(() => {
    if (company && country) {
      const sessionId = getSessionCookie(company);
      if (sessionId) {
        router.push(`/${company}/${country}/welcome`);
      }
    }
  }, [company, country, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js";
    script.type = "text/javascript";
    script.defer = true;

    script.onload = () => {
      (window as any).initVerification?.({
        referenceId,
        success: () => {
          console.log("Login initialized successfully");
        },
        failure: (error: any) => {
          console.error("Login failed:", error);
        },
      });
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [referenceId]);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md sm:max-w-md sm:p-8">
          <h1 className="mb-4 text-center text-xl font-bold sm:text-2xl">Login</h1>
          <p className="mb-6 text-center text-sm text-gray-600 sm:text-base">
            Welcome back! Please enter your details.
          </p>
          <div id={referenceId} className="auth-container" />
        </div>
      </div>
    </>
  );
}
