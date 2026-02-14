"use client";

/**
 * Catch-all for invoice-pay so
 * /:company/:country/invoice-pay/account/:accountUniqueName/voucher/:voucherUniqueName
 * matches as slug = ["account", accountUniqueName, "voucher", voucherUniqueName].
 * Re-exporting the main page; it reads params.slug when present to get account and voucher.
 */
export { default } from "../account/[accountUniqueName]/voucher/[voucherUniqueName]/page";
