import axios from "axios";
import { getConfig } from "@/config";
import { getAttachmentDisplayName, hasAttachmentId } from "./attachmentUtils";

export interface DownloadVoucherRequest {
  linkId: string;
  voucherNumber: string;
  voucherName: string;
  voucherUniqueName?: string;
  entryUniqueName?: string;
  voucherVersion?: number;
}

export interface DownloadAttachmentRequest {
  linkId: string;
  attachedFileUniqueName: string;
  attachedFileName?: string;
  voucherName?: string;
  voucherUniqueName?: string;
  entryUniqueName?: string;
  voucherVersion?: number;
  onError?: (message: string) => void;
}

/**
 * Downloads a voucher/invoice PDF for a magic link transaction
 * @param request - Request parameters for downloading the voucher
 * @returns Promise that resolves when download is complete
 */
export async function downloadMagicLinkVoucher(request: DownloadVoucherRequest): Promise<void> {
  try {
    const config = getConfig();
    const baseURL = config.GIDDH_API_URL;
    const voucherVersion = request.voucherVersion || 2;
    const linkId = request.linkId;

    if (!linkId) {
      throw new Error("Magic link ID not found.");
    }

    let apiObservable;

    if (voucherVersion === 2) {
      // POST request for voucher version 2
      const url = `${baseURL}/magic-link/${encodeURIComponent(linkId)}/download-voucher?voucherVersion=${encodeURIComponent(String(voucherVersion))}&downloadOption=${encodeURIComponent("VOUCHER")}`;

      const payload: any = {
        voucherType: request.voucherName,
      };

      if (request.voucherUniqueName) {
        payload.uniqueName = request.voucherUniqueName;
      } else if (request.entryUniqueName) {
        payload.entryUniqueName = request.entryUniqueName;
      }

      apiObservable = axios.post(url, payload, {
        responseType: "blob",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          origin: typeof window !== "undefined" ? window.location.origin : "",
          referer: typeof window !== "undefined" ? window.location.origin + "/" : "",
        },
      });
    } else {
      // GET request for older voucher versions (encode path segments)
      const url = `${baseURL}/magic-link/${encodeURIComponent(linkId)}/download-invoice/${encodeURIComponent(request.voucherNumber)}`;
      apiObservable = axios.get(url, {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          origin: typeof window !== "undefined" ? window.location.origin : "",
          referer: typeof window !== "undefined" ? window.location.origin + "/" : "",
        },
      });
    }

    const response = await apiObservable;

    if (response?.data?.status === "error") {
      throw new Error(`Invoice for ${request.voucherNumber} cannot be downloaded now.`);
    }

    if (voucherVersion === 2) {
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${request.voucherNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Handle base64 response (older versions)
      const base64Data = response.data.body;
      const blob = base64ToBlob(base64Data, "application/pdf", 512);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${request.voucherNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  } catch (error: any) {
    console.error("Error downloading voucher:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      `Invoice for ${request.voucherNumber} cannot be downloaded now.`;
    throw new Error(errorMessage);
  }
}

/**
 * Downloads an attached file for a magic link transaction.
 * v2: POST with downloadOption=ATTACHMENT; v1: GET ledger/upload/{attachedFileUniqueName}
 * @param request - Request parameters for downloading the attachment
 * @returns Promise that resolves when download is complete
 */
export async function downloadMagicLinkAttachment(
  request: DownloadAttachmentRequest
): Promise<void> {
  try {
    const config = getConfig();
    const baseURL = config.GIDDH_API_URL;
    const voucherVersion = request.voucherVersion ?? 2;
    const linkId = request.linkId;
    const downloadFilename = getAttachmentDisplayName(request.attachedFileName);

    if (!linkId || !hasAttachmentId(request.attachedFileUniqueName)) {
      throw new Error("Magic link ID or attachment identifier not found.");
    }

    const headers = {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      origin: typeof window !== "undefined" ? window.location.origin : "",
      referer: typeof window !== "undefined" ? window.location.origin + "/" : "",
    };

    if (voucherVersion === 2) {
      const url = `${baseURL}/magic-link/${encodeURIComponent(linkId)}/download-voucher?voucherVersion=2&downloadOption=ATTACHMENT`;
      const payload: Record<string, string> = {};
      if (request.voucherName) payload.voucherType = request.voucherName;
      if (request.voucherUniqueName) payload.uniqueName = request.voucherUniqueName;
      else if (request.entryUniqueName) payload.entryUniqueName = request.entryUniqueName;

      const response = await axios.post(url, payload, {
        responseType: "blob",
        headers,
      });

      const blob = response.data as Blob;
      if (blob.type?.toLowerCase().includes("application/json")) {
        const text = await blob.text();
        const json = JSON.parse(text) as { status?: string };
        if (json?.status === "error") {
          throw new Error("Attachment cannot be downloaded now.");
        }
      }
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } else {
      const url = `${baseURL}/magic-link/${encodeURIComponent(linkId)}/ledger/upload/${encodeURIComponent(request.attachedFileUniqueName)}`;
      const response = await axios.get(url, {
        responseType: "blob",
        headers,
      });

      const blob = response.data as Blob;
      if (blob.type?.toLowerCase().includes("application/json")) {
        const text = await blob.text();
        const json = JSON.parse(text) as { status?: string };
        if (json?.status === "error") {
          throw new Error("Attachment cannot be downloaded now.");
        }
      }
      const nameFromHeader = response.headers["content-disposition"];
      let filename = downloadFilename;
      if (nameFromHeader) {
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(nameFromHeader);
        if (match?.[1]) {
          filename = match[1].replace(/['"]/g, "").trim() || downloadFilename;
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }
  } catch (error: any) {
    console.error("Error downloading attachment:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Attachment cannot be downloaded now.";
    request.onError?.(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Converts base64 string to Blob
 * @param b64Data - Base64 encoded data
 * @param contentType - MIME type (e.g., 'application/pdf')
 * @param sliceSize - Size of each slice for processing (default: 512)
 * @returns Blob object
 */
function base64ToBlob(b64Data: string, contentType: string, sliceSize: number = 512): Blob {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(b64Data);
  const byteArrays: BlobPart[] = [];
  let offset = 0;

  while (offset < byteCharacters.length) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
    offset += sliceSize;
  }

  return new Blob(byteArrays, { type: contentType });
}
