/**
 * Attachment display/download helpers for magic-link ledger.
 * Visibility is driven only by attachedFileUniqueName (truthy, non-whitespace).
 * attachedFileName only affects tooltip and download filename.
 */

/** Returns true only when value is truthy and (if string) non-empty after trim. */
export function hasAttachmentId(value: unknown): boolean {
  if (value == null || value === "") return false;
  const s = String(value).trim();
  return s.length > 0;
}

/** Safe display name for tooltip or error message. Never returns "undefined" or empty. */
export function getAttachmentDisplayName(fileName: unknown): string {
  if (fileName == null) return "attachment";
  const s = String(fileName).trim();
  if (!s || s === "undefined") return "attachment";
  return s;
}

/** Tooltip text for attachment button. Avoids "Download file: undefined". */
export function getAttachmentTooltipTitle(fileName: unknown): string {
  const name = getAttachmentDisplayName(fileName);
  return name === "attachment" ? "Download file" : `Download file: ${name}`;
}
