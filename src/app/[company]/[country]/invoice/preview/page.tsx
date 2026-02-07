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
  const companyUniqueNameFromUrl = searchParams.get("companyUniqueName") || "";
  const accountUniqueNameFromUrl = searchParams.get("accountUniqueName") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getNames = () => {
    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if ((!companyUniqueName || !accountUniqueName) && typeof window !== "undefined") {
      const stored = localStorage.getItem("userData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          companyUniqueName ||= parsed.companyUniqueName;
          accountUniqueName ||= parsed.account?.uniqueName;
        } catch {
          // Skip invalid userData; continue with Redux or URL params
        }
      }
    }

    if (!companyUniqueName) companyUniqueName = companyUniqueNameFromUrl;
    if (!accountUniqueName) accountUniqueName = accountUniqueNameFromUrl;

    return { companyUniqueName, accountUniqueName };
  };

  useEffect(() => {
    if (!voucherUniqueName) {
      setError("No invoice specified.");
      setIsLoading(false);
      return;
    }

    const { companyUniqueName, accountUniqueName } = getNames();
    if (!companyUniqueName || !accountUniqueName) {
      setError("Missing company or account information.");
      setIsLoading(false);
      return;
    }

    setError("");
    loadInvoice(companyUniqueName, accountUniqueName);
  }, [
    voucherUniqueName,
    companyUniqueNameFromUrl,
    accountUniqueNameFromUrl,
    companyUniqueNameFromRedux,
    accountUniqueNameFromRedux,
  ]);

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
      } else {
        setError("Failed to load invoice.");
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
    router.push(`/${companyName}/${country}/invoice`);
  };

  const handlePrint = () => {
    if (pdfRef.current?.contentWindow) {
      pdfRef.current.contentWindow.print();
    } else {
      if (pdfUrl) {
        const printWindow = window.open(pdfUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
    }
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

  function formatCommentDate(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "0 days ago";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text) {
      setCommentError("Please enter a comment.");
      return;
    }

    const { companyUniqueName, accountUniqueName } = getNames();
    if (!companyUniqueName || !accountUniqueName) {
      setCommentError("Missing company or account information.");
      return;
    }

    setCommentError("");
    setIsSubmittingComment(true);
    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId || undefined,
      };
      const res = await addComment(request, text);
      if (res.status === "success") {
        setCommentText("");
        const commentsRes = await getInvoiceComments(request);
        if (commentsRes.status === "success") {
          setComments(commentsRes.body);
        }
      } else {
        setCommentError((res as { message?: string }).message || "Login required to add comments");
      }
    } catch {
      setCommentError("Login required to add comments");
    } finally {
      setIsSubmittingComment(false);
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
        <div className="mx-auto max-w-7xl py-2 md:py-3">
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
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
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
            </div>
          )}

          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="mb-3 text-lg font-semibold">Comments</h2>

              <div className="mb-4">
                <div className="min-w-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddComment();
                    }}
                    className="relative"
                  >
                    <div className="rounded-lg bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                      <label htmlFor="invoice-comment" className="sr-only">
                        Add your comment
                      </label>
                      <textarea
                        id="invoice-comment"
                        name="comment"
                        rows={3}
                        placeholder="Add your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={isSubmittingComment}
                        className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
                      />
                      <div aria-hidden="true" className="py-2">
                        <div className="py-px">
                          <div className="h-1" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                      <div className="flex items-center" />
                      <div className="shrink-0">
                        <button
                          type="submit"
                          disabled={isSubmittingComment || !commentText.trim()}
                          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50"
                        >
                          {isSubmittingComment ? "Adding…" : "Add Comment"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
              </div>

              {comments.length > 0 ? (
                <div className="max-h-[280px] overflow-y-auto overflow-x-hidden rounded-md pr-1">
                  <div className="space-y-3 py-1">
                    {comments.map((comment, index) => (
                      <div
                        key={comment.id ?? `comment-${index}`}
                        className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 border-l-2 border-gray-300 pl-3"
                      >
                        <span className="whitespace-nowrap text-sm text-gray-500">
                          {formatCommentDate(comment.dateString)}
                        </span>

                        <span className="break-words text-sm">{comment.description}</span>

                        <span className="whitespace-nowrap text-xs text-gray-500">
                          by {comment.userName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No comments yet</p>
              )}
            </div>
          </div>

          {pdfUrl && (
            <div className="-mx-2 md:mx-0">
              <iframe
                ref={pdfRef}
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
