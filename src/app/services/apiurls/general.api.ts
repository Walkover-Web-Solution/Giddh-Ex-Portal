
const GIDDH_URL = 'https://apitest.giddh.com';
export const API = {
  VOUCHERS_WITH_LAST_PAYMENT_MODE: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy',
  GET_COMPANY_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/get-company-details',
  DOWNLOAD_VOUCHER: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64',
  GET_VOUCHER_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2',
}
