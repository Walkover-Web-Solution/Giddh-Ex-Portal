"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const params = useParams();
  const company = params?.company as string;
  const country = params?.country as string;

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
