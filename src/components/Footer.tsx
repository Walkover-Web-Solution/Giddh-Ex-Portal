import { Mail, Building2 } from "lucide-react";

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
  if (variant === "minimal") {
    return (
      <footer className="mt-auto border-t bg-gray-50 py-3">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 md:flex-row md:gap-4">
            <span>© {new Date().getFullYear()} Giddh. All rights reserved.</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <span className="text-lg font-bold tracking-wide text-blue-900">GIDDH</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center text-xs text-gray-600 md:items-center">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="font-medium">{companyName}</span>
            </div>
            {companyAddress && <span className="max-w-xs break-words">{companyAddress}</span>}

            {gstin && <span className="text-gray-500">GSTIN: {gstin}</span>}
          </div>

          <div className="flex flex-col items-center gap-1 text-xs text-gray-600 md:items-end">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-1.5 hover:text-blue-600"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="break-all sm:break-normal">{supportEmail}</span>
            </a>

            <span className="text-gray-400">© {new Date().getFullYear()} Giddh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
