"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCompanyData } from "@/store/slices/companySlice";
import { getSessionCookie } from "@/utils/cookies";
import { sessionManager } from "@/utils/sessionManager";
import { useAppConfig } from "@/hooks/useAppConfig";
import { getAuthRedirectPath } from "@/utils/auth/getAuthRedirectPath";

function getActiveSession(
  currentCompany: string,
  currentCountry: string
): { slug: string; country: string } | null {
  // Check if this exact company has a session — handled separately
  if (getSessionCookie(currentCompany)) return null;

  // Primary: check localStorage userData (written by setupUserSession)
  try {
    const rawUserData = localStorage.getItem("userData");
    if (rawUserData) {
      const userData = JSON.parse(rawUserData);
      const activeSlug = userData?.company;
      const activeCountry = userData?.country;
      if (activeSlug && activeCountry && activeSlug !== currentCompany) {
        if (getSessionCookie(activeSlug)) {
          return { slug: activeSlug, country: activeCountry };
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback: scan all cookies for any "*-session" cookie
  // Handles sessions created before userData stored company/country fields
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name] = cookie.trim().split("=");
      if (name && name.endsWith("-session")) {
        const slug = name.slice(0, -"-session".length);
        if (slug && slug !== currentCompany) {
          // Use currentCountry as the redirect country — same portal
          return { slug, country: currentCountry };
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { referenceId } = useAppConfig();
  const company = params?.company as string;
  const country = params?.country as string;

  // Detect redirect conditions synchronously so the auth script is never loaded
  // when we are about to navigate away.
  const [isRedirecting, setIsRedirecting] = useState(() => {
    if (typeof window === "undefined" || !company || !country) return false;
    if (getSessionCookie(company)) return true;
    const other = getActiveSession(company, country);
    return other !== null;
  });

  useEffect(() => {
    if (company && country) {
      dispatch(setCompanyData({ companyName: company, country }));
      sessionManager.setCompanyData(company, country);
    }
  }, [company, country, dispatch]);

  useEffect(() => {
    const token = searchParams.get("proxy_auth_token");
    if (!token || !company || !country) return;
    setIsRedirecting(true);
    const authUrl = `/auth?proxy_auth_token=${encodeURIComponent(token)}&company=${encodeURIComponent(company)}&country=${encodeURIComponent(country)}`;
    router.replace(authUrl);
  }, [company, country, router, searchParams]);

  useEffect(() => {
    if (!company || !country) return;

    // If this company already has a session, go to welcome
    const sessionId = getSessionCookie(company);
    if (sessionId) {
      setIsRedirecting(true);
      router.push(`/${company}/${country}/welcome`);
      return;
    }

    // If a DIFFERENT company is already logged in, redirect to that company instead
    const other = getActiveSession(company, country);
    if (other) {
      setIsRedirecting(true);
      router.replace(`/${other.slug}/${other.country}/welcome`);
    }
  }, [company, country, router]);

  useEffect(() => {
    // Never load the auth widget if we are navigating away
    if (isRedirecting || !referenceId) return;

    const script = document.createElement("script");
    script.src = "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js";
    script.type = "text/javascript";
    script.defer = true;

    script.onload = () => {
      (window as any).initVerification?.({
        referenceId,
        theme: "light",
        addInfo: {
          redirect_path: getAuthRedirectPath(country),
        },
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
  }, [referenceId, isRedirecting]);

  if (isRedirecting) return null;

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
