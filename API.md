# Giddh-Ex-Portal API Documentation

## Overview

This document provides a complete reference of all API endpoints used across the Giddh-Ex-Portal application, organized by page/component.

---

## Table of Contents

1. [Authentication & Login](#1-authentication--login)
2. [Welcome/Dashboard Page](#2-welcomedashboard-page)
3. [Invoice Page](#3-invoice-page)
4. [Invoice Preview Page](#4-invoice-preview-page)
5. [Payment Page](#5-payment-page)
6. [Payment Preview Page](#6-payment-preview-page)
7. [Account Statement Page](#7-account-statement-page)
8. [Additional APIs](#8-additional-apis)
9. [Common Headers](#common-headers)
10. [Base URLs](#base-urls)
11. [Error Handling](#error-handling)

---

## 1. Authentication & Login

### **Login Page**

- **Route**: `/:companyDomainUniqueName/:region/login`
- **Purpose**: User authentication via proxy
- **APIs Used**: None directly (uses third-party proxy authentication script)

### **Auth Page**

**Route**: `/:companyDomainUniqueName/:region/auth`

#### 1.1 Get Proxy Details

- **Endpoint**: `api/c/getDetails`
- **Method**: `GET`
- **Headers**:
  - `proxy_auth_token`: string
- **Service**: `AuthService.authenticateProxy()`
- **Purpose**: Authenticate user with proxy token
- **Response**:
  ```typescript
  {
    status: 'success',
    data: [{
      email: string
    }]
  }
  ```

#### 1.2 Verify Portal User

- **Endpoint**: `v2/verify-portal-user`
- **Method**: `POST`
- **Headers**:
  - `proxy_auth_token`: string
- **Request Body**:
  ```typescript
  {
    emailId: string,
    subDomain: string
  }
  ```
- **Service**: `AuthService.verifyPortalLogin()`
- **Purpose**: Verify portal user credentials
- **Response**:
  ```typescript
  {
    status: 'success',
    body: Array<{
      account: {
        name: string,
        uniqueName: string
      },
      vendorContactUniqueName: string,
      companyUniqueName: string,
      session?: {
        id: string,
        createAt: string,
        expiresAt: string
      }
    }>
  }
  ```

#### 1.3 Save Portal Session

- **Endpoint**: `v2/portal-user/save-session`
- **Method**: `POST`
- **Request Body**:
  ```typescript
  {
    account: {
      name: string,
      uniqueName: string
    },
    vendorContactUniqueName: string,
    proxyAuthToken: string,
    subDomain: string
  }
  ```
- **Service**: `AuthService.savePortalUserSession()`
- **Purpose**: Save user session after authentication
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      companyUniqueName: string,
      session: {
        id: string,
        createAt: string,
        expiresAt: string
      }
    }
  }
  ```

---

## 2. Welcome/Dashboard Page

### **Welcome Page**

**Route**: `/:companyDomainUniqueName/:region/welcome`

#### 2.1 Get Balance Summary

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/balance-summary?voucherVersion=2`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `DashboardService.getBalanceSummary()`
- **Purpose**: Get user's balance summary including total due, overdue amounts
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      totalDue: number,
      totalOverdue: number,
      // ... other balance fields
    }
  }
  ```

#### 2.2 Get Account Details

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/details`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `DashboardService.getAccountDetails()`
- **Purpose**: Get account details including address, GST, contact information
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      name: string,
      email: string,
      countryName: string,
      addresses: Array<{
        gstNumber: string,
        address: string,
        stateCode: string,
        pincode: string,
        state: {
          stateGstCode: string,
          name: string,
          code: string
        }
      }>,
      attentionTo: string,
      mobileNo: string
    }
  }
  ```

#### 2.3 Get Accounts List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/contacts`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `DashboardService.getAccounts()`
- **Purpose**: Get list of associated accounts/contacts
- **Response**:
  ```typescript
  {
    status: 'success',
    body: Array<{
      name: string,
      uniqueName: string,
      // ... other account fields
    }>
  }
  ```

#### 2.4 Get Last Payment Made

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `type`: 'receipt'
  - `page`: number (default: 1)
  - `count`: number (default: 1)
  - `sort`: '' | 'asc' | 'desc'
  - `sortBy`: 'DESC'
- **Request Body**: Empty string or filter object
- **Service**: `WelcomeService.getLastPaymentMade()`
- **Purpose**: Get last payment/receipt made
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      items: Array<{
        uniqueName: string,
        voucherNumber: string,
        voucherDate: string,
        grandTotal: number,
        // ... other voucher fields
      }>,
      totalItems: number
    }
  }
  ```

#### 2.5 Get Company Details

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/get-company-details`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `WelcomeService.getCompanyDetails()`
- **Purpose**: Get company details
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      // Company details
    }
  }
  ```

#### 2.6 Get Portal User Details

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vendor-contact/:vendorUniqueName`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `vendorUniqueName`: string
- **Service**: `WelcomeService.getPortalUserDetails()`
- **Purpose**: Get portal user specific details
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      // Portal user details
    }
  }
  ```

---

## 3. Invoice Page

### **Invoice List Page**

**Route**: `/:companyDomainUniqueName/:region/invoice`

#### 3.1 Get Invoice List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `type`: 'sales'
  - `page`: number
  - `count`: number
  - `sort`: 'asc' | 'desc'
  - `sortBy`: 'grandTotal' | 'voucherDate'
- **Request Body**:
  ```typescript
  {
    companyUniqueName: string,
    accountUniqueName: string,
    balanceStatus: string[], // ['paid', 'partial-paid', 'unpaid', 'hold', 'cancel']
    uniqueNames: string[]
  }
  ```
- **Service**: `InvoiceService.getInvoiceList()`
- **Purpose**: Get paginated invoice list with filters
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      items: Array<{
        uniqueName: string,
        voucherNumber: string,
        voucherDate: string,
        grandTotal: number,
        balanceStatus: string,
        dueDate: string,
        paymentInfo: {
          paymentStatus: string
        }
      }>,
      totalItems: number,
      page: number,
      count: number
    }
  }
  ```

