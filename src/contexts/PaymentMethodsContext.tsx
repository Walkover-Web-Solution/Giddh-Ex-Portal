"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getPaymentMethods, PaymentMethodsResponse, PAYMENT_METHODS_ENUM } from "@/utils/payment";

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethodsResponse | null;
  selectedMethod: PAYMENT_METHODS_ENUM | null;
  isLoading: boolean;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

export function PaymentMethodsProvider({
  children,
  companyUniqueName,
  accountUniqueName,
  sessionId,
}: {
  children: React.ReactNode;
  companyUniqueName?: string;
  accountUniqueName?: string;
  sessionId?: string;
}) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PAYMENT_METHODS_ENUM | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!companyUniqueName || !accountUniqueName || hasLoaded.current) return;

    hasLoaded.current = true;
    setIsLoading(true);

    getPaymentMethods({
      companyUniqueName,
      accountUniqueName,
      sessionId,
    })
      .then((response) => {
        if (response.status === "success" && response.body) {
          setPaymentMethods(response.body);

          if (response.body.RAZORPAY) {
            setSelectedMethod(PAYMENT_METHODS_ENUM.RAZORPAY);
          } else if (response.body.PAYPAL) {
            setSelectedMethod(PAYMENT_METHODS_ENUM.PAYPAL);
          } else if (response.body.PAYU) {
            setSelectedMethod(PAYMENT_METHODS_ENUM.PAYU);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading payment methods:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [companyUniqueName, accountUniqueName, sessionId]);

  return (
    <PaymentMethodsContext.Provider value={{ paymentMethods, selectedMethod, isLoading }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const context = useContext(PaymentMethodsContext);
  if (context === undefined) {
    throw new Error("usePaymentMethods must be used within a PaymentMethodsProvider");
  }
  return context;
}
