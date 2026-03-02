/** A single address entry from get-company-details API */
export interface CompanyAddress {
  name?: string;
  address?: string;
  isDefault?: boolean;
  stateName?: string;
  uniqueName?: string;
  pincode?: string;
  taxType?: string;
  stateCode?: string;
  taxNumber?: string;
}

/** Company data returned by get-company-details API */
export interface CompanyData {
  name: string;
  uniqueName: string;
  address?: string;
  country?: string;
  addresses?: CompanyAddress[];
  portalDomain?: string;
  contactNo?: string;
  baseCurrency?: string;
  headQuarterAlias?: string;
  razorpayIntegrated?: boolean;
}

/** Response shape for get-company-details API */
export interface CompanyDetailsResponse {
  status: string;
  body: CompanyData;
}
