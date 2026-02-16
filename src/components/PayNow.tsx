"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCompanyUniqueName,
  selectAccountUniqueName,
  invalidatePaymentsData,
  invalidateInvoicesData,
  fetchAllPayments,
  fetchAllInvoices,
} from "@/store/slices/companySlice";
import {
  getPaymentMethods,
  getVoucherPaymentDetails,
  updatePaymentStatus,
  PAYMENT_METHODS_ENUM,
  PaymentDetailsResponse,
  PaymentMethodsResponse,
  InvoicePayVoucherDetailsResponse,
} from "@/utils/payment";
import { formatDateToAPI } from "@/utils/dateUtils";
import { getCompanyAndAccountNames as getStorageNames } from "@/utils/getUserDataFromStorage";
import { logger } from "@/utils/logger";
import { useToast } from "@/contexts/ToastContext";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { Button } from "@/components/ui/button";

interface PayNowProps {
  /** Single-invoice mode: voucher unique name (required when not invoicePayMode). */
  invoiceUniqueName?: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  canPay?: boolean;
  className?: string;
  variant?: "button" | "link";
  /** Button visual style when variant is "button" */
  buttonVariant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onSuccess?: () => void;
  /** Invoice-pay page mode: parent provides payment details and selected method. */
  invoicePayMode?: boolean;
  /** When invoicePayMode: voucher details (single or multiple) from getInvoicePayVoucherDetails. */
  paymentDetails?: InvoicePayVoucherDetailsResponse | PaymentDetailsResponse;
  /** When invoicePayMode: currently selected gateway (RAZORPAY / PAYPAL / PAYU). */
  selectedPaymentMethod?: PAYMENT_METHODS_ENUM | null;
  /** When invoicePayMode: custom button label. */
  buttonText?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PayNow({
  invoiceUniqueName,
  invoiceNumber,
  amount,
  currency = "₹",
  canPay = true,
  className = "",
  variant = "button",
  buttonVariant = "default",
  size = "md",
  onSuccess,
  invoicePayMode = false,
  paymentDetails: paymentDetailsFromParent,
  selectedPaymentMethod: selectedPaymentMethodFromParent,
  buttonText: buttonTextProp,
}: PayNowProps) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PAYMENT_METHODS_ENUM | null>(null);
  const [showPayuForm, setShowPayuForm] = useState(false);
  const [payuDetails, setPayuDetails] = useState({ name: "", email: "", contactNo: "" });
  const paypalFormRef = useRef<HTMLFormElement>(null);
  const razorpayInstance = useRef<any>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getCompanyAndAccountNames = () => {
    return getStorageNames(companyUniqueNameFromRedux, accountUniqueNameFromRedux);
  };

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  /** API can return booleans (RAZORPAY: true) or objects ({ key, enabled }). Treat as enabled when true or when object.enabled !== false. Priority: Razorpay > PayPal > PayU. */
  const isMethodEnabled = (val: unknown): boolean => {
    if (val === true) return true;
    if (val === false) return false;
    if (val && typeof val === "object" && (val as { enabled?: boolean }).enabled !== false)
      return true;
    return false;
  };

  const normalizePaymentMethods = (
    body: Record<string, unknown> | null
  ): { methods: PaymentMethodsResponse; firstEnabled: PAYMENT_METHODS_ENUM | null } => {
    const normalized: PaymentMethodsResponse = {};
    const keys: Array<{ variants: string[]; our: keyof PaymentMethodsResponse }> = [
      { variants: ["RAZORPAY", "Razorpay", "razorpay"], our: "RAZORPAY" },
      { variants: ["PAYPAL", "Paypal", "paypal"], our: "PAYPAL" },
      { variants: ["PAYU", "Payu", "payu"], our: "PAYU" },
    ];
    for (const { variants, our } of keys) {
      for (const k of variants) {
        const val = body?.[k];
        if (isMethodEnabled(val)) {
          (normalized as Record<string, unknown>)[our] =
            typeof val === "object" && val !== null ? val : { enabled: true };
          break;
        }
      }
    }
    const firstEnabled = normalized.RAZORPAY
      ? PAYMENT_METHODS_ENUM.RAZORPAY
      : normalized.PAYPAL
        ? PAYMENT_METHODS_ENUM.PAYPAL
        : normalized.PAYU
          ? PAYMENT_METHODS_ENUM.PAYU
          : null;
    return { methods: normalized, firstEnabled };
  };

