import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface FooterProps {
  companyName: string;
  gstin: string;
  companyAddress?: string;
  supportEmail: string;
  variant?: "full" | "minimal";
}

export function Footer({
  companyName,
  gstin,
  companyAddress,
  supportEmail,
  variant = "minimal",
}: FooterProps) {
  const year = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center gap-x-6 md:order-2" />
          <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0">
            &copy; {year} Giddh. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-2">
          <span className="text-lg font-bold tracking-wide text-blue-900">GIDDH</span>
        </div>
        <div className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0">
          <p>&copy; {year} {companyName}</p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-1 flex items-center justify-center gap-1.5 text-xs hover:text-blue-600"
          >
            <EnvelopeIcon className="h-3.5 w-3.5" />
            <span className="break-all sm:break-normal">{supportEmail}</span>
          </a>
          {companyAddress && (
            <p className="mt-1 max-w-xs break-words text-xs text-gray-500">{companyAddress}</p>
          )}
          {gstin && <p className="mt-1 text-xs text-gray-500">GSTIN: {gstin}</p>}
        </div>
      </div>
    </footer>
  );
}
