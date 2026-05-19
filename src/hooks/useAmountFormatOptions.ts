import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectCompanyBalanceDisplayFormat,
  selectCompanyDecimalPlaces,
} from "@/store/slices/companySlice";
import { getLocaleFromDisplayFormat } from "@/utils/numberFormat";

export interface AmountFormatOptions {
  decimals: number;
  locale: string;
}

export function useAmountFormatOptions(companyName: string): AmountFormatOptions {
  const decimals = useAppSelector(selectCompanyDecimalPlaces(companyName));
  const balanceDisplayFormat = useAppSelector(selectCompanyBalanceDisplayFormat(companyName));
  const locale = useMemo(
    () => getLocaleFromDisplayFormat(balanceDisplayFormat),
    [balanceDisplayFormat]
  );

  return useMemo(() => ({ decimals, locale }), [decimals, locale]);
}
