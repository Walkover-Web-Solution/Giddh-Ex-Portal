# Routing Documentation

## Overview

Giddh Portal uses Next.js 14 App Router with dynamic routing for multi-tenant support. The routing structure supports company-specific and country-specific pages.

## Routing Structure

### Base URL Pattern

```
/:companyUniqueName/:country/[feature]
```

### Example Routes

```
/PiyusssshhCompany/in/invoices
/PiyusssshhCompany/in/payments
/PiyusssshhCompany/in/account-statement
/PiyusssshhCompany/in/invoice/preview?voucher=abc123
/PiyusssshhCompany/in/payment/preview?voucher=xyz789
```

## Route Definitions

### File Structure

```
src/app/
├── [company]/
│   └── [country]/
│       ├── account-statement/
│       │   └── page.tsx
│       ├── details/
│       │   └── page.tsx
│       ├── invoice/
│       │   └── preview/
│       │       └── page.tsx
│       ├── invoices/
│       │   └── page.tsx
│       ├── login/
│       │   └── page.tsx
│       ├── payment/
│       │   └── preview/
│       │       └── page.tsx
│       ├── payments/
│       │   └── page.tsx
│       ├── welcome/
│       │   └── page.tsx
│       └── layout.tsx
├── auth/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

## Dynamic Routes

### 1. Company Parameter `[company]`

Represents the company's unique name in the URL.

**Access in Component:**

```typescript
import { useParams } from "next/navigation";

const params = useParams();
const companyName = params?.company as string;
```

**Example:** `/PiyusssshhCompany/in/invoices`

- `companyName` = `"PiyusssshhCompany"`

### 2. Country Parameter `[country]`

Represents the country/region code.

**Access in Component:**

```typescript
const country = params?.country as string;
```

**Example:** `/PiyusssshhCompany/in/invoices`

- `country` = `"in"`

**Supported Countries:**

- `in` - India
- `uk` - United Kingdom
- `us` - United States
- `ae` - UAE

## Query Parameters

### Invoice Preview

**Route:** `/:company/:country/invoice/preview`

**Query Parameters:**

- `voucher` (required): Invoice unique name

**Example:**

```
/PiyusssshhCompany/in/invoice/preview?voucher=inv123
```

**Access in Component:**

```typescript
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const voucherUniqueName = searchParams.get("voucher") || "";
```

### Payment Preview

**Route:** `/:company/:country/payment/preview`

**Query Parameters:**

- `voucher` (required): Payment voucher unique name

**Example:**

```
/PiyusssshhCompany/in/payment/preview?voucher=rcpt456
```

## Navigation

### 1. Using `useRouter`

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Navigate to a route
router.push(`/${companyName}/${country}/invoices`);

// Navigate back
router.back();

// Replace current route
router.replace(`/${companyName}/${country}/login`);

// Refresh current route
router.refresh();
```

### 2. Using `<Link>` Component

```typescript
import Link from "next/link";

<Link href={`/${companyName}/${country}/invoices`}>
  View Invoices
</Link>
```

### 3. Programmatic Navigation with Query Params

```typescript
router.push(`/${companyName}/${country}/invoice/preview?voucher=${voucherUniqueName}`);
```

## Layouts

### Root Layout

**File:** `src/app/layout.tsx`

