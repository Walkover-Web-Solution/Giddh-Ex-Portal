const SHOPIFY_URL = 'https://ecommerceapitest.giddh.com';

export const SHOPIFY_API = {
  AUTH_URL: SHOPIFY_URL + '/app/:shop/install',
  CONNECT_TO_GIDDH: SHOPIFY_URL + '/app/:companyUniqueName/:host/connect',
  GET_INVOICE_SETTINGS: SHOPIFY_URL + '/:shop/:host/settings',
  SYNC_ORDER: SHOPIFY_URL + '/:shop/:host/order/sync/:orderId',
  WAREHOUSE_LINK_LOCATION: SHOPIFY_URL + '/:shop/:host/warehouse'
}
