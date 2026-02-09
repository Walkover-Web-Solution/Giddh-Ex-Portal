"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteSessionCookie } from "@/utils/cookies";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const router = useRouter();
  const params = useParams();

  if (!isOpen) return null;

  const handleRelogin = () => {
    // Clear session cookie for this specific company only
    if (typeof window !== "undefined") {
      // Extract company name from URL
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const companyName = pathParts[0];

      // Delete only this company's session cookie
      if (companyName) {
        deleteSessionCookie(companyName);
      }
    }

    // Redirect to login page
    const companyName = params?.company as string;
    const country = params?.country as string;

    if (companyName && country) {
      router.push(`/${companyName}/${country}/login`);
    } else {
      router.push("/auth");
    }

    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-gray-900">Session Expired</h2>

        <p className="mb-6 text-center text-sm text-gray-600">
          Your session has expired. Please log in again to continue.
        </p>

        <Button size="lg" onClick={handleRelogin} className="w-full">
          Re-login
        </Button>
      </div>
    </div>
  );
}