Wraps the entire application with Redux provider and global styles.

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
```

### Company/Country Layout

**File:** `src/app/[company]/[country]/layout.tsx`

Provides shared layout for all company-specific pages (Header, Sidebar, Footer).

```typescript
export default function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company: string; country: string };
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
```

## Route Patterns

### 1. List Pages

**Pattern:** `/:company/:country/[feature]s`

**Examples:**

- `/PiyusssshhCompany/in/invoices` - Invoice list
- `/PiyusssshhCompany/in/payments` - Payment list

**Features:**

- Data table with pagination
- Sorting and filtering
- Clickable rows to detail pages

### 2. Detail/Preview Pages

**Pattern:** `/:company/:country/[feature]/preview?voucher=:id`

**Examples:**

- `/PiyusssshhCompany/in/invoice/preview?voucher=inv123`
- `/PiyusssshhCompany/in/payment/preview?voucher=rcpt456`

**Features:**

- PDF preview
- Action buttons (Print, Download)
- Back navigation

### 3. Feature Pages

**Pattern:** `/:company/:country/[feature-name]`

**Examples:**

- `/PiyusssshhCompany/in/account-statement`
- `/PiyusssshhCompany/in/details`

**Features:**

- Feature-specific content
- Data visualization
- Export functionality

## Sidebar Navigation

### Navigation Items

```typescript
const navItems = [
  {
    name: "Welcome",
    path: "welcome",
    icon: Home,
  },
  {
    name: "Invoices",
    path: "invoices",
    icon: FileText,
  },
  {
    name: "Payments",
    path: "payments",
    icon: CreditCard,
  },
  {
    name: "Account Statement",
    path: "account-statement",
    icon: Receipt,
  },
  {
    name: "Details",
    path: "details",
    icon: User,
  },
];
```

### Active Route Detection

```typescript
const pathname = usePathname();
const isActive = pathname.endsWith(item.path);
```

### Highlighting Sub-routes

```typescript
// Highlight "Invoices" for both /invoices and /invoice/preview
const isInvoiceRoute = pathname.includes("/invoice");
const isActive = pathname.endsWith("invoices") || isInvoiceRoute;
```

## Protected Routes

### Authentication Check

```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push(`/${companyName}/${country}/login`);
  }
}, []);
```

### Redirect After Login

```typescript
// After successful login
const redirectTo = searchParams.get("redirect") || `/${companyName}/${country}/welcome`;
router.push(redirectTo);
```

## Route Guards

### Company/Account Validation

```typescript
useEffect(() => {
  const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();

  if (!companyUniqueName || !accountUniqueName) {
    setError("Missing company or account information");
    router.push(`/${companyName}/${country}/login`);
  }
}, []);
```

## URL Construction Helpers

### Build Route URL

```typescript
function buildRoute(
  company: string,
  country: string,
  path: string,
  queryParams?: Record<string, string>
): string {
  let url = `/${company}/${country}/${path}`;

  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  return url;
}

// Usage
const invoiceUrl = buildRoute("PiyusssshhCompany", "in", "invoice/preview", {
  voucher: "inv123",
});
// Result: /PiyusssshhCompany/in/invoice/preview?voucher=inv123
```

### Extract Route Parameters

```typescript
function useRouteParams() {
  const params = useParams();
  const searchParams = useSearchParams();

  return {
    company: params?.company as string,
    country: params?.country as string,
    voucher: searchParams.get("voucher") || "",
  };
}

// Usage
const { company, country, voucher } = useRouteParams();
```

## Route Metadata

### Page Titles

```typescript
export const metadata = {
  title: "Invoices - Giddh Portal",
  description: "View and manage your invoices",
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }: { params: { company: string } }) {
  return {
    title: `${params.company} - Invoices`,
  };
}
```

## Loading States

### Loading UI

**File:** `src/app/[company]/[country]/invoices/loading.tsx`

```typescript
export default function Loading() {
  return <TableSkeleton rows={10} />;
}
```

### Suspense Boundaries

```typescript
import { Suspense } from "react";

<Suspense fallback={<Loading />}>
  <InvoiceList />
</Suspense>
```

## Error Handling

### Error Boundary

**File:** `src/app/[company]/[country]/invoices/error.tsx`

```typescript
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Page

**File:** `src/app/[company]/[country]/not-found.tsx`

```typescript
export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <Link href="/">Go Home</Link>
    </div>
  );
}
```

## Route Transitions

### Loading Indicators

```typescript
const [isNavigating, setIsNavigating] = useState(false);

const handleNavigation = (url: string) => {
  setIsNavigating(true);
  router.push(url);
};

// Next.js automatically handles the loading state
```

### Scroll Restoration

