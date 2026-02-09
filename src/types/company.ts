/** Company info from company-details API */
export interface CompanyInfo {
  name: string;
  uniqueName: string;
}

/** User company data from company-details API */
export interface UserCompanyData {
  name: string;
  id: string;
  email: string;
  companies: CompanyInfo[];
  currentCompany: CompanyInfo;
}

/** Response shape for get-company-details API */
export interface CompanyDetailsResponse {
  status: string;
  body: UserCompanyData[];
}
