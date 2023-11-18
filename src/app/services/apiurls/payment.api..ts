export const PAYMENT_API = {
    DOWNLOAD_VOUCHER: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64',
    GET_VOUCHER_DETAILS: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2',
    GET_COMMENTS: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2',
    ADD_COMMENTS: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2'
}
