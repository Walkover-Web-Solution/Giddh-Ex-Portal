"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setCompanyData } from "@/store/slices/companySlice";
import { getSessionCookie } from "@/utils/cookies";
import { sessionManager } from "@/utils/sessionManager";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
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
        referenceId: process.env.NEXT_PUBLIC_REFERENCE_ID,
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
  }, []);

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
          <p className="text-center text-gray-600">Welcome back! Please enter your details.</p>
          <div
            id={process.env.NEXT_PUBLIC_REFERENCE_ID}
            className="mt-6 flex flex-col items-center justify-center"
          ></div>
        </div>
      </div>
    </>
  );
}
