/**
 * Triggers a browser download of a base64-encoded PDF.
 * @param base64String - Base64-encoded PDF data
 * @param fileName - Name for the downloaded file
 */
export function downloadBase64AsPDF(base64String: string, fileName: string): void {
  const linkSource = `data:application/pdf;base64,${base64String}`;
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
}
