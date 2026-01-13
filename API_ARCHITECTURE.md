# API Architecture & Data Flow

## 🎯 API Separation Strategy

APIs are separated into two categories:

### **Global APIs** (Called on every page load/refresh)

These APIs fetch data used across multiple pages and are called in the layout component:

- ✅ `fetchCompanyDetails` - Company/user info (used in Sidebar, multiple pages)
- ✅ `fetchUserDetails` - User account details (used in UserDetailsCard, Sidebar)
- ✅ `fetchAccountDetails` - Account information (used across components)

**Location**: `src/app/[company]/[country]/layout.tsx`

### **Page-Specific APIs** (Called only on specific pages)

These APIs fetch data used only on individual pages:

- ✅ `fetchBalanceSummary` - Balance Summary (Welcome page only)
- ✅ `fetchAllPayments` - Payment list (Welcome & Payments pages)
- ✅ `fetchAllInvoices` - Invoice list (Invoices page only)
- ✅ `fetchAccountsList` - Contacts list (future use)

## 📋 API Requirements Per Page

### **Welcome Page** (`/[company]/[country]/welcome`)

**Global APIs** (called by layout):

- ✅ `fetchCompanyDetails` - Company/user info
- ✅ `fetchUserDetails` - User Details Card
- ✅ `fetchAccountDetails` - Account details

**Page-Specific APIs** (called by page):

- ✅ `fetchBalanceSummary` - Balance Summary Card
- ✅ `fetchAllPayments` - Last Payment Card

### **Payments Made Page** (`/[company]/[country]/payments`)

**Global APIs** (called by layout):

- ✅ `fetchCompanyDetails` - Company/user info
- ✅ `fetchUserDetails` - User details
- ✅ `fetchAccountDetails` - Account details

**Page-Specific APIs** (called by page):

- ✅ `fetchAllPayments` - Shows all payments in table format

### **Invoices Page** (`/[company]/[country]/invoices`)

**Global APIs** (called by layout):

- ✅ `fetchCompanyDetails` - Company/user info
- ✅ `fetchUserDetails` - User details
- ✅ `fetchAccountDetails` - Account details

**Page-Specific APIs** (called by page):

- ✅ `fetchAllInvoices` - Shows all sales invoices in table format with status and overdue calculation

## 🔄 Data Flow

### On Page Load/Refresh:

1. **Layout component** (`layout.tsx`) fetches all global APIs
2. **Page component** fetches page-specific APIs
3. Data is stored in Redux under `companies[companyName]`
4. Child components display data from Redux

### On Tab Switch/Navigation:

1. **Layout component** checks if global data exists (via condition in thunks)
2. If data exists, no API calls are made
3. **Page component** fetches only its page-specific APIs
4. Components read existing data from Redux
5. Fast display with minimal loading time

### Benefits:

- ✅ Global APIs called once and cached in Redux
- ✅ Page-specific APIs called only when needed
- ✅ No redundant network requests for global data
- ✅ Fast navigation between pages
- ✅ Centralized data management
- ✅ Fresh data on page refresh
- ✅ Better separation of concerns

## 🎨 Skeleton Loaders

All loading states now use Tailwind CSS skeleton loaders instead of text:

### Created Components:

- `BalanceSummarySkeleton` - For balance summary card
- `PaymentCardSkeleton` - For payment cards
- `UserDetailsSkeleton` - For user details card
- `TableSkeleton` - For data tables
- `CardSkeleton` - Generic card skeleton

### Implementation:

```typescript
if (loading) {
  return <BalanceSummarySkeleton />;
}
```

## 📦 Redux State Structure

```typescript
companies: {
  [companyName]: {
    companyUniqueName: string,
    account: { uniqueName: string },
    balanceSummary: { data, loading, error },
    allPayments: { data: PaymentVoucher[], loading, error },
    userDetails: { data, loading, error },
    accountDetails: { data, loading, error },
    user: { name, id, email, companies, currentCompany }
  }
}
```

## 🔧 Component Architecture

### Welcome Page (Parent)

- Fetches all APIs on mount
- Passes data to child components via Redux
- Handles localStorage fallback for page refresh

### Child Components (Cards)

- Read data from Redux selectors
- Display skeleton loaders while loading
- No individual API calls
- Fully reactive to Redux state changes

## 🚀 Performance Benefits

1. **Reduced Network Calls**: APIs called once, not on every tab switch
2. **Faster Navigation**: Instant tab switches using cached Redux data
3. **Better UX**: Smooth skeleton loaders instead of text
4. **Optimized Rendering**: Components only re-render when their data changes
