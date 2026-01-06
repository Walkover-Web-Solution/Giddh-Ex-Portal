"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("proxy_auth_token");
  console.log("⚡️ ~ :10 ~ Auth ~ token:", token);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      //   router.push("/");
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
