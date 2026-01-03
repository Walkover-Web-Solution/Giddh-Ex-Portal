import { Mail, Building2 } from "lucide-react";

interface FooterProps {
  companyName: string;
  gstin: string;
  supportEmail: string;
  variant?: "full" | "minimal";
}

export function Footer({ companyName, gstin, supportEmail, variant = "minimal" }: FooterProps) {
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
    <footer className="mt-auto border-t bg-white py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-8">
            <div className="flex items-center gap-6">
              <div className="text-xl font-bold text-blue-900">GIDDH</div>
              <div className="hidden text-xs text-gray-400 md:block">|</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-medium">{companyName}</span>
                <span className="text-gray-400">•</span>
                <span>GSTIN: {gstin}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-blue-600"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>{supportEmail}</span>
            </a>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">© {new Date().getFullYear()} Giddh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
