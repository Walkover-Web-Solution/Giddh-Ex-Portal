const GIDDH_URL = 'https://apitest.giddh.com';
export const PAYMENT_API = {
  DOWNLOAD_VOUCHER: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64',
  GET_VOUCHER_DETAILS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2',
  GET_COMMENTS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2',
  ADD_COMMENTS: GIDDH_URL + '/portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2'
}
