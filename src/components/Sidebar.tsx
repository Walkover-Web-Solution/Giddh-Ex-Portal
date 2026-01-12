"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Home, FileText, CreditCard, FileSpreadsheet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCompanyData,
  logoutCompany,
  selectCompanyUniqueName,
} from "@/store/slices/companySlice";

const navigationItems = [
  { name: "Home", path: "welcome", icon: Home },
  { name: "Invoices", path: "invoices", icon: FileText },
  { name: "Payments Made", path: "payments", icon: CreditCard },
  { name: "Account Statement", path: "account-statement", icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = params?.company as string;
  const country = params?.country as string;
  const companyUniqueName = useAppSelector(selectCompanyUniqueName(company));

  const handleLogout = () => {
    console.log("Logout clicked", { company, companyUniqueName });

    if (company) {
      if (companyUniqueName) {
        logoutCompany(companyUniqueName);
      }

      dispatch(clearCompanyData(company));

      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userData");

      router.push(`/${company}/${country}/login`);
    } else {
      console.error("Cannot logout: company not found");
    }
  };

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
