"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { getSessionCookie } from "@/utils/cookies";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const companyName = params?.company as string;
  const userDetails = useAppSelector(selectUserDetails(companyName));
  const gstin = userDetails?.addresses?.[0]?.gstNumber as string;
  const companyAddress = userDetails?.addresses?.[0]?.address as string;

  const isLoginPage = pathname?.includes("/login");
  const isAuthPage = pathname?.includes("/auth");
  const isPreviewPage = pathname?.includes("/preview");
  const isInvoicePayPage = pathname?.includes("/invoice-pay");

  const [showSidebarOnPreview, setShowSidebarOnPreview] = useState(false);

  // Redirect invoice-pay to payment/preview immediately so we never show sidebar/layout
  const invoicePayCompany = params?.company as string | undefined;
  const invoicePayCountry = params?.country as string | undefined;
  const invoicePayAccount = params?.accountUniqueName as string | undefined;
  const invoicePayVoucher = params?.voucherUniqueName as string | undefined;
  const invoicePayCompanyUnique = searchParams.get("companyUniqueName") ?? "";
  useEffect(() => {
    if (!isInvoicePayPage) return;
    if (!invoicePayCompany || !invoicePayCountry || !invoicePayAccount || !invoicePayVoucher)
      return;
    const query = new URLSearchParams();
    query.set("voucher", invoicePayVoucher);
    query.set("accountUniqueName", invoicePayAccount);
    if (invoicePayCompanyUnique) query.set("companyUniqueName", invoicePayCompanyUnique);
    router.replace(
      `/${encodeURIComponent(invoicePayCompany)}/${encodeURIComponent(invoicePayCountry)}/payment/preview?${query.toString()}`
    );
  }, [
    isInvoicePayPage,
    invoicePayCompany,
    invoicePayCountry,
    invoicePayAccount,
    invoicePayVoucher,
    invoicePayCompanyUnique,
    router,
  ]);

  useEffect(() => {
    if (isPreviewPage && companyName) {
      setShowSidebarOnPreview(!!getSessionCookie(companyName));
    }
  }, [isPreviewPage, companyName]);

  const hideSidebar =
    isLoginPage || isAuthPage || isInvoicePayPage || (isPreviewPage && !showSidebarOnPreview);

  // While redirecting from invoice-pay, show only a minimal spinner (no sidebar)
  if (isInvoicePayPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
          aria-label="Loading"
        />
      </div>
    );
  }

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
    if (typeof window === "undefined") return;

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

    if (companyName && companyUniqueName && accountUniqueName) {
      hasCalledApis.current = true;
      dispatch(fetchCompanyDetails({ companyName, companyUniqueName, accountUniqueName })).catch(
        () => {}
      );
      dispatch(fetchUserDetails({ companyName, companyUniqueName, accountUniqueName })).catch(
        () => {}
      );
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
