# API Architecture & Data Flow

## 📋 API Requirements Per Page

### **Welcome Page** (`/[company]/[country]/welcome`)

Fetches ALL APIs on mount/refresh:

- ✅ `fetchBalanceSummary` - Balance Summary Card
- ✅ `fetchAllPayments` - Last Payment Card (shows first payment from array)
- ✅ `fetchUserDetails` - User Details Card
- ✅ `fetchAccountDetails` - Account details
- ✅ `fetchCompanyDetails` - Company/user info

### **Payments Made Page** (`/[company]/[country]/payments`)

- ✅ Uses `allPayments` from Redux (already fetched on Welcome page)
- ✅ No API calls - displays data from Redux
- ✅ Shows all payments in table format

### **Invoices Page** (`/[company]/[country]/invoices`)

- ✅ Uses `allPayments` from Redux (already fetched on Welcome page)
- ✅ No API calls - displays data from Redux

## 🔄 Data Flow

### On Page Load/Refresh:

1. **Welcome page** fetches all required APIs
2. Data is stored in Redux under `companies[companyName]`
3. Child components display data from Redux

### On Tab Switch:

1. **No API calls** are made
2. Components read existing data from Redux
3. Instant display with no loading time

### Benefits:

- ✅ APIs called only once on initial load
- ✅ No redundant network requests
- ✅ Fast navigation between tabs
- ✅ Centralized data management
- ✅ Fresh data on page refresh

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
