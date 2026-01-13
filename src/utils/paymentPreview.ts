import { apiClient } from "@/lib/apiClient";

export interface PaymentPreviewRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  voucherUniqueName: string;
  sessionId?: string;
}

export interface PaymentVoucher {
  uniqueName: string;
  voucherNumber: string;
  voucherDate: string;
  grandTotal: {
    amountForAccount: number;
  };
  accountCurrencySymbol: string;
  paymentMode: {
    name: string;
  };
}

export interface PaymentListResponse {
  status: string;
  body: {
    items: PaymentVoucher[];
    totalItems: number;
  };
}

export async function downloadPaymentVoucher(
  request: PaymentPreviewRequest
): Promise<{ status: string; body: string }> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.post(
    `/portal/company/${encodeURIComponent(request.companyUniqueName)}/accounts/${encodeURIComponent(request.accountUniqueName)}/download-file?voucherVersion=2&fileType=base64`,
    [request.voucherUniqueName],
    { headers }
  );
  return response.data;
}

export async function getPaymentList(request: PaymentPreviewRequest): Promise<PaymentListResponse> {
  const headers: Record<string, string> = {};
  if (request.sessionId) {
    headers["Session-id"] = request.sessionId;
  }

  const response = await apiClient.get(
    `/portal/company/${encodeURIComponent(request.companyUniqueName)}/accounts/${encodeURIComponent(request.accountUniqueName)}/vouchers?type=receipt&page=1&count=10&uniqueNames=${request.voucherUniqueName}&voucherVersion=2`,
    { headers }
  );
  return response.data;
}

export function base64ToBlob(
  base64Data: string,
  contentType: string = "application/pdf",
  sliceSize: number = 512
): Blob {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
