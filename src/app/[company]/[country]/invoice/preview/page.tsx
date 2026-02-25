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
import { getPaymentMethods, PAYMENT_METHODS_ENUM } from "@/utils/payment";
import { PayNow } from "@/components/PayNow";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppConfig } from "@/hooks/useAppConfig";
import { DEFAULT_CONFIG } from "@/config/default";
import { getSessionCookie } from "@/utils/cookies";
import { useToast } from "@/contexts/ToastContext";

function AuthHeader({ referenceId }: { referenceId: string }) {
  return (
    <header
      className="auth-header-preview flex flex-row items-center justify-center bg-blue-900 px-4 py-3"
      aria-label="Auth"
      data-auth-mount="invoice-preview"
    >
      <div id={referenceId} className="auth-container min-h-[44px] w-full" />
    </header>
  );
}

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pdfRef = useRef<HTMLIFrameElement>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const voucherUniqueName =
    searchParams.get("voucher") ||
    searchParams.get("voucherUniqueName") ||
    searchParams.get("invoice") ||
    searchParams.get("invoiceUniqueName") ||
    "";
  const companyUniqueNameFromUrl =
    searchParams.get("companyUniqueName") || searchParams.get("company") || "";
  const accountUniqueNameFromUrl =
    searchParams.get("accountUniqueName") || searchParams.get("account") || "";

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const { referenceId: configReferenceId } = useAppConfig();
  const referenceId = configReferenceId?.trim() || DEFAULT_CONFIG.REFERENCE_ID;

  useEffect(() => {
    const token = searchParams.get("proxy_auth_token");
    if (!token || !companyName || !country) return;
    const cleanAuthUrl = `/auth?proxy_auth_token=${encodeURIComponent(token)}&company=${encodeURIComponent(companyName)}&country=${encodeURIComponent(country)}`;
    router.replace(cleanAuthUrl);
  }, [companyName, country, router, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || !companyName || !country) return;
    sessionStorage.setItem("companyName", companyName);
    sessionStorage.setItem("country", country);
  }, [companyName, country]);

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [directPay, setDirectPay] = useState(false);
  const [checkingPayMethods, setCheckingPayMethods] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js";
    script.type = "text/javascript";
    script.defer = true;

    script.onload = () => {
      const runInit = () => {
        const authContainerElement = document.getElementById(referenceId);
        if (!authContainerElement) return;
        (window as any).initVerification?.({
          referenceId,
          success: () => console.log("[Preview Auth] Login initialized successfully"),
          failure: (err: unknown) => console.error("[Preview Auth] Login failed:", err),
        });
      };
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => runInit());
      } else {
        setTimeout(runInit, 0);
      }
    };

    script.onerror = () => console.error("[Preview Auth] Failed to load proxy-auth.js");
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [referenceId]);
  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || getSessionCookie(companyName) || null
      : null;

  const getNames = () => {
    if (companyUniqueNameFromUrl && accountUniqueNameFromUrl) {
      return {
        companyUniqueName: companyUniqueNameFromUrl,
        accountUniqueName: accountUniqueNameFromUrl,
      };
    }

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
    const { companyUniqueName, accountUniqueName } = getNames();
    if (!companyUniqueName || !accountUniqueName) {
      setIsLoading(false);
      return;
    }
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
          const blob = base64ToBlob(base64, "application/pdf");
          setPdfUrl(URL.createObjectURL(blob));
        }
      } else {
        const message = (voucherRes as { message?: string }).message;
        if (message) showToast(message, "error");
      }

      if (commentsRes.status === "success") {
        setComments(commentsRes.body);
      }
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ?? (err as { message?: string })?.message;
      if (apiMessage) showToast(apiMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const voucher = paymentDetails?.vouchers[0];

  const handleBack = () => {
    router.push(`/${companyName}/${country}/invoice`);
  };

  const navigateToInvoicePay = () => {
    const { companyUniqueName, accountUniqueName } = getNames();
    if (!accountUniqueName) return;
    const search = new URLSearchParams();
    if (companyUniqueName) search.set("companyUniqueName", companyUniqueName);
    const path = `/${encodeURIComponent(companyName)}/${encodeURIComponent(country)}/invoice-pay/account/${encodeURIComponent(accountUniqueName)}/voucher/${encodeURIComponent(voucherUniqueName)}`;
    router.push(search.toString() ? `${path}?${search.toString()}` : path);
  };

  const handlePayNowClick = async () => {
    const { companyUniqueName, accountUniqueName } = getNames();
    if (!accountUniqueName) return;
    if (!companyUniqueName) {
      navigateToInvoicePay();
      return;
    }

    setCheckingPayMethods(true);
    try {
      const sid = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sid || undefined,
      });

      const body = (response?.body ?? {}) as Record<string, unknown>;
      const isEnabled = (val: unknown) =>
        val === true ||
        (val && typeof val === "object" && (val as { enabled?: boolean }).enabled !== false);
      const enabledMethods = [
        PAYMENT_METHODS_ENUM.RAZORPAY,
        PAYMENT_METHODS_ENUM.PAYPAL,
        PAYMENT_METHODS_ENUM.PAYU,
      ].filter((key) => {
        const variants = [
          key,
          key.toLowerCase(),
          key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        ];
        return variants.some((v) => isEnabled(body[v]));
      });

      if (enabledMethods.length === 1) {
        setDirectPay(true);
      } else {
        navigateToInvoicePay();
      }
    } catch {
      navigateToInvoicePay();
    } finally {
      setCheckingPayMethods(false);
    }
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
      const blob = base64ToBlob(res.body, "application/pdf");
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
      <>
        {!sessionId && <AuthHeader referenceId={referenceId} />}
        <div className="flex flex-1 flex-row items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </>
    );
  }

  return (
    <>
      {!sessionId && <AuthHeader referenceId={referenceId} />}
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="mx-auto max-w-7xl py-2 md:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidebarToggleButton />

              <Button variant="link" size="sm" onClick={handleBack}>
                ← Back to Invoices
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {voucher?.canPay && (
                <>
                  {directPay ? (
                    <PayNow
                      invoiceUniqueName={voucherUniqueName}
                      invoiceNumber={voucher.number}
                      canPay
                      autoTrigger
                      variant="button"
                      buttonVariant="outline"
                      size="md"
                      onSuccess={() => setDirectPay(false)}
                      onAutoTriggerDone={() => setDirectPay(false)}
                      companyUniqueName={
                        companyUniqueNameFromUrl || companyUniqueNameFromRedux || undefined
                      }
                      accountUniqueName={
                        accountUniqueNameFromUrl || accountUniqueNameFromRedux || undefined
                      }
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handlePayNowClick}
                      disabled={checkingPayMethods}
                    >
                      {checkingPayMethods ? "Loading..." : "Pay Now"}
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" size="md" onClick={handlePrint}>
                Print
              </Button>
              <Button variant="outline" size="md" onClick={handleDownload}>
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {voucher && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between rounded-xl bg-white px-5 py-4">
                <div className="flex flex-row items-center justify-center gap-2">
                  <div className="flex items-center justify-center gap-1 rounded bg-gray-100 px-2 py-2">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="mt-1 text-2xl font-semibold text-gray-900">
                      {voucher.number}
                    </span>
                    {voucher.dueDate && (
                      <span className="text-lg font-medium text-gray-600">{voucher.dueDate}</span>
                    )}
                  </div>
                </div>

                <div className="mx-4 hidden h-10 w-px bg-gray-200 sm:block" />

                <div className="text-right">
                  <span className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Balance Due
                  </span>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {paymentDetails?.currency?.symbol}{" "}
                    {Number(voucher.amount).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>

              {!voucher.canPay && voucher.message && (
                <p className="mt-4 text-sm text-red-600">{voucher.message}</p>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="min-w-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddComment();
                    }}
                    className="relative"
                  >
                    <div className="rounded-lg bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2">
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
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmittingComment || !commentText.trim()}
                        >
                          {isSubmittingComment ? "Adding…" : "Add Comment"}
                        </Button>
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
            </CardContent>
          </Card>

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
