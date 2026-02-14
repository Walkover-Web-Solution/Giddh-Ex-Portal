"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCompanyUniqueName, selectAccountUniqueName } from "@/store/slices/companySlice";
import {
  getPaymentMethods,
  getInvoicePayVoucherDetails,
  getPaymentMethodList,
  PAYMENT_METHODS_ENUM,
  PaymentMethodsResponse,
  PaymentMethodListResponse,
  InvoicePayVoucherDetailsResponse,
} from "@/utils/payment";
import { getCompanyAndAccountNames as getStorageNames } from "@/utils/getUserDataFromStorage";
import { useAppConfig } from "@/hooks/useAppConfig";
import { DEFAULT_CONFIG } from "@/config/default";
import { PayNow } from "@/components/PayNow";
import { Button } from "@/components/ui/button";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { useToast } from "@/contexts/ToastContext";
import { getSessionCookie } from "@/utils/cookies";

function AuthHeader({ referenceId }: { referenceId: string }) {
  return (
    <header
      className="auth-header-preview flex flex-row items-center justify-center bg-blue-900 px-4 py-3"
      aria-label="Auth"
      data-auth-mount="invoice-pay"
    >
      <div id={referenceId} className="auth-container min-h-[44px] w-full" />
    </header>
  );
}

/** Map payment method type key to image path (only public/icons exist; no /images/ folder). */
function getImageForType(type: string): string {
  const images: Record<string, string> = {
    paypal: "/icons/paypal.svg",
    payu: "/icons/payu.svg",
    razorpay: "/icons/razorpay.svg",
  };
  return images[type] ?? "";
}

/** Gateway + methods for radio list (debitcard filtered out). */
interface MappedGateway {
  value: PAYMENT_METHODS_ENUM;
  methods: Array<{ typeKey: string; label: string; image: string }>;
}

