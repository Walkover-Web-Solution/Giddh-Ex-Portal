export const API = {
    GET_PROXY: 'api/c/getDetails',
    VERIFY_PORTAL: 'v2/verify-portal-user',
    SAVE_PORTAL_SESSION: 'v2/portal-user/save-session',
    BALANCE_SUMMARY: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/balance-summary?voucherVersion=2',
    ACCOUNT_DETAILS: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/details',
    GET_ACCOUNTS: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/contacts',
    VOUCHERS_WITH_LAST_PAYMENT_MODE: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy',
    LOGOUT_USER: 'portal/company/:companyUniqueName/accounts/:accountUniqueName/destroy-session',
    RENEW_SESSION: 'v2/portal-user/:userUniqueName/increment-session'
}
