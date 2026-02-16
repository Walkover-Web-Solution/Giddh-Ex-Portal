"use client";

import { useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { getSessionCookie } from "@/utils/cookies";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const company = params?.company as string;
  const country = params?.country as string;

  useEffect(() => {
    // Public routes: no redirect to login when no session (guests can open these)
    // - invoice/preview, payment/preview, invoice-pay: view/prepay without auth
    // - auth, login: auth flows
    const publicRoutes = [
      "/auth",
      "/login",
      "/invoice/preview",
      "/payment/preview",
      "/invoice-pay",
    ];
    const isPublicRoute = publicRoutes.some((route) => pathname?.includes(route));

    if (isPublicRoute) {
      return;
    }

    // Check if session exists for this company
    if (company && country) {
      const sessionId = getSessionCookie(company);

      if (!sessionId) {
        console.log(`No session found for ${company}, redirecting to login`);
        router.push(`/${company}/${country}/login`);
      }
    }
  }, [company, country, pathname, router]);

  return <>{children}</>;
}
