import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";
import type { RootState } from "../store";
import getAccountDetails, { AccountDetailsResponse } from "@/utils/getAccountDetails";
import getAccountsList, { Account } from "@/utils/getAccountsList";
import getLastPayment, { PaymentVoucher } from "@/utils/getLastPayment";
import getCompanyDetails, { UserCompanyData } from "@/utils/getCompanyDetails";
import getInvoiceList, { InvoiceVoucher } from "@/utils/getInvoiceList";

interface Currency {
  code: string;
  symbol: string;
}

interface BalanceSummaryData {
  currency: Currency;
  balancePayable: number;
  noOfInvoices: number;
}

interface BalanceSummaryState {
  data: BalanceSummaryData | null;
  loading: boolean;
  error: string | null;
}

interface AccountDetailsState {
  data: AccountDetailsResponse["body"] | null;
  loading: boolean;
  error: string | null;
}

interface AccountsListState {
  data: Account[] | null;
  loading: boolean;
  error: string | null;
}

interface AllPaymentsState {
  data: PaymentVoucher[] | null;
  loading: boolean;
  error: string | null;
}

interface AllInvoicesState {
  data: InvoiceVoucher[] | null;
  loading: boolean;
  error: string | null;
}

interface UserDetailsState {
  data: (AccountDetailsResponse["body"] & { contacts?: Account[] }) | null;
  loading: boolean;
  error: string | null;
}

interface UserAccount {
  name: string;
  uniqueName: string;
}

interface UserData {
  email: string;
  account: UserAccount;
  vendorContactUniqueName: string;
}

interface AccountInfo {
  uniqueName: string;
}

interface CompanyInfo {
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
}

interface CompanyState {
  [companyName: string]: CompanyInfo;
}

const initialState: CompanyState = {};

// ============================================
// GLOBAL APIs - Called on every page load/refresh
// These APIs fetch data used across multiple pages
// ============================================

export const fetchCompanyDetails = createAsyncThunk(
  "companies/fetchCompanyDetails",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await getCompanyDetails(companyUniqueName, accountUniqueName);
    return { companyName, data: response.body[0] };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.user;
      return !existingData;
    },
  }
);

export const fetchUserDetails = createAsyncThunk(
  "companies/fetchUserDetails",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const [accountDetailsResponse, contactsResponse] = await Promise.all([
      getAccountDetails(companyUniqueName, accountUniqueName),
      getAccountsList(companyUniqueName, accountUniqueName),
    ]);
    return {
      companyName,
      data: {
        ...accountDetailsResponse.body,
        contacts: contactsResponse.body,
      },
    };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.userDetails?.data;
      return !existingData;
    },
  }
);

export const fetchAccountDetails = createAsyncThunk(
  "companies/fetchAccountDetails",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await getAccountDetails(companyUniqueName, accountUniqueName);
    return { companyName, data: response.body };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.accountDetails?.data;
      return !existingData;
    },
  }
);

// ============================================
// PAGE-SPECIFIC APIs - Called only on specific pages
// These APIs fetch data used only on individual pages
// ============================================

export const fetchBalanceSummary = createAsyncThunk(
  "companies/fetchBalanceSummary",
  async ({
    companyName,
    companyUniqueName,
    uniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    uniqueName: string;
  }) => {
    const response = await apiClient.get(
      `/portal/company/${companyUniqueName}/accounts/${uniqueName}/vouchers/balance-summary`,
      {
        params: {
          voucherVersion: 2,
        },
      }
    );
    return { companyName, data: response.data.body };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.balanceSummary?.data;
      return !existingData;
    },
  }
);

export const fetchAccountsList = createAsyncThunk(
  "companies/fetchAccountsList",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await getAccountsList(companyUniqueName, accountUniqueName);
    return { companyName, data: response.body };
  }
);

export const fetchAllPayments = createAsyncThunk(
  "companies/fetchAllPayments",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await getLastPayment({
      companyUniqueName,
      accountUniqueName,
      type: "receipt",
      page: 1,
      count: 100,
    });
    return { companyName, data: response.body.items || [] };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.allPayments?.data;
      return !existingData || existingData.length === 0;
    },
  }
);

export const fetchAllInvoices = createAsyncThunk(
  "companies/fetchAllInvoices",
  async ({
    companyName,
    companyUniqueName,
    accountUniqueName,
  }: {
    companyName: string;
    companyUniqueName: string;
    accountUniqueName: string;
  }) => {
    const response = await getInvoiceList({
      companyUniqueName,
      accountUniqueName,
      type: "sales",
      page: 1,
      count: 100,
      sortBy: "voucherDate",
      sort: "desc",
    });
    return { companyName, data: response.body.items || [] };
  },
  {
    condition: ({ companyName }, { getState }) => {
      const state = getState() as RootState;
      const existingData = state.companies[companyName]?.allInvoices?.data;
      return !existingData || existingData.length === 0;
    },
  }
);

