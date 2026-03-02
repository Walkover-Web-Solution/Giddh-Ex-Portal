import { config } from "@/config";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface FooterProps {
  companyName: string;
  taxNumber: string;
  taxType: string;
  companyAddress?: string;
  supportEmail: string;
  variant?: "full" | "minimal";
}

export function Footer({
  companyName,
  taxNumber,
  taxType,
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
            &copy; {year} {config.BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center gap-x-6 md:order-1 md:justify-start">
          <img src={config?.LOGOS?.primary} alt="Giddh Logo" className="h-8 w-auto" />
        </div>

        <div className="text-md mt-4 text-center text-gray-600 md:order-2 md:mt-0">
          {companyName ? (
            <p className="text-xl font-semibold text-gray-800">{companyName}</p>
          ) : null}

          {companyAddress && (
            <p className="mt-0.5 text-sm font-medium text-gray-600">{companyAddress}</p>
          )}

          {taxNumber && (
            <p className="mt-0.5 text-sm font-medium text-gray-600">
              {taxType}: {taxNumber}
            </p>
          )}
        </div>
        <div className="mt-4 text-center md:order-3 md:mt-0 md:text-right">
          <p className="text-md font-medium text-gray-900">Contact Us</p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 md:justify-end"
          >
            <EnvelopeIcon className="h-4 w-4" />
            <span className="break-all sm:break-normal">{supportEmail}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
