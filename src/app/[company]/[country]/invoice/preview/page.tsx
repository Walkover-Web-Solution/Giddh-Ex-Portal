"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCompanyUniqueName, selectAccountUniqueName } from "@/store/slices/companySlice";
import {
  getVoucherDetails,
  getInvoiceComments,
  addComment,
  downloadVoucher,
  base64ToBlob,
  PaymentDetailsResponse,
  Comment,
} from "@/utils/invoicePreview";
import { PayNow } from "@/components/PayNow";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pdfRef = useRef<HTMLIFrameElement>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const voucherUniqueName = searchParams.get("voucher") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getNames = () => {
    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if ((!companyUniqueName || !accountUniqueName) && typeof window !== "undefined") {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        companyUniqueName ||= parsed.companyUniqueName;
        accountUniqueName ||= parsed.account?.uniqueName;
      }
    }

    return { companyUniqueName, accountUniqueName };
  };

  useEffect(() => {
    if (!voucherUniqueName) return;

    const { companyUniqueName, accountUniqueName } = getNames();
    if (!companyUniqueName || !accountUniqueName) {
      setError("Missing company or account information.");
      setIsLoading(false);
      return;
    }

    loadInvoice(companyUniqueName, accountUniqueName);
  }, [voucherUniqueName]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const loadInvoice = async (companyUniqueName: string, accountUniqueName: string) => {
    setIsLoading(true);
    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId || undefined,
      };

      const [voucherRes, commentsRes] = await Promise.all([
        getVoucherDetails(request),
        getInvoiceComments(request).catch(() => ({ status: "error", body: [] })),
      ]);

      if (voucherRes.status === "success") {
        setPaymentDetails(voucherRes.body);
        const base64 = voucherRes.body.vouchers[0]?.content;
        if (base64) {
          const blob = base64ToBlob(base64);
          setPdfUrl(URL.createObjectURL(blob));
        }
      }

      if (commentsRes.status === "success") {
        setComments(commentsRes.body);
      }
    } catch {
      setError("Failed to load invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const voucher = paymentDetails?.vouchers[0];

  const handleBack = () => {
    router.push(`/${companyName}/${country}/invoices`);
  };

  const handlePrint = () => {
    pdfRef.current?.contentWindow?.print();
  };

  const handleDownload = async () => {
    const { companyUniqueName, accountUniqueName } = getNames();
    if (!companyUniqueName || !accountUniqueName) return;

    const res = await downloadVoucher({
      companyUniqueName,
      accountUniqueName,
      voucherUniqueName,
      sessionId: sessionId || undefined,
    });

    if (res.status === "success") {
      const blob = base64ToBlob(res.body);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${voucher?.number || "invoice"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto max-w-7xl px-3 py-2 md:px-6 md:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidebarToggleButton />

              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to Invoices
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Print
              </button>

              <button
                onClick={handleDownload}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {voucher && (
            <div className="rounded-lg border bg-white p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">Invoice Number</p>
                  <p className="text-lg font-semibold">{voucher.number}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="text-lg font-semibold">{voucher.dueDate}</p>
                </div>

                <div className="sm:col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500">Balance Due</p>
                  <p className="text-xl font-bold text-blue-900">
                    {paymentDetails?.currency?.symbol} {voucher.amount}
                  </p>
                </div>
              </div>

              {!voucher.canPay && voucher.message && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {voucher.message}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border bg-white p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold">Comments</h2>

            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div
                    key={comment.id || `comment-${index}`}
                    className="border-l-2 border-blue-600 pl-3"
                  >
                    <p className="text-sm">{comment.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      by {comment.userName} • {comment.dateString}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No comments yet</p>
            )}
          </div>

          {pdfUrl && (
            <div className="-mx-2 md:mx-0">
              <iframe
                src={pdfUrl}
                className="h-[75vh] w-full bg-gray-100 md:h-[85vh]"
                title="Invoice PDF"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
