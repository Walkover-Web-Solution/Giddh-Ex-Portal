const PROXY_URL = 'https://routes.msg91.com';
const GIDDH_URL = 'https://apitest.giddh.com';
export const API = {
  GET_PROXY: PROXY_URL + '/api/c/getDetails',
  VERIFY_PORTAL: GIDDH_URL + '/v2/verify-portal-user',
  SAVE_PORTAL_SESSION: GIDDH_URL + '/v2/portal-user/save-session',
  BALANCE_SUMMARY: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/balance-summary?voucherVersion=2',
  ACCOUNT_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/details',
  GET_ACCOUNTS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/contacts',
  VOUCHERS_WITH_LAST_PAYMENT_MODE: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy',
  LOGOUT_USER: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/destroy-session',
  RENEW_SESSION: GIDDH_URL + '/v2/portal-user/:userUniqueName/increment-session'
}
