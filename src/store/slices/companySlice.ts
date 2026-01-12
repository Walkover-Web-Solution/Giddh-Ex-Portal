import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";
import type { RootState } from "../store";

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

interface UserAccount {
  name: string;
  uniqueName: string;
}

interface UserData {
  email: string;
  account: UserAccount;
  vendorContactUniqueName: string;
}

interface CompanyInfo {
  companyName: string;
  country: string;
  companyUniqueName?: string;
  user?: UserData;
  balanceSummary?: BalanceSummaryState;
}

interface CompanyState {
  [companyName: string]: CompanyInfo;
}

const initialState: CompanyState = {};

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
        state[companyName].user = userData;
        state[companyName].companyUniqueName = companyUniqueName;
      } else {
        state[companyName] = {
          companyName,
          country: "",
          companyUniqueName,
          user: userData,
        };
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
      });
  },
});

export const {
  setCompanyData,
  setUserData,
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

export const selectUserData = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.user || null;
export const selectUserEmail = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.user?.email || null;
export const selectUserAccount = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.user?.account || null;
export const selectCompanyUniqueName = (companyName: string) => (state: RootState) =>
  state.companies[companyName]?.companyUniqueName || null;

export default companySlice.reducer;
