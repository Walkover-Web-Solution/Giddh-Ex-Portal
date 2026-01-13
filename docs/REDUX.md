# Redux State Management Documentation

## Overview

The Giddh Portal uses **Redux Toolkit** for state management. The store is organized using feature-based slices, with a focus on the company slice that manages multi-tenant data.

## Store Configuration

### File: `src/store/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import companyReducer from "./slices/companySlice";

export const store = configureStore({
  reducer: {
    companies: companyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks: `src/store/hooks.ts`

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Usage:**

```typescript
import { useAppSelector, useAppDispatch } from "@/store/hooks";

// In component
const dispatch = useAppDispatch();
const data = useAppSelector(selectData);
```

## Company Slice

### File: `src/store/slices/companySlice.ts`

The company slice manages all company-related data in a multi-tenant structure.

### State Structure

```typescript
interface CompanyState {
  [companyName: string]: {
    companyName: string;
    country: string;
    companyUniqueName?: string;
    user?: UserCompanyData;
    userData?: UserData;
    account?: AccountInfo;
    balanceSummary?: BalanceSummaryState;
    accountDetails?: AccountDetailsState;
    accountsList?: AccountsListState;
    allPayments?: AllPaymentsState;
    allInvoices?: AllInvoicesState;
    userDetails?: UserDetailsState;
  };
}
```

### Key Concepts

#### 1. Multi-Tenant State

Each company has its own isolated state:

```typescript
{
  "PiyusssshhCompany": {
    companyName: "PiyusssshhCompany",
    country: "in",
    user: { ... },
    allInvoices: { ... }
  },
  "AnotherCompany": {
    companyName: "AnotherCompany",
    country: "uk",
    user: { ... },
    allInvoices: { ... }
  }
}
```

#### 2. Nested State Pattern

Each feature has its own state structure:

```typescript
interface FeatureState {
  data: DataType | null;
  loading: boolean;
  error: string | null;
}
```

## Async Thunks

Async thunks handle API calls and update the Redux state.

### Pattern

```typescript
export const fetchFeatureData = createAsyncThunk(
  "companies/fetchFeatureData",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await apiFunction(companyUniqueName, accountUniqueName);
    return { companyName, data: response.body };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.featureData;
      return !existingData; // Only fetch if data doesn't exist
    },
  }
);
```

### Available Async Thunks

#### 1. `fetchCompanyDetails`

Fetches company and account details.

```typescript
dispatch(
  fetchCompanyDetails({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].user`
- Loading and error states

#### 2. `fetchBalanceSummary`

Fetches account balance summary.

```typescript
dispatch(
  fetchBalanceSummary({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].balanceSummary`

#### 3. `fetchAccountDetails`

Fetches detailed account information.

```typescript
dispatch(
  fetchAccountDetails({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].accountDetails`

#### 4. `fetchAccountsList`

Fetches list of all accounts.

```typescript
dispatch(
  fetchAccountsList({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].accountsList`

#### 5. `fetchAllPayments`

Fetches all payment vouchers.

```typescript
dispatch(
  fetchAllPayments({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].allPayments`

#### 6. `fetchAllInvoices`

Fetches all invoices with pagination.

```typescript
dispatch(
  fetchAllInvoices({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
    page: 1,
    count: 10,
    sort: "desc",
    sortBy: "voucherDate",
  })
);
```

**Updates:**

- `companies[companyName].allInvoices`

#### 7. `fetchUserDetails`

Fetches user/vendor details.

```typescript
dispatch(
  fetchUserDetails({
    companyName: "PiyusssshhCompany",
    companyUniqueName: "piyusssshhcompany",
    accountUniqueName: "account123",
  })
);
```

**Updates:**

- `companies[companyName].userDetails`

## Selectors

Selectors extract specific data from the Redux state.

### Pattern

```typescript
export const selectFeatureData = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.featureData?.data || null;

export const selectFeatureLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.featureData?.loading || false;

export const selectFeatureError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.featureData?.error || null;
```

### Available Selectors

#### Company & Account Selectors

```typescript
// Get company unique name
selectCompanyUniqueName(companyName: string)

// Get account unique name
selectAccountUniqueName(companyName: string)

// Get user company data
selectUserCompanyData(companyName: string)
```

#### Balance Summary Selectors

```typescript
selectBalanceSummary(companyName: string)
selectBalanceSummaryLoading(companyName: string)
selectBalanceSummaryError(companyName: string)
```

#### Account Details Selectors

```typescript
selectAccountDetails(companyName: string)
selectAccountDetailsLoading(companyName: string)
selectAccountDetailsError(companyName: string)
```

#### Accounts List Selectors

```typescript
selectAccountsList(companyName: string)
selectAccountsListLoading(companyName: string)
selectAccountsListError(companyName: string)
```

#### Payments Selectors

```typescript
selectAllPayments(companyName: string)
selectAllPaymentsLoading(companyName: string)
selectAllPaymentsError(companyName: string)
```

#### Invoices Selectors

```typescript
selectAllInvoices(companyName: string)
selectAllInvoicesLoading(companyName: string)
selectAllInvoicesError(companyName: string)
selectInvoicesTotalPages(companyName: string)
selectInvoicesTotalItems(companyName: string)
```

#### User Details Selectors

```typescript
selectUserDetails(companyName: string)
selectUserDetailsLoading(companyName: string)
selectUserDetailsError(companyName: string)
```

## Usage Examples

### 1. Fetching Data on Page Load

```typescript
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllInvoices,
  selectAllInvoices,
  selectAllInvoicesLoading,
  selectCompanyUniqueName,
  selectAccountUniqueName,
} from "@/store/slices/companySlice";

export default function InvoicesPage() {
  const params = useParams();
  const dispatch = useAppDispatch();

  const companyName = params?.company as string;
  const companyUniqueName = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueName = useAppSelector(selectAccountUniqueName(companyName));

  const invoices = useAppSelector(selectAllInvoices(companyName));
  const loading = useAppSelector(selectAllInvoicesLoading(companyName));

  useEffect(() => {
    if (companyName && companyUniqueName && accountUniqueName) {
      dispatch(fetchAllInvoices({
        companyName,
        companyUniqueName,
        accountUniqueName,
        page: 1,
        count: 10,
        sort: "desc",
        sortBy: "voucherDate"
      }));
    }
  }, [dispatch, companyName, companyUniqueName, accountUniqueName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {invoices?.map(invoice => (
        <div key={invoice.uniqueName}>{invoice.voucherNumber}</div>
      ))}
    </div>
  );
}
```

### 2. Using Multiple Selectors

```typescript
const companyUniqueName = useAppSelector(selectCompanyUniqueName(companyName));
const accountUniqueName = useAppSelector(selectAccountUniqueName(companyName));
const balanceSummary = useAppSelector(selectBalanceSummary(companyName));
const invoices = useAppSelector(selectAllInvoices(companyName));
const payments = useAppSelector(selectAllPayments(companyName));
```

### 3. Conditional Data Fetching

```typescript
useEffect(() => {
  // Only fetch if data doesn't exist
  if (companyName && companyUniqueName && accountUniqueName && !invoices) {
    dispatch(fetchAllInvoices({ companyName, companyUniqueName, accountUniqueName }));
  }
}, [companyName, companyUniqueName, accountUniqueName, invoices]);
```

### 4. Handling Loading and Error States

```typescript
const data = useAppSelector(selectFeatureData(companyName));
const loading = useAppSelector(selectFeatureLoading(companyName));
const error = useAppSelector(selectFeatureError(companyName));

if (loading) {
  return <LoadingSkeleton />;
}

if (error) {
  return <ErrorMessage message={error} />;
}

if (!data) {
  return <EmptyState />;
}

return <DataDisplay data={data} />;
```

## Reducers

### Extra Reducers Pattern

```typescript
.addCase(fetchFeatureData.pending, (state, action) => {
  const { companyName } = action.meta.arg;
  if (!state[companyName]) {
    state[companyName] = { companyName, country: "" };
  }
  state[companyName].featureData = {
    data: null,
    loading: true,
    error: null,
  };
})
.addCase(fetchFeatureData.fulfilled, (state, action) => {
  const { companyName, data } = action.payload;
  if (state[companyName]?.featureData) {
    state[companyName].featureData.data = data;
    state[companyName].featureData.loading = false;
  }
})
.addCase(fetchFeatureData.rejected, (state, action) => {
  const { companyName } = action.meta.arg;
  if (state[companyName]?.featureData) {
    state[companyName].featureData.loading = false;
    state[companyName].featureData.error = action.error.message || "Failed to fetch data";
  }
});
```

## Best Practices

### 1. Always Use Typed Hooks

```typescript
// ✅ Good
import { useAppSelector, useAppDispatch } from "@/store/hooks";

// ❌ Bad
import { useSelector, useDispatch } from "react-redux";
```

### 2. Memoize Selectors for Derived Data

```typescript
import { createSelector } from "@reduxjs/toolkit";

export const selectFilteredInvoices = createSelector(
  [selectAllInvoices, (state, filter) => filter],
  (invoices, filter) => invoices?.filter((inv) => inv.status === filter)
);
```

### 3. Normalize Complex Data

```typescript
// ✅ Good - Normalized
{
  byId: {
    "inv1": { id: "inv1", ... },
    "inv2": { id: "inv2", ... }
  },
  allIds: ["inv1", "inv2"]
}

// ❌ Bad - Nested arrays
{
  invoices: [
    { id: "inv1", items: [...] },
    { id: "inv2", items: [...] }
  ]
}
```

### 4. Handle Loading States Properly

```typescript
// Always check loading state before rendering
if (loading) return <Skeleton />;
if (error) return <Error />;
if (!data) return <Empty />;
return <Content data={data} />;
```

### 5. Use Conditional Fetching

```typescript
// Prevent unnecessary API calls
{
  condition: ({ companyName }, { getState }) => {
    const state = getState() as RootState;
    const existingData = state.companies[companyName]?.featureData;
    return !existingData; // Only fetch if not cached
  },
}
```

## Common Patterns

### 1. LocalStorage Fallback

```typescript
let companyUniqueName = companyUniqueNameFromRedux;
let accountUniqueName = accountUniqueNameFromRedux;

if (!companyUniqueName && typeof window !== "undefined") {
  const userData = localStorage.getItem("userData");
  if (userData) {
    const parsedData = JSON.parse(userData);
    companyUniqueName = parsedData.companyUniqueName;
    accountUniqueName = parsedData.account?.uniqueName;
  }
}
```

### 2. Parallel Data Fetching

```typescript
useEffect(() => {
  if (companyName && companyUniqueName && accountUniqueName) {
    dispatch(fetchBalanceSummary({ companyName, companyUniqueName, accountUniqueName }));
    dispatch(fetchAllInvoices({ companyName, companyUniqueName, accountUniqueName }));
    dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName }));
  }
}, [dispatch, companyName, companyUniqueName, accountUniqueName]);
```

### 3. Pagination State

```typescript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

useEffect(() => {
  dispatch(
    fetchAllInvoices({
      companyName,
      companyUniqueName,
      accountUniqueName,
      page: currentPage,
      count: itemsPerPage,
    })
  );
}, [currentPage, itemsPerPage]);
```

## Debugging Redux

### 1. Redux DevTools

Install Redux DevTools browser extension to:

- Inspect state changes
- Time-travel debugging
- Track action dispatches

### 2. Console Logging

```typescript
// In async thunk
console.log("Fetching data with:", { companyName, companyUniqueName });

// In component
console.log(
  "Current state:",
  useAppSelector((state) => state.companies)
);
```

### 3. Selector Testing

```typescript
// Test selectors in console
import { store } from "@/store/store";
import { selectAllInvoices } from "@/store/slices/companySlice";

console.log(selectAllInvoices("PiyusssshhCompany")(store.getState()));
```

## Performance Optimization

### 1. Avoid Unnecessary Re-renders

```typescript
// Use specific selectors
const invoiceCount = useAppSelector(
  (state) => state.companies[companyName]?.allInvoices?.data?.length || 0
);

// Instead of selecting entire state
const allInvoices = useAppSelector(selectAllInvoices(companyName));
const count = allInvoices?.length || 0;
```

### 2. Memoize Expensive Computations

```typescript
const sortedInvoices = useMemo(() => {
  return invoices?.sort(
    (a, b) => new Date(b.voucherDate).getTime() - new Date(a.voucherDate).getTime()
  );
}, [invoices]);
```

### 3. Batch Updates

```typescript
// Redux Toolkit automatically batches updates
dispatch(action1());
dispatch(action2());
dispatch(action3());
// Only one re-render
```

## Migration Guide

### Adding a New Feature to Redux

1. **Define State Interface**

```typescript
interface NewFeatureState {
  data: NewFeatureData[] | null;
  loading: boolean;
  error: string | null;
}
```

2. **Create Async Thunk**

```typescript
export const fetchNewFeature = createAsyncThunk(
  "companies/fetchNewFeature",
  async ({ companyName, companyUniqueName, accountUniqueName }) => {
    const response = await getNewFeatureData(companyUniqueName, accountUniqueName);
    return { companyName, data: response.body };
  }
);
```

3. **Add to State Interface**

```typescript
interface CompanyInfo {
  // ... existing fields
  newFeature?: NewFeatureState;
}
```

4. **Add Extra Reducers**

```typescript
.addCase(fetchNewFeature.pending, (state, action) => { ... })
.addCase(fetchNewFeature.fulfilled, (state, action) => { ... })
.addCase(fetchNewFeature.rejected, (state, action) => { ... })
```

5. **Create Selectors**

```typescript
export const selectNewFeature = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.newFeature?.data || null;
```

6. **Use in Components**

```typescript
const data = useAppSelector(selectNewFeature(companyName));
```
