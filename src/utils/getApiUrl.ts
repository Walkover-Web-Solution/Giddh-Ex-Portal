import { store } from "@/store/store";

export default function getApiUrl(): string {
  const state = store.getState();
  const allCompanies = state.companies;
  const country = Object.values(allCompanies)[0]?.country;

  if (country === "uk") {
    return process.env.NEXT_PUBLIC_API_URL_UK || process.env.NEXT_PUBLIC_API_URL || "";
  }

  return process.env.NEXT_PUBLIC_API_URL || "";
}