  const loadPaymentMethods = async (companyUniqueName: string, accountUniqueName: string) => {
    try {
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });

      if (response && response.status === ApiResponseStatus.SUCCESS && response.body) {
        const rawBody = (response.body as Record<string, unknown>) ?? {};
        const { methods, firstEnabled } = normalizePaymentMethods(rawBody);

        if (Object.keys(methods).length === 0) {
          showToast(
            "No payment methods are currently configured for your account. Please contact support to enable payment options.",
            "error"
          );
          return null;
        }

        setPaymentMethods(methods);
        if (firstEnabled) {
          setSelectedMethod(firstEnabled);
          return firstEnabled;
        }
        return null;
      }
      return null;
    } catch (error) {
      logger.error("Error loading payment methods", error);
      showToast("Failed to load payment methods. Please try again.", "error");
      return null;
    }
  };

  const handlePayNow = async () => {
    if (!canPay || isProcessing) return;

    setIsProcessing(true);

    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) {
      showToast("Missing company or account information", "error");
      setIsProcessing(false);
      return;
    }

    let method: PAYMENT_METHODS_ENUM | null = selectedMethod;
    let voucherUniqueNames: string[] = invoiceUniqueName ? [invoiceUniqueName] : [];

    if (
      invoicePayMode &&
      paymentDetailsFromParent?.vouchers?.length &&
      selectedPaymentMethodFromParent
    ) {
      method = selectedPaymentMethodFromParent;
      voucherUniqueNames = paymentDetailsFromParent.vouchers.map((v) => v.uniqueName);
    } else if (!invoicePayMode) {
      if (!paymentMethods) {
        method = await loadPaymentMethods(companyUniqueName, accountUniqueName);
        if (!method) {
          setIsProcessing(false);
          return;
        }
      }
    }

    if (!method || !voucherUniqueNames.length) {
      if (!invoicePayMode) {
        showToast(
          "No payment methods are currently configured for your account. Please contact support to enable payment options.",
          "error"
        );
      }
      setIsProcessing(false);
      return;
    }

    if (method === PAYMENT_METHODS_ENUM.PAYU) {
      const userData = localStorage.getItem("userData");
      let hasDetails = false;

      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (
            parsed.portalDetails?.name &&
            parsed.portalDetails?.email &&
            parsed.portalDetails?.contactNo
          ) {
            setPayuDetails({
              name: parsed.portalDetails.name,
              email: parsed.portalDetails.email,
              contactNo: parsed.portalDetails.contactNo,
            });
            hasDetails = true;
          }
        } catch (e) {
          logger.error("Error parsing userData for PayU", e);
        }
      }

      if (!hasDetails) {
        setShowPayuForm(true);
        setIsProcessing(false);
        return;
      }
    }

    await processPayment(companyUniqueName, accountUniqueName, method, voucherUniqueNames);
  };

  const processPayment = async (
    companyUniqueName: string,
    accountUniqueName: string,
    method: PAYMENT_METHODS_ENUM,
    voucherIds: string[] = invoiceUniqueName ? [invoiceUniqueName] : []
  ) => {
    if (!method) {
      setIsProcessing(false);
      return;
    }
    const voucherUniqueNames = voucherIds.length
      ? voucherIds
      : invoiceUniqueName
        ? [invoiceUniqueName]
        : [];
    if (!voucherUniqueNames.length) {
      setIsProcessing(false);
      return;
    }
    try {
      const request: any = {
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
        paymentGatewayType: method,
        voucherUniqueNames,
      };

      if (method === PAYMENT_METHODS_ENUM.PAYU) {
        request.name = payuDetails.name;
        request.email = payuDetails.email;
        request.contactNo = payuDetails.contactNo;
      }

      const response = await getVoucherPaymentDetails(request);

      if (response.status === ApiResponseStatus.SUCCESS && response.body) {
        initializePaymentGateway(response.body);
      } else {
        showToast("Failed to initialize payment", "error");
        setIsProcessing(false);
      }
    } catch (error) {
      logger.error("Error processing payment", error);
      showToast("Failed to process payment. Please try again.", "error");
      setIsProcessing(false);
    }
  };

  const initializePaymentGateway = (paymentDetails: PaymentDetailsResponse) => {
    switch (paymentDetails.paymentGatewayType) {
      case PAYMENT_METHODS_ENUM.RAZORPAY:
        initializeRazorpay(paymentDetails);
        break;
      case PAYMENT_METHODS_ENUM.PAYPAL:
        initializePayPal(paymentDetails);
        break;
      case PAYMENT_METHODS_ENUM.PAYU:
        initializePayU(paymentDetails);
        break;
    }
  };

  const initializeRazorpay = (paymentDetails: PaymentDetailsResponse) => {
    if (!window.Razorpay) {
      showToast("Razorpay SDK not loaded", "error");
      setIsProcessing(false);
      return;
    }

    if (!paymentDetails.paymentKey?.trim()) {
      showToast("Payment key not received. Please contact support.", "error");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: paymentDetails.paymentKey,
      order_id: paymentDetails.orderId,
      amount: paymentDetails.totalAmount,
      currency: paymentDetails.currency.code,
      name: paymentDetails.company.name,
      handler: async (response: any) => {
        await handleRazorpaySuccess(response, paymentDetails);
      },
      theme: {
        color: "#F37254",
      },
    };

    razorpayInstance.current = new window.Razorpay(options);
    razorpayInstance.current.open();
    setIsProcessing(false);
  };

  const handleRazorpaySuccess = async (
    razorpayResponse: any,
    paymentDetails: PaymentDetailsResponse
  ) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) return;

    const today = new Date();
    const date = formatDateToAPI(today);

    try {
      const response = await updatePaymentStatus(
        {
          companyUniqueName,
          accountUniqueName,
          paymentId: paymentDetails.paymentId,
        },
        {
          paymentGatewayType: PAYMENT_METHODS_ENUM.RAZORPAY,
          razorPayPaymentId: razorpayResponse.razorpay_payment_id,
          totalAmount: paymentDetails.totalAmount,
          date,
        }
      );

      if (response.status === ApiResponseStatus.SUCCESS) {
        showToast("Payment successful!", "success");
        dispatch(invalidatePaymentsData(companyName));
        dispatch(invalidateInvoicesData(companyName));
        dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName })).unwrap();
        dispatch(fetchAllInvoices({ companyName, companyUniqueName, accountUniqueName })).unwrap();
        onSuccess?.();
      }
    } catch (error) {
      logger.error("Error updating payment status", error);
      console.log("paymentKey is missing in the api response", error);
    }
  };

  const initializePayPal = (paymentDetails: PaymentDetailsResponse) => {
    if (!paymentDetails.paymentKey?.trim()) {
      showToast("PayPal payment key not received. Please contact support.", "error");
      setIsProcessing(false);
      return;
    }

    const returnUrl =
      typeof window !== "undefined"
        ? window.location.href.indexOf("payment_id") === -1
          ? window.location.href +
            (window.location.href.indexOf("?") > -1 ? "&" : "?") +
            "payment_id=" +
            paymentDetails.paymentId
          : window.location.href
        : "";

    const form = typeof document !== "undefined" ? document.createElement("form") : null;
    if (!form) {
      setIsProcessing(false);
      return;
    }

    form.setAttribute("action", "https://www.paypal.com/cgi-bin/webscr");
    form.setAttribute("method", "post");
    form.style.display = "none";

    const fields: Array<{ name: string; value: string }> = [
      { name: "cmd", value: "_xclick" },
      { name: "business", value: paymentDetails.paymentKey },
      { name: "item_name", value: paymentDetails.vouchers?.[0]?.number ?? "" },
      { name: "amount", value: String(paymentDetails.totalAmount) },
      { name: "currency_code", value: paymentDetails.currency?.code ?? "USD" },
      { name: "return", value: returnUrl },
      { name: "cancel_return", value: typeof window !== "undefined" ? window.location.href : "" },
    ];

    fields.forEach(({ name, value }) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setIsProcessing(false);
  };

  const initializePayU = (paymentDetails: PaymentDetailsResponse) => {
    if (paymentDetails.htmlString) {
      const blob = new Blob([paymentDetails.htmlString], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const payuWindow = window.open(url, "PayU Payment", "width=800,height=600");

      const handlePayUMessage = (event: MessageEvent) => {
        if (event.data?.status) {
          handlePayUSuccess(paymentDetails);
          payuWindow?.close();
          window.removeEventListener("message", handlePayUMessage);
        }
      };

      window.addEventListener("message", handlePayUMessage);
      setIsProcessing(false);
    }
  };

  const handlePayUSuccess = async (paymentDetails: PaymentDetailsResponse) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) return;

    try {
      const response = await updatePaymentStatus(
        {
          companyUniqueName,
          accountUniqueName,
          paymentId: paymentDetails.paymentId,
        },
        {
          paymentGatewayType: PAYMENT_METHODS_ENUM.PAYU,
        }
      );

      if (response.status === ApiResponseStatus.SUCCESS) {
        showToast("Payment successful!", "success");
        dispatch(invalidatePaymentsData(companyName));
        dispatch(invalidateInvoicesData(companyName));
        dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName })).unwrap();
        dispatch(fetchAllInvoices({ companyName, companyUniqueName, accountUniqueName })).unwrap();
        onSuccess?.();
      }
    } catch (error) {
      logger.error("Error updating PayU payment status", error);
    }
  };

  const handlePayuFormSubmit = () => {
    if (!payuDetails.name || !payuDetails.email || !payuDetails.contactNo) {
      showToast("Please fill all fields", "error");
      return;
    }
    setShowPayuForm(false);
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    const method = invoicePayMode ? selectedPaymentMethodFromParent : selectedMethod;
    const vIds =
      invoicePayMode && paymentDetailsFromParent?.vouchers?.length
        ? paymentDetailsFromParent.vouchers.map((v) => v.uniqueName)
        : invoiceUniqueName
          ? [invoiceUniqueName]
          : [];
    if (companyUniqueName && accountUniqueName && method && vIds.length) {
      processPayment(companyUniqueName, accountUniqueName, method, vIds);
    }
  };

  if (!canPay && !invoicePayMode) {
    return null;
  }

  const sizeProp = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";
  const buttonVariantProp = variant === "link" ? "link" : buttonVariant;
  const displayLabel = buttonTextProp ?? (invoicePayMode ? "Proceed to Payment" : "Pay Now");

  return (
    <>
      <Button
        variant={buttonVariantProp}
        size={sizeProp}
        onClick={handlePayNow}
        disabled={isProcessing}
        className={className}
      >
        {isProcessing ? "Processing..." : displayLabel}
      </Button>

      {showPayuForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Enter Payment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={payuDetails.name}
                  onChange={(e) => setPayuDetails({ ...payuDetails, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={payuDetails.email}
                  onChange={(e) => setPayuDetails({ ...payuDetails, email: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={payuDetails.contactNo}
                  onChange={(e) => setPayuDetails({ ...payuDetails, contactNo: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button size="lg" onClick={handlePayuFormSubmit} className="flex-1">
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowPayuForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === PAYMENT_METHODS_ENUM.PAYPAL && (
        <form
          ref={paypalFormRef}
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          style={{ display: "none" }}
        >
          <input type="hidden" name="cmd" value="_xclick" />
          <input type="hidden" name="business" value={paymentMethods?.PAYPAL?.businessEmail} />
          <input type="hidden" name="item_name" value={invoiceNumber} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="currency_code" value="USD" />
          <input type="hidden" name="return" value={window.location.href} />
          <input type="hidden" name="cancel_return" value={window.location.href} />
        </form>
      )}
    </>
  );
}