```typescript
// Automatically handled by Next.js
// Scroll position is restored on back navigation
```

## Best Practices

### 1. Always Use Dynamic Routes

```typescript
// ✅ Good
router.push(`/${companyName}/${country}/invoices`);

// ❌ Bad - Hardcoded
router.push("/PiyusssshhCompany/in/invoices");
```

### 2. Validate Route Parameters

```typescript
useEffect(() => {
  if (!companyName || !country) {
    router.push("/");
  }
}, [companyName, country]);
```

### 3. Use Type-Safe Navigation

```typescript
type RouteParams = {
  company: string;
  country: string;
};

function navigateToInvoices({ company, country }: RouteParams) {
  router.push(`/${company}/${country}/invoices`);
}
```

### 4. Handle Query Parameters Safely

```typescript
const voucher = searchParams.get("voucher");
if (!voucher) {
  setError("Voucher ID is required");
  return;
}
```

### 5. Preserve Query Params on Navigation

```typescript
const currentParams = new URLSearchParams(searchParams.toString());
currentParams.set("page", "2");
router.push(`${pathname}?${currentParams.toString()}`);
```

## Common Navigation Patterns

### 1. List to Detail

```typescript
// In list page
const handleRowClick = (voucherUniqueName: string) => {
  router.push(`/${companyName}/${country}/invoice/preview?voucher=${voucherUniqueName}`);
};
```

### 2. Detail to List

```typescript
// In detail page
const handleBack = () => {
  router.push(`/${companyName}/${country}/invoices`);
};
```

### 3. Sidebar Navigation

```typescript
const handleNavItemClick = (path: string) => {
  router.push(`/${companyName}/${country}/${path}`);
};
```

### 4. Breadcrumb Navigation

```typescript
const breadcrumbs = [
  { label: "Home", path: `/${companyName}/${country}/welcome` },
  { label: "Invoices", path: `/${companyName}/${country}/invoices` },
  { label: "Preview", path: pathname },
];
```

## Route Configuration

### Parallel Routes

Not currently implemented, but can be added:

```
app/
  [company]/
    [country]/
      @modal/
        invoice/
          preview/
            page.tsx
      layout.tsx
```

### Intercepting Routes

Not currently implemented, but can be added for modals:

```
app/
  [company]/
    [country]/
      (..)invoice/
        preview/
          page.tsx
```

## SEO Considerations

### Canonical URLs

```typescript
export const metadata = {
  alternates: {
    canonical: `https://portal.giddh.com/${companyName}/${country}/invoices`,
  },
};
```

### Robots Meta

```typescript
export const metadata = {
  robots: {
    index: false, // Don't index user-specific pages
    follow: true,
  },
};
```

## Performance Optimization

### Route Prefetching

```typescript
// Next.js automatically prefetches Link components
<Link href={`/${companyName}/${country}/invoices`} prefetch={true}>
  Invoices
</Link>
```

### Dynamic Imports

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/HeavyComponent"), {
  loading: () => <Skeleton />,
});
```

## Debugging Routes

### Log Current Route

```typescript
const pathname = usePathname();
const searchParams = useSearchParams();

console.log("Current path:", pathname);
console.log("Query params:", Object.fromEntries(searchParams.entries()));
```

### Route Change Events

```typescript
useEffect(() => {
  console.log("Route changed to:", pathname);
}, [pathname]);
```

## Migration from Pages Router

If migrating from Pages Router to App Router:

1. Move files from `pages/` to `app/`
2. Rename files to `page.tsx`
3. Update imports from `next/router` to `next/navigation`
4. Replace `getServerSideProps` with Server Components
5. Update `_app.tsx` to `layout.tsx`
6. Update `_document.tsx` to root `layout.tsx`

## Future Enhancements

- [ ] Add route groups for better organization
- [ ] Implement parallel routes for modals
- [ ] Add intercepting routes for overlays
- [ ] Implement middleware for authentication
- [ ] Add route-based code splitting
- [ ] Implement dynamic sitemap generation
