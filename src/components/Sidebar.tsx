"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { mergeClassNames } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCompanyData, logoutCompany, selectUserDetails } from "@/store/slices/companySlice";

const navItems = [
  { name: "Home", path: "welcome", icon: HomeIcon },
  { name: "Invoices", path: "invoice", icon: DocumentDuplicateIcon },
  { name: "Payments Made", path: "payment", icon: CreditCardIcon },
  { name: "Account Statement", path: "account-statement", icon: ChartPieIcon },
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
        className={mergeClassNames(
          "fixed left-0 top-0 z-50 flex h-screen flex-col justify-between overflow-y-auto border-r border-gray-200 bg-white px-6 transition-all duration-300",
          isCollapsed ? "md:w-20 md:px-2" : "md:w-64",
          "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="relative flex grow flex-col gap-y-5">
          <div
            className={mergeClassNames(
              "relative flex h-16 shrink-0 items-center",
              isCollapsed && "md:justify-center"
            )}
          >
            {(!isCollapsed || isMobileOpen) && (
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-blue-900">
                {company}
              </span>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="hidden text-gray-400 hover:bg-gray-50 hover:text-blue-900 md:flex"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="size-5" aria-hidden />
                ) : (
                  <ChevronLeftIcon className="size-5" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeMobile}
                className="md:hidden"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="size-5" aria-hidden />
              </Button>
            </div>
          </div>

          <nav className="relative flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul
                  role="list"
                  className={mergeClassNames("-mx-2 space-y-1", isCollapsed && "md:mx-0")}
                >
                  {navItems.map(({ name, path, icon: Icon }) => {
                    const href = `/${company}/${country}/${path}`;
                    const active = pathname?.includes(`/${path}`);

                    return (
                      <li key={name}>
                        <Link
                          href={href}
                          onClick={closeMobile}
                          className={mergeClassNames(
                            active
                              ? "bg-gray-50 text-blue-900"
                              : "text-gray-500 hover:bg-gray-50 hover:text-blue-900",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                            isCollapsed && "md:justify-center md:px-2"
                          )}
                          title={isCollapsed ? name : undefined}
                        >
                          <Icon
                            aria-hidden
                            className={mergeClassNames(
                              active ? "text-blue-900" : "text-gray-400 group-hover:text-blue-900",
                              "size-6 shrink-0"
                            )}
                          />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{name}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <div className={mergeClassNames("-mx-6 mt-auto", isCollapsed && "md:mx-0")}>
          {!isCollapsed || isMobileOpen ? (
            <div className="flex items-center gap-x-2 px-6 py-3 md:gap-x-4">
              <Link
                href={`/${company}/${country}/details`}
                onClick={closeMobile}
                className="flex min-w-0 flex-1 items-center gap-x-4 rounded-md py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
              >
                <span
                  className={mergeClassNames(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-medium outline -outline-offset-1 outline-black/5",
                    "border-gray-200 text-gray-600"
                  )}
                >
                  {initials}
                </span>
                <span className="truncate" aria-hidden>
                  {user?.name}
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="shrink-0 text-gray-400 hover:bg-gray-50 hover:text-blue-900"
                title="Logout"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="size-5" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-2 pb-4">
              <Link
                href={`/${company}/${country}/details`}
                onClick={closeMobile}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600 outline -outline-offset-1 outline-black/5 transition-opacity hover:border-blue-900 hover:text-blue-900 hover:opacity-80"
                title={user?.name}
              >
                {initials}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:bg-gray-50 hover:text-blue-900"
                title="Logout"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
