"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectUserDetails,
} from "@/store/slices/companySlice";
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

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pdfContainerRef = useRef<HTMLIFrameElement>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const voucherUniqueName = searchParams.get("voucher") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));
  const userDetails = useAppSelector(selectUserDetails(companyName));

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [error, setError] = useState<string>("");

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthenticated = !!sessionId;

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
        loadInvoiceData(companyUniqueName, accountUniqueName);
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

  const loadInvoiceData = async (companyUniqueName: string, accountUniqueName: string) => {
    setIsLoading(true);
    setError("");
    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId || undefined,
      };

      console.log("Loading invoice data with request:", request);

      const [voucherResponse, commentsResponse] = await Promise.all([
        getVoucherDetails(request),
        getInvoiceComments(request).catch(() => ({ status: "error", body: [] })),
      ]);

      console.log("Voucher response:", voucherResponse);

      if (voucherResponse.status === "success" && voucherResponse.body) {
        setPaymentDetails(voucherResponse.body);

        const base64Content = voucherResponse.body.vouchers[0]?.content;
        if (base64Content) {
          const blob = base64ToBlob(base64Content);
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          setError("No PDF content available for this invoice.");
        }
      } else {
        setError("Failed to load invoice details. Please try again.");
      }

      if (commentsResponse.status === "success" && commentsResponse.body) {
        setComments(commentsResponse.body);
      }
    } catch (error) {
      console.error("Error loading invoice data:", error);
      setError("An error occurred while loading the invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !isAuthenticated) return;

    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) return;

    setIsAddingComment(true);
    try {
      const request = {
        companyUniqueName,
        accountUniqueName,
        voucherUniqueName,
        sessionId: sessionId!,
      };

      const response = await addComment(request, commentText);
      if (response.status === "success") {
        setCommentText("");
        const commentsResponse = await getInvoiceComments(request);
        if (commentsResponse.status === "success") {
          setComments(commentsResponse.body);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsAddingComment(false);
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

      const response = await downloadVoucher(request);
      if (response.status === "success" && response.body) {
        const blob = base64ToBlob(response.body);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paymentDetails?.vouchers[0]?.number || "invoice"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
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
    router.push(`/${companyName}/${country}/invoices`);
  };

  if (isLoading) {
    return (
      <>
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">Invoice Preview</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          {error ? (
            <div className="text-center">
              <p className="mb-4 text-red-600">{error}</p>
              <button
                onClick={handleBack}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Invoices
              </button>
            </div>
          ) : (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          )}
        </div>
      </>
    );
  }

  const voucher = paymentDetails?.vouchers[0];

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </button>
          <div className="flex gap-3">
            {voucher?.canPay && (
              <PayNow
                invoiceUniqueName={voucherUniqueName}
                invoiceNumber={voucher.number}
                amount={voucher.amount}
                currency={paymentDetails?.currency?.symbol}
                canPay={voucher.canPay}
                size="md"
              />
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {voucher && (
            <div className="rounded-lg border bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="mt-1 text-lg font-semibold">{voucher.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="mt-1 text-lg font-semibold">{voucher.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Balance Due</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {paymentDetails?.currency?.symbol} {voucher.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {!voucher.canPay && voucher.message && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {voucher.message}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Comments</h2>

            {isAuthenticated && (
              <div className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter your comments..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isAddingComment}
                  className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAddingComment ? "Adding..." : "Add Comment"}
                </button>
              </div>
            )}

            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-blue-600 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{comment.description}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          by {comment.userName} • {comment.dateString}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500">No comments yet</p>
            )}
          </div>

          {pdfUrl && (
            <div className="rounded-lg border bg-white p-4">
              <iframe
                ref={pdfContainerRef}
                src={pdfUrl}
                className="h-[800px] w-full"
                title="Invoice PDF"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
