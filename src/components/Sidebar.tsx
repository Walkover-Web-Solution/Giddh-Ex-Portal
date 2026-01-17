"use client";

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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCompanyData, logoutCompany, selectUserDetails } from "@/store/slices/companySlice";

const navItems = [
  { name: "Home", path: "welcome", icon: Home },
  { name: "Invoices", path: "invoices", icon: FileText },
  { name: "Payments Made", path: "payments", icon: CreditCard },
  { name: "Account Statement", path: "account-statement", icon: FileSpreadsheet },
];

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const company = params?.company as string;
  const country = params?.country as string;

  const user = useAppSelector(selectUserDetails(company));
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    logoutCompany(company);
    dispatch(clearCompanyData(company));
    closeMobile();
    router.push(`/${company}/${country}/login`);
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobile} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col justify-between border-r bg-white transition-all duration-300",
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div>
          <button
            onClick={toggleCollapsed}
            className="absolute right-3 top-3 hidden rounded-md p-1.5 hover:bg-gray-100 md:block"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={closeMobile}
            className="absolute right-3 top-3 rounded-md p-2 hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          <nav className="mt-16 flex flex-col gap-1 px-3">
            {navItems.map(({ name, path, icon: Icon }) => {
              const href = `/${company}/${country}/${path}`;
              const active = pathname?.includes(`/${path}`);

              return (
                <Link
                  key={name}
                  href={href}
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-blue-900 text-white" : "text-gray-700 hover:bg-gray-100",
                    isCollapsed && "md:justify-center"
                  )}
                  title={isCollapsed ? name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>{name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto px-3 pb-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/${company}/${country}/details`}
                onClick={closeMobile}
                className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
                  {initials}
                </div>
                <span className="truncate text-sm font-medium">{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="shrink-0 rounded-md p-2 hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href={`/${company}/${country}/details`}
                onClick={closeMobile}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-white transition-opacity hover:opacity-80"
                title={user?.name}
              >
                {initials}
              </Link>
              <button onClick={handleLogout} className="rounded-md p-2 hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
