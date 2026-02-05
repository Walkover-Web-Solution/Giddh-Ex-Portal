import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";

export enum PAYMENT_METHODS_ENUM {
  RAZORPAY = "RAZORPAY",
  PAYPAL = "PAYPAL",
  PAYU = "PAYU",
}

export interface PaymentMethodsResponse {
  RAZORPAY?: {
    key: string;
    enabled: boolean;
  };
  PAYPAL?: {
    businessEmail: string;
    enabled: boolean;
  };
  PAYU?: {
    merchantKey: string;
    enabled: boolean;
  };
}

export interface PaymentRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  sessionId?: string;
}

export interface VoucherPaymentRequest extends PaymentRequest {
  paymentGatewayType: PAYMENT_METHODS_ENUM;
  voucherUniqueNames: string[];
  name?: string;
  email?: string;
  contactNo?: string;
}

export interface PaymentDetailsResponse {
  paymentId: string;
  orderId: string;
  paymentKey: string;
  paymentGatewayType: PAYMENT_METHODS_ENUM;
  totalAmount: number;
  currency: {
    code: string;
    symbol: string;
  };
  vouchers: Array<{
    uniqueName: string;
    number: string;
    amount: number;
    status: string;
    canPay: boolean;
    contentType: string;
  }>;
  company: {
    uniqueName: string;
    name: string;
  };
  htmlString?: string;
}

export interface PaymentUpdateRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  paymentId: string;
}

export interface PaymentUpdatePayload {
  paymentGatewayType: PAYMENT_METHODS_ENUM;
  razorPayPaymentId?: string;
  totalAmount?: number;
  date?: string;
}

export async function getPaymentMethods(
  request: PaymentRequest
): Promise<{ status: string; body: PaymentMethodsResponse }> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.get(
    API_PATHS.paymentMethods(request.companyUniqueName, request.accountUniqueName),
    { headers }
  );
  return response.data;
}

export async function getVoucherPaymentDetails(
  request: VoucherPaymentRequest
): Promise<{ status: string; body: PaymentDetailsResponse }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const payload: any = {
    paymentGatewayType: request.paymentGatewayType,
    voucherUniqueNames: request.voucherUniqueNames,
  };

  if (request.paymentGatewayType === PAYMENT_METHODS_ENUM.PAYU) {
    payload.name = request.name;
    payload.email = request.email;
    payload.contactNo = request.contactNo;
  }

  const response = await apiClient.post(
    API_PATHS.invoicePayRequest(request.companyUniqueName, request.accountUniqueName),
    payload,
    { headers }
  );
  return response.data;
}

export async function updatePaymentStatus(
  request: PaymentUpdateRequest,
  payload: PaymentUpdatePayload
): Promise<{ status: string; body: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await apiClient.post(
    API_PATHS.invoicePay(request.companyUniqueName, request.accountUniqueName, request.paymentId),
    payload,
    { headers }
  );
  return response.data;
}
