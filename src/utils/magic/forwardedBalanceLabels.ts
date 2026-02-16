/**
 * Shared labels for forwarded / opening balance (Balance B/F) from API.
 * Used in Statement view, T-Account view, and getMagicLinkData.
 */

/** Side of the ledger (T-Account debit/credit column). */
export enum BalanceSide {
  DEBIT = "debit",
  CREDIT = "credit",
}

const BF_LABELS: Record<string, { debit: string; credit: string }> = {
  BF_BALANCE: { debit: "To Balance B/F", credit: "By Balance B/F" },
};

/**
 * Returns the particular label for a forwarded balance row.
 * @param description - API description (e.g. "BF_BALANCE")
 * @param side - For T-Account: BalanceSide.DEBIT | BalanceSide.CREDIT. For Statement view omit or use BalanceSide.DEBIT.
 */
export function getForwardedBalanceParticular(
  description: string | undefined,
  side: BalanceSide = BalanceSide.DEBIT
): string {
  if (!description) return side === BalanceSide.DEBIT ? "To Balance B/F" : "By Balance B/F";
  const mapped = BF_LABELS[description];
  return mapped ? mapped[side] : description;
}
