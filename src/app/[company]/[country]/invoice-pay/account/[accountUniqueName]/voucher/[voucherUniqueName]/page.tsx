import { redirect } from "next/navigation";

/**
 * Handles the legacy payment link format from the backend. Redirects to payment/preview
 * with the same query params so both URLs behave identically.
 * Server-side redirect avoids showing any intermediate UI (no spinner/layout flash).
 *
 * Query param mapping (invoice-pay → payment/preview):
 *   Path accountUniqueName  → ?accountUniqueName=
 *   Path voucherUniqueName  → ?voucher=
 *   Query companyUniqueName → ?companyUniqueName=
 */
export default async function InvoicePayRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{
    company: string;
    country: string;
    accountUniqueName: string;
    voucherUniqueName: string;
  }>;
  searchParams: Promise<{ companyUniqueName?: string }>;
}) {
  const { company, country, accountUniqueName, voucherUniqueName } = await params;
  const search = await searchParams;
  const companyUniqueName = search.companyUniqueName ?? "";

  const query = new URLSearchParams();
  query.set("voucher", voucherUniqueName);
  query.set("accountUniqueName", accountUniqueName);
  if (companyUniqueName) {
    query.set("companyUniqueName", companyUniqueName);
  }

  redirect(
    `/${encodeURIComponent(company)}/${encodeURIComponent(country)}/payment/preview?${query.toString()}`
  );
}
