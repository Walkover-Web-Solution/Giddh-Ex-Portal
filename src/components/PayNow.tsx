"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCompanyUniqueName, selectAccountUniqueName } from "@/store/slices/companySlice";
import {
  getPaymentMethods,
  getVoucherPaymentDetails,
  updatePaymentStatus,
  PAYMENT_METHODS_ENUM,
  PaymentDetailsResponse,
  PaymentMethodsResponse,
} from "@/utils/payment";

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

  const loadPaymentMethods = async (companyUniqueName: string, accountUniqueName: string) => {
    try {
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });

      if (response.status === "success" && response.body) {
        setPaymentMethods(response.body);

        // Set default payment method
        if (response.body.RAZORPAY) {
          setSelectedMethod(PAYMENT_METHODS_ENUM.RAZORPAY);
          return PAYMENT_METHODS_ENUM.RAZORPAY;
        } else if (response.body.PAYPAL) {
          setSelectedMethod(PAYMENT_METHODS_ENUM.PAYPAL);
          return PAYMENT_METHODS_ENUM.PAYPAL;
        } else if (response.body.PAYU) {
          setSelectedMethod(PAYMENT_METHODS_ENUM.PAYU);
          return PAYMENT_METHODS_ENUM.PAYU;
        }
      }
      return null;
    } catch (error) {
      console.error("Error loading payment methods:", error);
      alert("Failed to load payment methods");
      return null;
    }
  };

  const handlePayNow = async () => {
    if (!canPay || isProcessing) return;

    setIsProcessing(true);

    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) {
      alert("Missing company or account information");
      setIsProcessing(false);
      return;
    }

    // Load payment methods if not already loaded
    let method = selectedMethod;
    if (!paymentMethods) {
      method = await loadPaymentMethods(companyUniqueName, accountUniqueName);
      if (!method) {
        setIsProcessing(false);
        return;
      }
    }

    if (!method) {
      alert("No payment method available");
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
          console.error("Error parsing userData:", e);
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

      if (response.status === "success" && response.body) {
        initializePaymentGateway(response.body);
      } else {
        alert("Failed to initialize payment");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
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
      alert("Razorpay SDK not loaded");
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
    const date = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

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

      if (response.status === "success") {
        alert("Payment successful!");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Payment completed but status update failed");
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

      if (response.status === "success") {
        alert("Payment successful!");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handlePayuFormSubmit = () => {
    if (!payuDetails.name || !payuDetails.email || !payuDetails.contactNo) {
      alert("Please fill all fields");
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

  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <>
      {variant === "link" ? (
        <button
          onClick={handlePayNow}
          disabled={isProcessing}
          className={`font-medium text-green-600 hover:text-green-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      ) : (
        <button
          onClick={handlePayNow}
          disabled={isProcessing}
          className={`rounded-md bg-green-600 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${className}`}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
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
                <button
                  onClick={handlePayuFormSubmit}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Proceed to Payment
                </button>
                <button
                  onClick={() => setShowPayuForm(false)}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
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
