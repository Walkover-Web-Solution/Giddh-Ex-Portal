"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanyDetails,
  fetchCompanyAddress,
  fetchUserDetails,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectCompanyAddress,
  selectCompanyGstin,
  selectCompanyDisplayName,
} from "@/store/slices/companySlice";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import SessionGuard from "@/components/SessionGuard";
import { mergeClassNames } from "@/lib/utils";
import { getSessionCookie } from "@/utils/cookies";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const params = useParams();
  const companyName = params?.company as string;
  const companyDisplayName = useAppSelector(selectCompanyDisplayName(companyName)) ?? "";
  const companyAddress = useAppSelector(selectCompanyAddress(companyName));
  const gstin = useAppSelector(selectCompanyGstin(companyName));

  const isLoginPage = pathname?.includes("/login");
  const isAuthPage = pathname?.includes("/auth");

  const hideSidebar = isLoginPage || isAuthPage;

  const isInvoicePreview = pathname?.includes("/invoice/preview");
  const isInvoicePay = pathname?.includes("/invoice-pay");
  const isPaymentPreview = pathname?.includes("/payment/preview");
  const isNoSessionFooterRoute = isInvoicePreview || isInvoicePay || isPaymentPreview;
  const hasSession = companyName ? !!getSessionCookie(companyName) : false;
  const showFooter = !(isNoSessionFooterRoute && !hasSession);

  if (hideSidebar) {
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
        {showFooter && (
          <Footer
            companyName={companyDisplayName}
            gstin={gstin ?? ""}
            companyAddress={companyAddress ?? undefined}
            supportEmail="support@giddh.com"
            variant="full"
          />
        )}
      </main>
    </div>
  );
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const hasCalledApisForCompany = useRef<string | null>(null);

  const companyName = params?.company as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLoginOrAuth = pathname?.includes("/login") || pathname?.includes("/auth");
    if (isLoginOrAuth) return;

    const sessionId = getSessionCookie(companyName);
    if (!sessionId) return;

    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if (!companyUniqueName) {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          companyUniqueName = parsedData.companyUniqueName;
          accountUniqueName = parsedData.account?.uniqueName ?? accountUniqueName;
        } catch (e) {
          console.error("Error parsing userData:", e);
        }
      }
    }

    const callKey = `${companyName}__${accountUniqueName}`;
    if (hasCalledApisForCompany.current === callKey) return;

    if (companyName && companyUniqueName && accountUniqueName) {
      hasCalledApisForCompany.current = callKey;
      dispatch(fetchCompanyDetails({ companyName, companyUniqueName, accountUniqueName })).catch(
        () => {}
      );
      dispatch(fetchUserDetails({ companyName, companyUniqueName, accountUniqueName })).catch(
        () => {}
      );
      dispatch(fetchCompanyAddress({ companyName, companyUniqueName, accountUniqueName })).catch(
        () => {}
      );
    }
  }, [dispatch, companyName, pathname, companyUniqueNameFromRedux, accountUniqueNameFromRedux]);

  return (
    <SessionGuard>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </SessionGuard>
  );
}
