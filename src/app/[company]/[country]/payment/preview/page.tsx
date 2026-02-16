"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCompanyUniqueName, selectAccountUniqueName } from "@/store/slices/companySlice";
import {
  downloadPaymentVoucher,
  getPaymentList,
  base64ToBlob,
  PaymentVoucher,
} from "@/utils/paymentPreview";
import { ArrowLeft } from "lucide-react";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { getSessionCookie } from "@/utils/cookies";
import { useAppConfig } from "@/hooks/useAppConfig";
import { DEFAULT_CONFIG } from "@/config/default";

function AuthHeader({ referenceId }: { referenceId: string }) {
  return (
    <header
      className="auth-header-preview flex flex-row items-center justify-center bg-blue-900 px-4 py-3"
      aria-label="Auth"
      data-auth-mount="payment-preview"
    >
      <div id={referenceId} className="auth-container min-h-[44px] w-full" />
    </header>
  );
}

const EMPTY_PAYMENT_LIST = { status: "error" as const, body: { items: [], totalItems: 0 } };

export default function PaymentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pdfContainerRef = useRef<HTMLIFrameElement>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const voucherUniqueName =
    searchParams.get("voucher") || searchParams.get("voucherUniqueName") || "";
  const companyUniqueNameFromUrl = searchParams.get("companyUniqueName") || "";
  const accountUniqueNameFromUrl = searchParams.get("accountUniqueName") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [paymentVoucher, setPaymentVoucher] = useState<PaymentVoucher | null>(null);
  const [error, setError] = useState<string>("");
  const { showToast } = useToast();

  const { referenceId: configReferenceId } = useAppConfig();
  const referenceId = configReferenceId?.trim() || DEFAULT_CONFIG.REFERENCE_ID;

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasSession =
    typeof window !== "undefined" && (!!sessionId || !!getSessionCookie(companyName));

  const getCompanyAndAccountNames = () => {
    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if (!companyUniqueName || !accountUniqueName) {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            companyUniqueName = companyUniqueName || parsedData.companyUniqueName;
            accountUniqueName = accountUniqueName || parsedData.account?.uniqueName;
          } catch (e) {
            console.error("Error parsing userData:", e);
          }
        }
      }
    }

    if (!companyUniqueName) companyUniqueName = companyUniqueNameFromUrl;
    if (!accountUniqueName) accountUniqueName = accountUniqueNameFromUrl;

    return { companyUniqueName, accountUniqueName };
  };

  useEffect(() => {
    if (!voucherUniqueName) {
      setError("No payment specified.");
      setIsLoading(false);
      return;
    }

    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (companyUniqueName && accountUniqueName) {
      setError("");
      loadPaymentData(companyUniqueName, accountUniqueName);
    } else {
      setError("Missing company or account information. Please log in again.");
      setIsLoading(false);
    }
  }, [
    voucherUniqueName,
    companyUniqueNameFromUrl,
    accountUniqueNameFromUrl,
    companyUniqueNameFromRedux,
    accountUniqueNameFromRedux,
  ]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js";
    script.type = "text/javascript";
    script.defer = true;
    script.onload = () => {
      const runInit = () => {
        const el = document.getElementById(referenceId);
        if (!el) return;
        (window as unknown as { initVerification?: (opts: unknown) => void }).initVerification?.({
          referenceId,
          success: () => {},
          failure: (err: unknown) => console.error("[PaymentPreview Auth] Login failed:", err),
        });
      };
      if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(runInit);
      else setTimeout(runInit, 0);
    };
    script.onerror = () => console.error("[PaymentPreview Auth] Failed to load proxy-auth.js");
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [referenceId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const loadPaymentData = async (companyUniqueName: string, accountUniqueName: string) => {
    setIsLoading(true);
    setError("");

    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId || undefined,
      };

      let voucherResponse: Awaited<ReturnType<typeof downloadPaymentVoucher>>;
      let paymentListResponse: Awaited<ReturnType<typeof getPaymentList>>;

      if (hasSession) {
        [voucherResponse, paymentListResponse] = await Promise.all([
          downloadPaymentVoucher(request),
          getPaymentList(request).catch(() => EMPTY_PAYMENT_LIST),
        ]);
      } else {
        voucherResponse = await downloadPaymentVoucher(request);
        paymentListResponse = EMPTY_PAYMENT_LIST;
      }

      if (voucherResponse.status === "success" && voucherResponse.body) {
        const blob = base64ToBlob(voucherResponse.body);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        setError("Failed to load payment voucher. Please try again.");
      }

      if (paymentListResponse.status === "success" && paymentListResponse.body.items.length > 0) {
        setPaymentVoucher(paymentListResponse.body.items[0]);
      }
    } catch (err) {
      console.error("Error loading payment data:", err);
      setError("An error occurred while loading the payment voucher. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) return;

    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId || undefined,
      };

      const response = await downloadPaymentVoucher(request);
      if (response.status === "success" && response.body) {
        const blob = base64ToBlob(response.body);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paymentVoucher?.voucherNumber || "payment"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading payment voucher:", error);
      showToast("Failed to download payment voucher", "error");
    }
  };

  const handlePrint = () => {
    if (pdfContainerRef.current?.contentWindow) {
      pdfContainerRef.current.contentWindow.focus();
      setTimeout(() => {
        pdfContainerRef.current?.contentWindow?.print();
      }, 200);
    }
  };

  const handleBack = () => {
    router.push(`/${companyName}/${country}/payment`);
  };

  if (isLoading) {
    return (
      <>
        {!hasSession && <AuthHeader referenceId={referenceId} />}
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          {error ? (
            <div className="text-center">
              <p className="mb-4 text-red-600">{error}</p>
              <Button size="lg" onClick={handleBack}>
                Back to Payments
              </Button>
            </div>
          ) : (
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
              aria-label="Loading"
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {!hasSession && <AuthHeader referenceId={referenceId} />}
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <SidebarToggleButton />

              <Button variant="link" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sm:inline">Back</span>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" onClick={handlePrint}>
                <span className="sm:inline">Print</span>
              </Button>
              <Button variant="outline" size="lg" onClick={handleDownload}>
                <span className="sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          {pdfUrl ? (
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <iframe
                  ref={pdfContainerRef}
                  src={pdfUrl}
                  className="h-[800px] w-full"
                  title="Payment Voucher PDF"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
              {error || "Failed to load payment voucher"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
