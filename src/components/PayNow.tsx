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
} from "@/utils/payment";
import { formatDateToAPI } from "@/utils/dateUtils";
import { getCompanyAndAccountNames as getStorageNames } from "@/utils/getUserDataFromStorage";
import { logger } from "@/utils/logger";
import { useToast } from "@/contexts/ToastContext";
import { ApiResponseStatus } from "@/utils/proxy/types";
import { Button } from "@/components/ui/button";

interface PayNowProps {
  invoiceUniqueName: string;
  invoiceNumber: string;
  amount?: number;
  currency?: string;
  canPay?: boolean;
  className?: string;
  variant?: "button" | "link";
  size?: "sm" | "md" | "lg";
  onSuccess?: () => void;
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
  size = "md",
  onSuccess,
}: PayNowProps) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PAYMENT_METHODS_ENUM | null>(null);
  const [showPayuForm, setShowPayuForm] = useState(false);
  const [showNoMethodsError, setShowNoMethodsError] = useState(false);
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

  useEffect(() => {
    if (showNoMethodsError) {
      const timer = setTimeout(() => {
        setShowNoMethodsError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNoMethodsError]);

  const loadRazorpayScript = () => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const loadPaymentMethods = async (companyUniqueName: string, accountUniqueName: string) => {
    try {
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });

      if (response && response.status === ApiResponseStatus.SUCCESS && response.body) {
        setPaymentMethods(response.body);

        const hasAnyMethod = Boolean(
          response.body.RAZORPAY || response.body.PAYPAL || response.body.PAYU
        );
        if (!hasAnyMethod) {
          setShowNoMethodsError(true);
          return null;
        }

        switch (true) {
          case Boolean(response.body.RAZORPAY):
            setSelectedMethod(PAYMENT_METHODS_ENUM.RAZORPAY);
            return PAYMENT_METHODS_ENUM.RAZORPAY;
          case Boolean(response.body.PAYPAL):
            setSelectedMethod(PAYMENT_METHODS_ENUM.PAYPAL);
            return PAYMENT_METHODS_ENUM.PAYPAL;
          case Boolean(response.body.PAYU):
            setSelectedMethod(PAYMENT_METHODS_ENUM.PAYU);
            return PAYMENT_METHODS_ENUM.PAYU;
          default:
            return null;
        }
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

    let method = selectedMethod;
    if (!paymentMethods) {
      method = await loadPaymentMethods(companyUniqueName, accountUniqueName);
      if (!method) {
        setIsProcessing(false);
        return;
      }
    }

    if (!method) {
      setShowNoMethodsError(true);
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

    await processPayment(companyUniqueName, accountUniqueName, method);
  };

  const processPayment = async (
    companyUniqueName: string,
    accountUniqueName: string,
    method: PAYMENT_METHODS_ENUM
  ) => {
    if (!method) {
      setIsProcessing(false);
      return;
    }
    try {
      const request: any = {
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
        paymentGatewayType: method,
        voucherUniqueNames: [invoiceUniqueName],
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
    setTimeout(() => {
      paypalFormRef.current?.submit();
    }, 100);
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
    if (companyUniqueName && accountUniqueName && selectedMethod) {
      processPayment(companyUniqueName, accountUniqueName, selectedMethod);
    }
  };

  if (!canPay) {
    return null;
  }

  return (
    <>
      {variant === "link" ? (
        <Button
          variant="link"
          size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
          onClick={handlePayNow}
          disabled={isProcessing}
          className={className}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      ) : (
        <Button
          size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
          onClick={handlePayNow}
          disabled={isProcessing}
          className={className}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      )}

      {showNoMethodsError && (
        <div className="fixed right-4 top-4 z-50 w-96 animate-slide-in-right">
          <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  No Payment Methods Available
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  No payment methods are currently configured for your account. Please contact
                  support to enable payment options.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowNoMethodsError(false)}
                className="ml-4 shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

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