export const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setCompanyData: (state, action: PayloadAction<{ companyName: string; country: string }>) => {
      const { companyName, country } = action.payload;
      if (!state[companyName]) {
        state[companyName] = {
          companyName,
          country,
          balanceSummary: {
            data: null,
            loading: false,
            error: null,
          },
        };
      } else {
        state[companyName].country = country;
      }
    },
    setUserData: (
      state,
      action: PayloadAction<{
        companyName: string;
        userData: UserData;
        companyUniqueName: string;
      }>
    ) => {
      const { companyName, userData, companyUniqueName } = action.payload;
      if (state[companyName]) {
        state[companyName].userData = userData;
        state[companyName].companyUniqueName = companyUniqueName;
      } else {
        state[companyName] = {
          companyName,
          country: "",
          companyUniqueName,
          userData: userData,
        };
      }
    },
    setUser: (
      state,
      action: PayloadAction<{
        companyName: string;
        user: UserCompanyData;
      }>
    ) => {
      const { companyName, user } = action.payload;
      if (state[companyName]) {
        state[companyName].user = user;
      }
    },
    setAccount: (
      state,
      action: PayloadAction<{
        companyName: string;
        accountUniqueName: string;
      }>
    ) => {
      const { companyName, accountUniqueName } = action.payload;
      if (state[companyName]) {
        state[companyName].account = { uniqueName: accountUniqueName };
      }
    },
    clearCompanyData: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    clearAllCompanies: () => initialState,
    clearBalanceSummary: (state, action: PayloadAction<string>) => {
      const companyName = action.payload;
      if (state[companyName]?.balanceSummary) {
        state[companyName].balanceSummary = {
          data: null,
          loading: false,
          error: null,
        };
      }
    },
    clearUserData: (state, action: PayloadAction<string>) => {
      const companyName = action.payload;
      if (state[companyName]) {
        state[companyName].userData = undefined;
        state[companyName].user = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalanceSummary.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (!state[companyName]) {
          state[companyName] = {
            companyName,
            country: "",
            balanceSummary: { data: null, loading: true, error: null },
          };
        } else {
          state[companyName].balanceSummary = {
            data: state[companyName].balanceSummary?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchBalanceSummary.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].balanceSummary = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchBalanceSummary.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].balanceSummary = {
            data: state[companyName].balanceSummary?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch balance summary",
          };
        }
      })
      .addCase(fetchAccountDetails.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].accountDetails = {
            data: state[companyName].accountDetails?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].accountDetails = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].accountDetails = {
            data: state[companyName].accountDetails?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch account details",
          };
        }
      })
      .addCase(fetchAccountsList.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].accountsList = {
            data: state[companyName].accountsList?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchAccountsList.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].accountsList = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchAccountsList.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].accountsList = {
            data: state[companyName].accountsList?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch accounts list",
          };
        }
      })
      .addCase(fetchAllPayments.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].allPayments = {
            data: state[companyName].allPayments?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].allPayments = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].allPayments = {
            data: state[companyName].allPayments?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch all payments",
          };
        }
      })
      .addCase(fetchAllInvoices.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].allInvoices = {
            data: state[companyName].allInvoices?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchAllInvoices.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].allInvoices = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchAllInvoices.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].allInvoices = {
            data: state[companyName].allInvoices?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch all invoices",
          };
        }
      })
      .addCase(fetchUserDetails.pending, (state, action) => {
        const { companyName } = action.meta.arg;
        if (!state[companyName]) {
          state[companyName] = {
            companyName,
            country: "",
            userDetails: { data: null, loading: true, error: null },
          };
        } else {
          state[companyName].userDetails = {
            data: state[companyName].userDetails?.data || null,
            loading: true,
            error: null,
          };
        }
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].userDetails = {
            data,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        const { companyName } = action.meta.arg;
        if (state[companyName]) {
          state[companyName].userDetails = {
            data: state[companyName].userDetails?.data || null,
            loading: false,
            error: action.error.message || "Failed to fetch user details",
          };
        }
      })
      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        const { companyName, data } = action.payload;
        if (state[companyName]) {
          state[companyName].user = data;
        }
      });
  },
});

export const {
  setCompanyData,
  setUserData,
  setUser,
  setAccount,
  clearCompanyData,
  clearAllCompanies,
  clearBalanceSummary,
  clearUserData,
} = companySlice.actions;

export { logoutCompany } from "@/utils/logout";

export const selectCompanyByName = (companyName: string) => (state: RootState) =>
  state.companies[companyName];
export const selectAllCompanies = (state: RootState) => state.companies;

export const selectBalanceSummary = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.balanceSummary?.data || null;
export const selectBalanceSummaryLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.balanceSummary?.loading || false;
export const selectBalanceSummaryError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.balanceSummary?.error || null;

export const selectUser = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.user || null;
export const selectUserData = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userData || null;
export const selectUserEmail = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userData?.email || null;
export const selectUserAccount = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userData?.account || null;
export const selectAccount = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.account || null;
export const selectAccountUniqueName = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.account?.uniqueName || null;
export const selectCompanyUniqueName = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.companyUniqueName || null;

export const selectAccountDetails = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountDetails?.data || null;
export const selectAccountDetailsLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountDetails?.loading || false;
export const selectAccountDetailsError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountDetails?.error || null;

export const selectAccountsList = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountsList?.data || null;
export const selectAccountsListLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountsList?.loading || false;
export const selectAccountsListError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.accountsList?.error || null;

export const selectAllPayments = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allPayments?.data || null;
export const selectAllPaymentsLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allPayments?.loading || false;
export const selectAllPaymentsError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allPayments?.error || null;

export const selectAllInvoices = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allInvoices?.data || null;
export const selectAllInvoicesLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allInvoices?.loading || false;
export const selectAllInvoicesError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.allInvoices?.error || null;

export const selectUserDetails = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userDetails?.data || null;
export const selectUserDetailsLoading = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userDetails?.loading || false;
export const selectUserDetailsError = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.userDetails?.error || null;

export default companySlice.reducer;
