"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanyDetails,
  fetchUserDetails,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectUserDetails,
} from "@/store/slices/companySlice";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import SessionGuard from "@/components/SessionGuard";
import { mergeClassNames } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("/login");
  const isAuthPage = pathname?.includes("/auth");
  const isPreviewPage = pathname?.includes("/preview");
  const params = useParams();
  const companyName = params?.company as string;
  const userDetails = useAppSelector(selectUserDetails(companyName));
  const gstin = userDetails?.addresses?.[0]?.gstNumber as string;
  const companyAddress = userDetails?.addresses?.[0]?.address as string;

  if (isLoginPage || isAuthPage || isPreviewPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-between overflow-x-hidden bg-gray-50">
      <Sidebar />
      <main
        className={mergeClassNames(
          "flex flex-1 flex-col transition-[margin-left] duration-300",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
        style={{ willChange: "margin-left" }}
      >
        <div className="flex-1">{children}</div>
        <Footer
          companyName={companyName}
          gstin={gstin}
          companyAddress={companyAddress}
          supportEmail="support@giddh.com"
          variant="full"
        />
      </main>
    </div>
  );
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const dispatch = useAppDispatch();
  const hasCalledApis = useRef(false);

  const companyName = params?.company as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  useEffect(() => {
    if (hasCalledApis.current) return;

    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if (!companyUniqueName && typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          companyUniqueName = parsedData.companyUniqueName;
          accountUniqueName = parsedData.account?.uniqueName;
        } catch (e) {
          console.error("Error parsing userData:", e);
        }
      }
    }

    if (companyName && companyUniqueName && accountUniqueName) {
      hasCalledApis.current = true;
      dispatch(fetchCompanyDetails({ companyName, companyUniqueName, accountUniqueName }));
      dispatch(fetchUserDetails({ companyName, companyUniqueName, accountUniqueName }));
    }
  }, [dispatch, companyName, companyUniqueNameFromRedux, accountUniqueNameFromRedux]);

  return (
    <SessionGuard>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </SessionGuard>
  );
}
