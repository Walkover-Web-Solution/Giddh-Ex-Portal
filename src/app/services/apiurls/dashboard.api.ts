
const GIDDH_URL = 'https://apitest.giddh.com';
export const API = {
  BALANCE_SUMMARY: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/balance-summary?voucherVersion=2',
  ACCOUNT_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/details',
  GET_ACCOUNTS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/contacts',
}