#### 3.2 Download Invoice

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Request Body**: `[voucherUniqueName]`
- **Service**: `InvoiceService.downloadVoucher()`
- **Purpose**: Download invoice PDF as base64
- **Response**:
  ```typescript
  {
    status: 'success',
    body: string // base64 encoded PDF
  }
  ```

#### 3.3 Get Payment Methods

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-methods?voucherVersion=2`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `InvoiceService.getPaymentMethods()`
- **Purpose**: Get available payment methods (Razorpay, PayPal, PayU)
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      RAZORPAY?: {
        // Razorpay configuration
      },
      PAYPAL?: {
        // PayPal configuration
      },
      PAYU?: {
        // PayU configuration
      }
    }
  }
  ```

#### 3.4 Get Voucher Count Page

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vendor-contact/:vendorUniqueName/get-page-count?page=:page`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `vendorUniqueName`: string
  - `page`: 'INVOICE' | 'PAYMENTS'
- **Service**: `CommonService.getVoucherCountPage()`
- **Purpose**: Get saved pagination count for user
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      countOfRecords: number
    }
  }
  ```

#### 3.5 Set Voucher Count Page

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vendor-contact/:vendorUniqueName/set-page-count?page=:page&count=:count`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `vendorUniqueName`: string
  - `page`: 'INVOICE' | 'PAYMENTS'
  - `count`: number
- **Service**: `CommonService.setVoucherCountPage()`
- **Purpose**: Save pagination count preference
- **Response**:
  ```typescript
  {
    status: "success";
  }
  ```

---

## 4. Invoice Preview Page

### **Invoice Preview Page**

**Route**: `/:companyDomainUniqueName/:region/invoice/preview?voucher=:voucherUniqueName`

#### 4.1 Get Voucher Details

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string (optional for non-logged-in users)
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Request Body**: `[voucherUniqueName]` or payment request object
- **Service**: `InvoiceService.getVoucherDetails()`
- **Purpose**: Get detailed voucher information with PDF content
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      vouchers: Array<{
        uniqueName: string,
        voucherNumber: string,
        content: string, // base64 PDF
        grandTotal: number,
        dueDate: string,
        // ... other voucher fields
      }>,
      paymentId: string
    }
  }
  ```

#### 4.2 Get Invoice Comments

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string (optional)
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `voucherUniqueName`: string
- **Service**: `InvoiceService.getInvoiceComments()`
- **Purpose**: Get all comments on an invoice
- **Response**:
  ```typescript
  {
    status: 'success',
    body: Array<{
      description: string,
      createdAt: string,
      createdBy: string
    }>
  }
  ```

#### 4.3 Add Comment

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `voucherUniqueName`: string
- **Request Body**:
  ```typescript
  {
    description: string;
  }
  ```
