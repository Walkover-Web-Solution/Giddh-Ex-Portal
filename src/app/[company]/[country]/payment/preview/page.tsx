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
import { ArrowLeft, Download, Printer } from "lucide-react";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";

export default function PaymentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pdfContainerRef = useRef<HTMLIFrameElement>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const voucherUniqueName = searchParams.get("voucher") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [paymentVoucher, setPaymentVoucher] = useState<PaymentVoucher | null>(null);
  const [error, setError] = useState<string>("");

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

    return { companyUniqueName, accountUniqueName };
  };

  useEffect(() => {
    if (voucherUniqueName) {
      const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
      if (companyUniqueName && accountUniqueName) {
        loadPaymentData(companyUniqueName, accountUniqueName);
      } else {
        setError("Missing company or account information. Please log in again.");
        setIsLoading(false);
      }
    }
  }, [voucherUniqueName, companyUniqueNameFromRedux, accountUniqueNameFromRedux]);

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

      const [voucherResponse, paymentListResponse] = await Promise.all([
        downloadPaymentVoucher(request),
        getPaymentList(request).catch(() => ({
          status: "error",
          body: { items: [], totalItems: 0 },
        })),
      ]);

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
    } catch (error) {
      console.error("Error loading payment data:", error);
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
      alert("Failed to download payment voucher");
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
    router.push(`/${companyName}/${country}/payments`);
  };

  if (isLoading) {
    return (
      <>
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Payments Made</h1>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          {error ? (
            <div className="text-center">
              <p className="mb-4 text-red-600">{error}</p>
              <button
                onClick={handleBack}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Payments
              </button>
            </div>
          ) : (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <SidebarToggleButton />

              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sm:inline">Back</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:flex-none"
              >
                <Printer className="h-4 w-4" />
                <span className="sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:flex-none"
              >
                <Download className="h-4 w-4" />
                <span className="sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          {pdfUrl ? (
            <div className="rounded-lg border bg-white p-4">
              <iframe
                ref={pdfContainerRef}
                src={pdfUrl}
                className="h-[800px] w-full"
                title="Payment Voucher PDF"
              />
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
