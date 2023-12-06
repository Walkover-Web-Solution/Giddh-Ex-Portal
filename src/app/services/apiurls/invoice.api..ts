const COMMON_URL_PORTAL = 'portal/company/:companyUniqueName/accounts/';
export const API = {
    DOWNLOAD_VOUCHER: COMMON_URL_PORTAL+ ':accountUniqueName/download-file?voucherVersion=2&fileType=base64',
    GET_VOUCHER_DETAILS: COMMON_URL_PORTAL + ':accountUniqueName/invoice-pay-request?voucherVersion=2',
    GET_COMMENTS: COMMON_URL_PORTAL+ ':accountUniqueName/:voucherUniqueName/comments?voucherVersion=2',
    ADD_COMMENTS: COMMON_URL_PORTAL+ ':accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2',
    PAY_VOUCHER: 'company/:companyUniqueName/invoices/:invoiceNumber/pay?voucherVersion=2',
    GET_VOUCHER_LIST: COMMON_URL_PORTAL + ':accountUniqueName/voucher/:voucherUniqueName?voucherVersion=2'
  }