- **Service**: `InvoiceService.addComments()`
- **Purpose**: Add a comment to an invoice
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      // Comment details
    }
  }
  ```

#### 4.4 Download Voucher

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string (optional)
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Request Body**: `[voucherUniqueName]`
- **Service**: `InvoiceService.downloadVoucher()`
- **Purpose**: Download invoice PDF
- **Response**:
  ```typescript
  {
    status: 'success',
    body: string // base64 encoded PDF
  }
  ```

#### 4.5 Get Payment Methods

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-methods?voucherVersion=2`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string (optional)
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `InvoiceService.getPaymentMethods()`
- **Purpose**: Get available payment methods
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      RAZORPAY?: object,
      PAYPAL?: object,
      PAYU?: object
    }
  }
  ```

---

## 5. Payment Page

### **Payment List Page**

**Route**: `/:companyDomainUniqueName/:region/payment`

#### 5.1 Get Payment List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `type`: 'receipt'
  - `page`: number
  - `count`: number
  - `sort`: 'asc' | 'desc'
  - `sortBy`: 'grandTotal' | 'voucherDate'
- **Request Body**:
  ```typescript
  {
    companyUniqueName: string,
    accountUniqueName: string,
    balanceStatus: string[],
    uniqueNames: string[]
  }
  ```
- **Service**: `PaymentService.getInvoiceList()`
- **Purpose**: Get paginated payment/receipt list
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      items: Array<{
        uniqueName: string,
        voucherNumber: string,
        voucherDate: string,
        grandTotal: number,
        unusedAmount: number,
        paymentMode: string
      }>,
      totalItems: number
    }
  }
  ```

#### 5.2 Get Voucher Count Page

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vendor-contact/:vendorUniqueName/get-page-count?page=:page`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `vendorUniqueName`: string
  - `page`: 'PAYMENTS'
- **Service**: `CommonService.getVoucherCountPage()`
- **Purpose**: Get saved pagination count
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      countOfRecords: number
    }
  }
  ```

#### 5.3 Set Voucher Count Page

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vendor-contact/:vendorUniqueName/set-page-count?page=:page&count=:count`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `vendorUniqueName`: string
  - `page`: 'PAYMENTS'
  - `count`: number
- **Service**: `CommonService.setVoucherCountPage()`
- **Purpose**: Save pagination count preference
- **Response**:
  ```typescript
  {
    status: "success";
  }
  ```

---

## 6. Payment Preview Page

### **Payment Preview Page**

**Route**: `/:companyDomainUniqueName/:region/payment/preview?voucher=:voucherUniqueName`

#### 6.1 Download Voucher

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Request Body**: `[voucherUniqueName]`
- **Service**: `PaymentService.downloadVoucher()`
- **Purpose**: Download payment receipt PDF
- **Response**:
  ```typescript
  {
    status: 'success',
    body: string // base64 encoded PDF
  }
  ```

#### 6.2 Get Payment List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/get-all?voucherVersion=2&type=:type&page=:page&count=:count&sort=:sort&sortBy=:sortBy`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `type`: 'receipt'
- **Request Body**:
  ```typescript
  {
    companyUniqueName: string,
    accountUniqueName: string,
    uniqueNames: string
  }
  ```
- **Service**: `PaymentService.getInvoiceList()`
- **Purpose**: Get specific payment details
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      items: Array<{
        uniqueName: string,
        voucherNumber: string,
        grandTotal: number
      }>
    }
  }
  ```

#### 6.3 Get Voucher Details

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **Request Body**: `[voucherUniqueName]`
- **Service**: `PaymentService.getVoucherDetails()`
- **Purpose**: Get payment voucher details
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      // Voucher details
    }
  }
  ```

#### 6.4 Get Comments

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **Service**: `PaymentService.getInvoiceComments()`
- **Purpose**: Get payment voucher comments
- **Response**:
  ```typescript
  {
    status: 'success',
    body: Array<{
      description: string,
      createdAt: string
    }>
  }
  ```

#### 6.5 Add Comment

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2`
- **Method**: `POST`
- **Headers**:
  - `Session-id`: string
- **Request Body**: `string` (comment text)
- **Service**: `PaymentService.addComments()`
- **Purpose**: Add comment to payment voucher
- **Response**:
  ```typescript
  {
    status: "success";
  }
  ```

---

## 7. Account Statement Page

### **Account Statement Page**

**Route**: `/:companyDomainUniqueName/:region/account-statement`

#### 7.1 Get Account Statement List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/view-statement?page=:page&count=:count&from=:from&to=:to&sort=:sort`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `page`: number
  - `count`: number
  - `from`: date (YYYY-MM-DD format)
  - `to`: date (YYYY-MM-DD format)
  - `sort`: 'asc' | 'desc'
