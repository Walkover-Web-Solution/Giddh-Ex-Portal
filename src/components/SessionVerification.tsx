"use client";

import { useEffect, useState } from "react";
import SessionExpiredModal from "./SessionExpiredModal";

export default function SessionVerification({ children }: { children: React.ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    // Listen for session-expired events from API interceptor
    const handleSessionExpired = () => {
      setIsSessionExpired(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("session-expired", handleSessionExpired);
    }

    // Cleanup listener on unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("session-expired", handleSessionExpired);
      }
    };
  }, []);

  return (
    <>
      {children}
      <SessionExpiredModal isOpen={isSessionExpired} onClose={() => setIsSessionExpired(false)} />
    </>
  );
}