export default function InvoicePayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { referenceId: configReferenceId } = useAppConfig();
  const referenceId = configReferenceId?.trim() || DEFAULT_CONFIG.REFERENCE_ID;

  const companyName = params?.company as string;
  const country = params?.country as string;
  const slug = params?.slug as string[] | undefined;
  const isSlugRoute =
    Array.isArray(slug) && slug.length === 4 && slug[0] === "account" && slug[2] === "voucher";
  const accountUniqueNameParam = isSlugRoute ? slug[1] : (params?.accountUniqueName as string);
  const voucherUniqueNameParam = isSlugRoute ? slug[3] : (params?.voucherUniqueName as string);

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || getSessionCookie(companyName) || null
      : null;

  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<InvoicePayVoucherDetailsResponse | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentMethodList, setPaymentMethodList] = useState<PaymentMethodListResponse | null>(
    null
  );
  const [mappedPaymentMethodsFlat, setMappedPaymentMethodsFlat] = useState<MappedGateway[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PAYMENT_METHODS_ENUM | null>(
    null
  );
  const [canPayInvoice, setCanPayInvoice] = useState(true);
  const [paidInvoiceMessage, setPaidInvoiceMessage] = useState("");
  const [panelOpenState, setPanelOpenState] = useState(true);
  const [returnInvoicePay, setReturnInvoicePay] = useState("");

  const getNames = useCallback(() => {
    return getStorageNames(companyUniqueNameFromRedux, accountUniqueNameFromRedux);
  }, [companyUniqueNameFromRedux, accountUniqueNameFromRedux]);

  const accountUniqueName = accountUniqueNameParam || getNames().accountUniqueName;
  const companyUniqueName = searchParams.get("companyUniqueName") || getNames().companyUniqueName;
  const hasAccount = Boolean(accountUniqueNameParam || accountUniqueName);
  const canLoadApis = Boolean(companyUniqueName && accountUniqueName && voucherUniqueNameParam);

  useEffect(() => {
    document.body.classList.add("invoice-pay");
    return () => {
      document.body.classList.remove("invoice-pay");
    };
  }, []);

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
          failure: (err: unknown) => console.error("[InvoicePay Auth] Login failed:", err),
        });
      };
      if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(runInit);
      else setTimeout(runInit, 0);
    };
    script.onerror = () => console.error("[InvoicePay Auth] Failed to load proxy-auth.js");
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [referenceId]);

  useEffect(() => {
    if (!accountUniqueName || !companyUniqueName) {
      setIsLoading(false);
      return;
    }
    setReturnInvoicePay(
      typeof window !== "undefined"
        ? window.location.pathname.replace(`/${companyName}`, "") || ""
        : ""
    );
  }, [accountUniqueName, companyUniqueName, companyName]);

  const loadPaymentMethods = useCallback(async () => {
    if (!companyUniqueName || !accountUniqueName) return;
    try {
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });
      if (response?.status === ApiResponseStatus.SUCCESS && response.body) {
        const body = response.body as Record<string, unknown>;
        const hasAny =
          body.RAZORPAY === true ||
          body.PAYPAL === true ||
          body.PAYU === true ||
          (body.RAZORPAY && typeof body.RAZORPAY === "object") ||
          (body.PAYPAL && typeof body.PAYPAL === "object") ||
          (body.PAYU && typeof body.PAYU === "object");
        if (hasAny) {
          setPaymentMethods(response.body as PaymentMethodsResponse);
          if (body.RAZORPAY === true || (body.RAZORPAY && typeof body.RAZORPAY === "object")) {
            setSelectedPaymentMethod(PAYMENT_METHODS_ENUM.RAZORPAY);
          } else if (body.PAYPAL === true || (body.PAYPAL && typeof body.PAYPAL === "object")) {
            setSelectedPaymentMethod(PAYMENT_METHODS_ENUM.PAYPAL);
          } else if (body.PAYU === true || (body.PAYU && typeof body.PAYU === "object")) {
            setSelectedPaymentMethod(PAYMENT_METHODS_ENUM.PAYU);
          }
          loadVoucherDetails();
        } else {
          showToast("No payment method is integrated", ToastType.WARNING);
          setIsLoading(false);
        }
      } else {
        showToast((response as { message?: string })?.message ?? "Failed to load payment methods");
        setIsLoading(false);
      }
    } catch {
      showToast("Failed to load payment methods");
      setIsLoading(false);
    }
  }, [companyUniqueName, accountUniqueName, sessionId, showToast]);

  const loadPaymentMethodList = useCallback(async () => {
    if (!companyUniqueName || !accountUniqueName) return;
    try {
      const response = await getPaymentMethodList({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });
      if (response?.status === ApiResponseStatus.SUCCESS && response.body) {
        setPaymentMethodList(response.body);
        const list = response.body;
        const flat: MappedGateway[] = Object.entries(list).map(([mainKey, methods]) => ({
          value: mainKey as PAYMENT_METHODS_ENUM,
          methods: Object.entries(methods)
            .filter(([typeKey]) => typeKey !== "debitcard")
            .map(([typeKey, label]) => ({
              typeKey,
              label: typeof label === "string" ? label : String(label),
              image: getImageForType(typeKey),
            })),
        }));
        setMappedPaymentMethodsFlat(flat);
      }
    } catch {
      // non-blocking
    }
  }, [companyUniqueName, accountUniqueName, sessionId]);

  const loadVoucherDetails = useCallback(async () => {
    if (!companyUniqueName || !accountUniqueName || !voucherUniqueNameParam) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const voucherUniqueNameArray = voucherUniqueNameParam.split("|").filter(Boolean);
    try {
      const response = await getInvoicePayVoucherDetails({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
        voucherUniqueNames: voucherUniqueNameArray,
      });
      setIsLoading(false);
      if (response?.status === ApiResponseStatus.SUCCESS && response.body) {
        let details = response.body;

        const hasPaidVouchers = details.vouchers?.filter((v) => v.status === "PAID") ?? [];
        if (hasPaidVouchers.length === 0) {
          setCanPayInvoice(true);
        } else {
          setCanPayInvoice(false);
          const paidNumbers = hasPaidVouchers.map((v) => v.number);
          const paidMessage = paidNumbers.length > 1 ? " are" : " is";
          setPaidInvoiceMessage(paidNumbers.join(", ") + paidMessage + " successfully paid.");
        }

        const hasPayerID = searchParams.get("PayerID");
        if (hasPayerID) {
          setCanPayInvoice(false);
          setPaidInvoiceMessage("Invoice payment is being processed.");
          if (details.vouchers?.[0]) {
            details = {
              ...details,
              vouchers: [
                {
                  ...details.vouchers[0],
                  canPay: false,
                  message: "Invoice payment is being processed.",
                },
                ...details.vouchers.slice(1),
              ],
            };
          }
        }

        setPaymentDetails(details);
      } else {
        showToast((response as { message?: string })?.message ?? "Failed to load voucher details");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg =
        (err as { response?: { data?: { message?: string }; status?: number } })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch voucher details";
      console.error("[InvoicePay] Voucher details error:", err);
      showToast(msg);
    }
  }, [
    companyUniqueName,
    accountUniqueName,
    voucherUniqueNameParam,
    sessionId,
    searchParams,
    showToast,
  ]);

  useEffect(() => {
    if (canLoadApis) {
      loadPaymentMethods();
      loadPaymentMethodList();
    } else if (!hasAccount || !companyUniqueName || !voucherUniqueNameParam) {
      setIsLoading(false);
    }
  }, [
    canLoadApis,
    hasAccount,
    companyUniqueName,
    voucherUniqueNameParam,
    loadPaymentMethods,
    loadPaymentMethodList,
  ]);

  const backToInvoice = () => {
    router.push(`/${companyName}/${country}/invoice`);
  };

  const togglePanel = () => {
    setPanelOpenState((prev) => !prev);
  };

  const onInvoicePaySuccess = () => {
    loadVoucherDetails();
  };

  const vouchers = paymentDetails?.vouchers ?? [];
  const singleVoucher = vouchers.length === 1 ? vouchers[0] : null;
  const currency = paymentDetails?.currency?.symbol ?? "";
  const totalAmount = paymentDetails?.totalAmount ?? 0;

  if (isLoading) {
    return (
      <>
        {!sessionId && <AuthHeader referenceId={referenceId} />}
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </>
    );
  }

  if (!paymentDetails?.vouchers?.length) {
    return (
      <>
        {!sessionId && <AuthHeader referenceId={referenceId} />}
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-gray-600">No voucher details available.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {!sessionId && <AuthHeader referenceId={referenceId} />}
      <div className="w-full">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-light text-gray-900">
              {vouchers.length === 1
                ? `Payment for ${singleVoucher?.number ?? ""}`
                : "Payment All Invoices"}
            </h2>
            <button
              type="button"
              onClick={backToInvoice}
              className="cursor-pointer text-3xl leading-none text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {vouchers.length === 1 && singleVoucher && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between rounded-xl bg-white px-5 py-4">
                {/* Left Section - Voucher Info */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Voucher No.
                  </span>
                  <span className="mt-1 text-sm font-semibold text-gray-800">
                    {singleVoucher.number}
                  </span>

                  {singleVoucher.dueDate && (
                    <span className="mt-2 text-xs text-gray-500">
                      Due on {singleVoucher.dueDate}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-4 hidden h-10 w-px bg-gray-200 sm:block" />

                {/* Right Section - Balance */}
                <div className="text-right">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Balance Due
                  </span>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {currency}{" "}
                    {Number(singleVoucher.amount).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>

              {!singleVoucher.canPay && singleVoucher.message && (
                <p className="mt-4 text-sm text-red-600">{singleVoucher.message}</p>
              )}
            </div>
          )}

          {vouchers.length > 1 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src="/images/note.svg" alt="" className="h-12 w-12 object-contain" />
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="mt-1 text-lg font-semibold">
                      {currency}{" "}
                      {Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={togglePanel} className="shrink-0">
                  For {vouchers.length} invoices
                </Button>
              </div>

              <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                {panelOpenState && (
                  <>
                    <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2 text-xs font-medium uppercase text-gray-500">
                      <span>Invoice #</span>
                      <span>Due on</span>
                      <span className="text-right">Balance Due</span>
                    </div>
                    {vouchers.map((v) => (
                      <div key={v.uniqueName} className="grid grid-cols-3 gap-4 py-2 text-sm">
                        <span>{v.number}</span>
                        <span>{v.dueDate ?? ""}</span>
                        <span className="text-right">
                          {currency}
                          {Number(v.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                    <p className="mt-4 text-sm text-gray-600">
                      If you want to pay only for an individual invoice, you can do so from the{" "}
                      <button
                        type="button"
                        onClick={backToInvoice}
                        className="text-blue-600 underline hover:no-underline"
                      >
                        list view of invoices.
                      </button>
                    </p>
                    {!canPayInvoice && paidInvoiceMessage && (
                      <p className="mt-4 text-sm text-red-600">{paidInvoiceMessage}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {canPayInvoice && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="space-y-4 pl-4">
                {mappedPaymentMethodsFlat.map((gateway) => (
                  <div
                    key={gateway.value}
                    className={gateway.value !== PAYMENT_METHODS_ENUM.PAYPAL ? "py-2" : ""}
                  >
                    <label className="flex cursor-pointer items-center gap-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === gateway.value}
                        onChange={() => setSelectedPaymentMethod(gateway.value)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <img
                        src={
                          gateway.value === PAYMENT_METHODS_ENUM.RAZORPAY
                            ? "/icons/razorpay.svg"
                            : gateway.value === PAYMENT_METHODS_ENUM.PAYPAL
                              ? "/icons/paypal.svg"
                              : "/icons/payu.svg"
                        }
                        alt={gateway.value}
                        title={gateway.value}
                        className="h-12 w-20 object-contain"
                      />
                    </label>
                    <div
                      className={
                        gateway.value !== PAYMENT_METHODS_ENUM.PAYPAL
                          ? "mt-2 border-b border-gray-200"
                          : ""
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 pl-4">
                <PayNow
                  invoicePayMode
                  paymentDetails={paymentDetails}
                  selectedPaymentMethod={selectedPaymentMethod}
                  canPay={canPayInvoice}
                  buttonText="Proceed to Payment"
                  onSuccess={onInvoicePaySuccess}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
