const COMMON_URL_PORTAL = 'portal/company/:companyUniqueName/accounts/';
export const API = {
    DOWNLOAD_VOUCHER: COMMON_URL_PORTAL + ':accountUniqueName/download-file?voucherVersion=2&fileType=base64',
    GET_VOUCHER_DETAILS: COMMON_URL_PORTAL + ':accountUniqueName/invoice-pay-request?voucherVersion=2&paymentMethod=:paymentMethod&paymentId=:paymentId',
    GET_COMMENTS: COMMON_URL_PORTAL + ':accountUniqueName/:voucherUniqueName/comments?voucherVersion=2',
    ADD_COMMENTS: COMMON_URL_PORTAL + ':accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2',
    PAY_VOUCHER: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/invoices/:paymentId/pay?voucherVersion=2',
    GET_VOUCHER_LIST: COMMON_URL_PORTAL + ':accountUniqueName/voucher/:voucherUniqueName?voucherVersion=2',
    GET_PAYMENT_METHODS: COMMON_URL_PORTAL + ':accountUniqueName/payment-methods?voucherVersion=2',
    PAYMENT_METHOD_LIST :COMMON_URL_PORTAL + ':accountUniqueName/payment-method'
}
