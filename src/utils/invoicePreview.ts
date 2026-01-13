import { apiClient } from "@/lib/apiClient";

export interface VoucherDetails {
  content: string;
  number: string;
  dueDate: string;
  amount: number;
  canPay: boolean;
  message: string;
}

export interface PaymentDetailsResponse {
  vouchers: VoucherDetails[];
  currency: {
    code: string;
    symbol: string;
  };
}

export interface Comment {
  id: number;
  description: string;
  userName: string;
  dateString: string;
}

export interface InvoicePreviewRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  voucherUniqueName: string;
  sessionId?: string;
}

export async function getPaymentMethods(
  companyUniqueName: string,
  accountUniqueName: string,
  sessionId?: string
) {
  const headers: Record<string, string> = {};
  if (sessionId) {
    headers["Session-id"] = sessionId;
  }

  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${accountUniqueName}/payment-methods`,
    { headers }
  );
  return response.data;
}

export async function getVoucherDetails(
  request: InvoicePreviewRequest
): Promise<{ status: string; body: PaymentDetailsResponse }> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.post(
    `/portal/company/${request.companyUniqueName}/accounts/${request.accountUniqueName}/invoice-pay-request?voucherVersion=2`,
    [request.voucherUniqueName],
    { headers }
  );
  return response.data;
}

export async function getInvoiceComments(
  request: InvoicePreviewRequest
): Promise<{ status: string; body: Comment[] }> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.get(
    `/portal/company/${request.companyUniqueName}/accounts/${request.accountUniqueName}/${request.voucherUniqueName}/comments?voucherVersion=2`,
    { headers }
  );
  return response.data;
}

export async function addComment(
  request: InvoicePreviewRequest,
  commentText: string
): Promise<{ status: string; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.post(
    `/portal/company/${request.companyUniqueName}/accounts/${request.accountUniqueName}/${request.voucherUniqueName}/add-comment?voucherVersion=2`,
    { description: commentText },
    { headers }
  );
  return response.data;
}

export async function downloadVoucher(
  request: InvoicePreviewRequest
): Promise<{ status: string; body: string }> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.post(
    `/portal/company/${request.companyUniqueName}/accounts/${request.accountUniqueName}/download-file?voucherVersion=2&fileType=base64`,
    [request.voucherUniqueName],
    { headers }
  );
  return response.data;
}

export function base64ToBlob(base64: string, contentType: string = "application/pdf"): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
