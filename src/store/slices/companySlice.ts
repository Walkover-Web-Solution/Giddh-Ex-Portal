import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface CompanyInfo {
  companyName: string;
  country: string;
}

interface CompanyState {
  [companyName: string]: CompanyInfo;
}

const initialState: CompanyState = {};

export const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setCompanyData: (state, action: PayloadAction<{ companyName: string; country: string }>) => {
      const { companyName, country } = action.payload;
      state[companyName] = { companyName, country };
    },
    clearCompanyData: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
    clearAllCompanies: () => initialState,
  },
});

export const { setCompanyData, clearCompanyData, clearAllCompanies } = companySlice.actions;

export const selectCompanyByName = (companyName: string) => (state: RootState) =>
  state.companies[companyName];
export const selectAllCompanies = (state: RootState) => state.companies;

export default companySlice.reducer;