- **Service**: `AccountStatementService.getAccountStatementList()`
- **Purpose**: Get account statement transactions for a date range
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      transactionDetailList: Array<{
        date: string,
        particulars: string,
        voucherNumber: string,
        voucherType: string,
        debit: number,
        credit: number,
        closingBalance: number
      }>,
      totalItems: number,
      openingBalance: number,
      closingBalance: number
    }
  }
  ```

#### 7.2 Download Account Statement

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/export-account-statement?page=:page&count=:count&from=:from&to=:to&sort=:sort`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `page`: number
  - `count`: number
  - `from`: date (YYYY-MM-DD format)
  - `to`: date (YYYY-MM-DD format)
  - `sort`: 'asc' | 'desc'
- **Service**: `AccountStatementService.downloadAccountStatementList()`
- **Purpose**: Download account statement as file (Excel/PDF)
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      data: string, // base64 encoded file
      name: string, // filename
      type: string  // file MIME type
    }
  }
  ```

---

## 8. Additional APIs

### **Session Management**

#### 8.1 Logout User

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/destroy-session`
- **Method**: `DELETE`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `AuthService.logoutUser()`
- **Purpose**: Destroy user session and logout
- **Response**:
  ```typescript
  {
    status: "success";
  }
  ```

#### 8.2 Renew Session

- **Endpoint**: `v2/portal-user/:userUniqueName/increment-session`
- **Method**: `PUT`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `userUniqueName`: string
- **Request Body**: `null`
- **Service**: `AuthService.renewSession()`
- **Purpose**: Extend session expiry time
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      session: {
        id: string,
        expiresAt: string
      }
    }
  }
  ```

### **Invoice Payment**

#### 8.3 Pay Invoice

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/invoices/:paymentId/pay?voucherVersion=2`
- **Method**: `POST`
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `paymentId`: string
- **Request Body**: Payment request object
- **Service**: `InvoiceService.payInvoice()`
- **Purpose**: Process invoice payment through payment gateway
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      // Payment response from gateway
    }
  }
  ```

#### 8.4 Get Payment Method List

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-method`
- **Method**: `GET`
- **Headers**:
  - `Session-id`: string
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
- **Service**: `InvoiceService.getPaymentMethodList()`
- **Purpose**: Get list of payment methods
- **Response**:
  ```typescript
  {
    status: 'success',
    body: Array<{
      name: string,
      type: string
    }>
  }
  ```

#### 8.5 Get Voucher Without Session

- **Endpoint**: `portal/company/:companyUniqueName/accounts/:accountUniqueName/voucher/:voucherUniqueName?voucherVersion=2`
- **Method**: `GET`
- **URL Parameters**:
  - `companyUniqueName`: string
  - `accountUniqueName`: string
  - `voucherUniqueName`: string
- **Service**: `InvoiceService.getVoucherDetailsFromWithoutSession()`
- **Purpose**: Get voucher details for non-logged-in users (public access)
- **Response**:
  ```typescript
  {
    status: 'success',
    body: {
      uniqueName: string,
      voucherNumber: string,
      grandTotal: number,
      // ... other voucher fields
    }
  }
  ```

---

## Common Headers

All authenticated API calls include the following headers:

| Header             | Value                                | Required                       |
| ------------------ | ------------------------------------ | ------------------------------ |
| `Session-id`       | User session ID obtained after login | Yes (for authenticated routes) |
| `Content-Type`     | `application/json`                   | Yes                            |
| `Accept`           | `application/json`                   | Yes                            |
| `cache-control`    | `no-cache`                           | Yes                            |
| `proxy_auth_token` | Proxy authentication token           | Only for proxy authentication  |

### Header Configuration

Headers are automatically configured by the `HttpWrapperService.prepareOptions()` method:

- Default `Content-Type`: `application/json`
- Default `Accept`: `application/json`
- `cache-control`: `no-cache` (added to all requests)
- For `multipart/form-data`, `Content-Type` is removed to allow browser to set it with boundary
- For `application/x-www-form-urlencoded`, `cache-control` and `Session-Id` are removed

---

## Base URLs

The application supports multiple regions with different base URLs:

### Region Configuration

- **India (Default)**: Configured in `environment.apiUrl`
- **UK**: Configured in `environment.ukApiUrl`

### Region Selection

- Region is determined by the `country-region` value in localStorage
- Set via URL parameter: `/:companyDomainUniqueName/:region/...`
- Supported regions: `in` (India), `uk` (United Kingdom)

### API Service

The `ApiService` manages the base URL based on the selected region:

```typescript
// Get current API URL
apiService.getApiUrl(): string

// Set API URL based on region
apiService.setApiUrl(region: 'in' | 'uk'): void
```

### Proxy URL

Separate proxy URL configured in `environment.proxyUrl` for authentication endpoints.

---

## Error Handling

### Response Structure

