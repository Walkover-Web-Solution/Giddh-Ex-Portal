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
        <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center gap-x-6 md:order-2" />
          <p className="mt-4 text-center text-xs text-gray-500 md:order-1 md:mt-0">
            &copy; {year} Giddh. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-1 md:justify-start">
          <span className="text-xl font-bold tracking-wide text-blue-900">GIDDH</span>
        </div>

        <div className="text-md mt-4 text-center text-gray-600 md:order-2 md:mt-0">
          <p className="font-semibold text-gray-800">{companyName}</p>

          {companyAddress && <p className="mt-0.5 text-sm text-gray-500">{companyAddress}</p>}

          {gstin && <p className="mt-0.5 text-xs text-gray-500">GSTIN: {gstin}</p>}
        </div>
        <div className="mt-4 text-center md:order-3 md:mt-0 md:text-right">
          <p className="text-xs font-medium text-gray-700">Contact Us</p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-1 inline-flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 md:justify-end"
          >
            <EnvelopeIcon className="h-4 w-4" />
            <span className="break-all sm:break-normal">{supportEmail}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
