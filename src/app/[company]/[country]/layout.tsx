"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanyDetails,
  fetchUserDetails,
  selectCompanyUniqueName,
  selectAccountUniqueName,
} from "@/store/slices/companySlice";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import SessionGuard from "@/components/SessionGuard";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("/login");
  const isAuthPage = pathname?.includes("/auth");

  if (isLoginPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main
        className={`flex flex-1 flex-col transition-[margin-left] duration-500 ease-in-out ${isCollapsed ? "ml-20" : "ml-64"}`}
        style={{ willChange: "margin-left" }}
      >
        {children}
        <Footer
          companyName="KJ-NV-1 - Trigger"
          gstin="23MNBH2323A1Z4"
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