All API responses follow a consistent structure:

```typescript
interface BaseResponse<T, E> {
  status: "success" | "error";
  message?: string;
  body?: T; // Response data on success
  data?: E; // Additional data
  queryString?: any; // Query parameters used
  request?: any; // Request payload sent
}
```

### Success Response

```typescript
{
  status: 'success',
  body: {
    // Response data
  },
  message: 'Operation completed successfully'
}
```

### Error Response

```typescript
{
  status: 'error',
  message: 'Error description',
  data: {
    // Error details
  }
}
```

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized (invalid or expired session)
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

### Error Handling Service

The `PortalErrorHandler` service (`catch-manager/catchmanger`) handles all API errors:

- Catches HTTP errors
- Formats error messages
- Returns observable with error response
- Used in all service methods via `.pipe(catchError())`

### Common Error Scenarios

#### Session Expired

```typescript
{
  status: 'error',
  message: 'Session expired. Please login again.',
  code: 'SESSION_EXPIRED'
}
```

#### Invalid Parameters

```typescript
{
  status: 'error',
  message: 'Invalid request parameters',
  code: 'INVALID_PARAMS'
}
```

#### Permission Denied

```typescript
{
  status: 'error',
  message: 'You do not have permission to access this resource',
  code: 'PERMISSION_DENIED'
}
```

---

## API Constants

### Voucher Version

All voucher-related APIs use `voucherVersion=2` query parameter.

### Pagination

- **Default Page**: 1
- **Default Count**: Defined in `PAGINATION_LIMIT` constant
- **Page Size Options**: Defined in `PAGE_SIZE_OPTIONS` constant

### Voucher Types

- **Sales**: `type=sales` (Invoices)
- **Receipt**: `type=receipt` (Payments)

### Balance Status Filters

- `paid`: Fully paid invoices
- `partial-paid`: Partially paid invoices
- `unpaid`: Unpaid invoices
- `hold`: Invoices on hold
- `cancel`: Cancelled invoices

### Sort Options

- **Sort By**: `grandTotal`, `voucherDate`, `Date`
- **Sort Direction**: `asc`, `desc`, `ASC`, `DESC`

### Payment Methods

- `RAZORPAY`: Razorpay payment gateway
- `PAYPAL`: PayPal payment gateway
- `PAYU`: PayU payment gateway

### Page Types (for pagination preferences)

- `INVOICE`: Invoice page
- `PAYMENTS`: Payments page

---

## Notes

1. **URL Encoding**: All URL parameters (companyUniqueName, accountUniqueName, etc.) are encoded using `encodeURIComponent()` before making API calls.

2. **Session Management**: Session ID is stored in the application state and automatically included in headers for authenticated requests.

3. **File Downloads**: PDF and Excel files are returned as base64 encoded strings and converted to Blob objects for download.

4. **Date Format**: Dates are formatted using `GIDDH_DATE_FORMAT` (YYYY-MM-DD) for API requests.

5. **Proxy Authentication**: Initial authentication uses a separate proxy service with `proxy_auth_token` header.

6. **Observable Pattern**: All API calls return RxJS Observables and use operators like `map()`, `catchError()`, and `takeUntil()` for stream management.

7. **Loading States**: Components manage loading states (`isLoading`, `initialLoading`) to show/hide loaders during API calls.

---

## Service Files Reference

- **AuthService**: `src/app/services/auth.service.ts`
- **DashboardService**: `src/app/services/dashboard.service..ts`
- **WelcomeService**: `src/app/services/welcome.service.ts`
- **InvoiceService**: `src/app/services/invoice.service.ts`
- **PaymentService**: `src/app/services/payment.service..ts`
- **AccountStatementService**: `src/app/services/account-statement.service.ts`
- **CommonService**: `src/app/services/common.service.ts`
- **HttpWrapperService**: `src/app/services/http-wrapper.service.ts`
- **ApiService**: `src/app/services/api.service.ts`

## API URL Configuration Files

- **Auth APIs**: `src/app/services/apiurls/auth.api.ts`
- **Dashboard APIs**: `src/app/services/apiurls/dashboard.api.ts`
- **Welcome APIs**: `src/app/services/apiurls/welcome.api.ts`
- **Invoice APIs**: `src/app/services/apiurls/invoice.api.ts`
- **Payment APIs**: `src/app/services/apiurls/payment.api.ts`
- **Account Statement APIs**: `src/app/services/apiurls/account-statement.api.ts`
- **Common APIs**: `src/app/services/apiurls/common.api.ts`

---

**Last Updated**: January 3, 2026  
**Version**: 1.0  
**Application**: Giddh-Ex-Portal
