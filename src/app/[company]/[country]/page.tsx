"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CompanyCountryRoot() {
  const params = useParams();
  const router = useRouter();
  const company = params?.company as string;
  const country = params?.country as string;

  useEffect(() => {
    if (company && country) {
      router.push(`/${company}/${country}/login`);
    }
  }, [company, country, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
