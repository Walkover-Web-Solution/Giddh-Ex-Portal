"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Home, FileText, CreditCard, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", path: "welcome", icon: Home },
  { name: "Invoices", path: "invoices", icon: FileText },
  { name: "Payments Made", path: "payments", icon: CreditCard },
  { name: "Account Statement", path: "account-statement", icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const company = params?.company as string;
  const country = params?.country as string;

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {navigationItems.map((item) => {
          const href = company && country ? `/${company}/${country}/${item.path}` : `/${item.path}`;
          const isActive = pathname?.endsWith(`/${item.path}`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
            SJ
          </div>
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
