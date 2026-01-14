"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  CreditCard,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCompanyData,
  logoutCompany,
  selectCompanyUniqueName,
  selectUserDetails,
} from "@/store/slices/companySlice";
import { useSidebar } from "@/contexts/SidebarContext";

const navigationItems = [
  { name: "Home", path: "welcome", icon: Home },
  { name: "Invoices", path: "invoices", icon: FileText },
  { name: "Payments Made", path: "payments", icon: CreditCard },
  { name: "Account Statement", path: "account-statement", icon: FileSpreadsheet },
];

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = params?.company as string;
  const country = params?.country as string;
  const companyUniqueName = useAppSelector(selectCompanyUniqueName(company));
  const userDetails = useAppSelector(selectUserDetails(company));

  const isExpanded = !isCollapsed || isHovered;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userDetails?.name);
  const userName = userDetails?.name || "User";

  const handleLogout = () => {
    console.log("Logout clicked", { company, companyUniqueName });

    if (company) {
      // Delete session cookie using company name from URL (e.g., PiyusssshhCompany)
      logoutCompany(company);

      dispatch(clearCompanyData(company));

      localStorage.removeItem("userEmail");
      localStorage.removeItem("userData");

      router.push(`/${company}/${country}/login`);
    } else {
      console.error("Cannot logout: company not found");
    }
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white transition-[width] duration-500 ease-in-out",
          isCollapsed && !isHovered ? "w-20" : "w-64",
          isCollapsed && isHovered && "shadow-xl"
        )}
        style={{ willChange: "width" }}
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => isCollapsed && setIsHovered(false)}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-4 top-4 z-50 rounded-md p-1.5 transition-colors hover:bg-gray-100"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>

        <nav className="flex flex-col gap-1 px-4 pt-16">
          {navigationItems.map((item) => {
            const href =
              company && country ? `/${company}/${country}/${item.path}` : `/${item.path}`;

            let isActive = pathname?.endsWith(`/${item.path}`);

            // Special case: highlight Invoices when on invoice preview page
            if (item.path === "invoices" && pathname?.includes("/invoice/preview")) {
              isActive = true;
            }

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100",
                  !isExpanded && "justify-center"
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-4">
          {isExpanded ? (
            <div className="flex items-center gap-3 rounded-lg p-2">
              <button
                onClick={() => router.push(`/${company}/${country}/details`)}
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <span className="truncate text-sm font-medium text-gray-900">{userName}</span>
              </button>

              <button
                onClick={handleLogout}
                className="ml-auto flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => router.push(`/${company}/${country}/details`)}
                className="flex items-center justify-center transition-opacity hover:opacity-80"
                title={userName}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                  {userInitials}
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </aside>
      {isCollapsed && isHovered && <div className="fixed inset-0 z-30 bg-black/20" />}
    </>
  );
}
