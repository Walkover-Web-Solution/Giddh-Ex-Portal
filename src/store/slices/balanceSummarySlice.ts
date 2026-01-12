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

interface BalanceSummaryResponse {
  status: string;
  body: BalanceSummaryData;
}

interface BalanceSummaryState {
  data: BalanceSummaryData | null;
  loading: boolean;
  error: string | null;
}

const initialState: BalanceSummaryState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchBalanceSummary = createAsyncThunk(
  "balanceSummary/fetch",
  async ({ companyUniqueName, uniqueName }: { companyUniqueName: string; uniqueName: string }) => {
    const response = await apiClient.get<BalanceSummaryResponse>(
      `/portal/company/${companyUniqueName}/accounts/${uniqueName}/vouchers/balance-summary`,
      {
        params: {
          voucherVersion: 2,
        },
      }
    );
    return response.data.body;
  }
);

export const balanceSummarySlice = createSlice({
  name: "balanceSummary",
  initialState,
  reducers: {
    clearBalanceSummary: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalanceSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBalanceSummary.fulfilled,
        (state, action: PayloadAction<BalanceSummaryData>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchBalanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch balance summary";
      });
  },
});

export const { clearBalanceSummary } = balanceSummarySlice.actions;

export const selectBalanceSummary = (state: RootState) => state.balanceSummary.data;
export const selectBalanceSummaryLoading = (state: RootState) => state.balanceSummary.loading;
export const selectBalanceSummaryError = (state: RootState) => state.balanceSummary.error;

export default balanceSummarySlice.reducer;
