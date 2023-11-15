
const GIDDH_URL = 'https://apitest.giddh.com';
export const GENERAL_API = {
  VOUCHERS_WITH_LAST_PAYMENT_MODE: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy',
  GET_COMPANY_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/get-company-details'
}
