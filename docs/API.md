# API Documentation

## Overview

The Giddh Portal integrates with backend APIs to manage invoices, payments, account statements, and user data. All API utilities are located in `src/utils/` and use Axios for HTTP requests.

## API Client Configuration

### File: `src/lib/apiClient.ts`

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.giddh.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding session token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Session-id"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
```

## Authentication

### Session-Based Authentication

All authenticated requests require a `Session-id` header:

```typescript
headers: {
  "Session-id": "your-session-token"
}
```

**Token Storage:** localStorage key `"token"`

## API Utilities

### 1. Invoice Preview (`src/utils/invoicePreview.ts`)

#### Get Voucher Details

```typescript
getVoucherDetails(request: InvoicePreviewRequest): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`

**Request:**

```typescript
interface InvoicePreviewRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  voucherUniqueName: string;
  sessionId?: string;
}
```

**Body:** `[voucherUniqueName]` (array)

**Response:**

```typescript
{
  status: "success",
  body: {
    vouchers: [{
      uniqueName: string;
      number: string;
      amount: number;
      dueDate: string;
      canPay: boolean;
      message?: string;
      content: string; // base64 PDF
      contentType: string;
    }];
    currency: {
      code: string;
      symbol: string;
    };
  }
}
```

#### Get Invoice Comments

```typescript
getInvoiceComments(request: InvoicePreviewRequest): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: [{
    id: string;
    description: string;
    userName: string;
    dateString: string;
  }]
}
```

#### Add Comment

```typescript
addComment(request: InvoicePreviewRequest, commentText: string): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2`

**Body:**

```typescript
{
  description: string;
}
```

#### Download Voucher

```typescript
downloadVoucher(request: InvoicePreviewRequest): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`

**Body:** `[voucherUniqueName]`

**Response:**

```typescript
{
  status: "success",
  body: string; // base64 PDF content
}
```

---

### 2. Payment (`src/utils/payment.ts`)

#### Get Payment Methods

```typescript
getPaymentMethods(request: PaymentRequest): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-methods?voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: {
    RAZORPAY?: {
      key: string;
      enabled: boolean;
    };
    PAYPAL?: {
      businessEmail: string;
      enabled: boolean;
    };
    PAYU?: {
      merchantKey: string;
      enabled: boolean;
    };
  }
}
```

#### Get Voucher Payment Details

```typescript
getVoucherPaymentDetails(request: VoucherPaymentRequest): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`

**Request:**

```typescript
interface VoucherPaymentRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  paymentGatewayType: "RAZORPAY" | "PAYPAL" | "PAYU";
  voucherUniqueNames: string[];
  name?: string; // Required for PayU
  email?: string; // Required for PayU
  contactNo?: string; // Required for PayU
  sessionId?: string;
}
```

**Response:**

```typescript
{
  status: "success",
  body: {
    paymentId: string;
    orderId: string;
    paymentKey: string;
    paymentGatewayType: string;
    totalAmount: number;
    currency: {
      code: string;
      symbol: string;
    };
    vouchers: Array<{
      uniqueName: string;
      number: string;
      amount: number;
      status: string;
      canPay: boolean;
    }>;
    company: {
      uniqueName: string;
      name: string;
    };
    htmlString?: string; // For PayU
  }
}
```

#### Update Payment Status

```typescript
updatePaymentStatus(request: PaymentUpdateRequest, payload: PaymentUpdatePayload): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/invoices/:paymentId/pay?voucherVersion=2`

**Payload:**

```typescript
{
  paymentGatewayType: "RAZORPAY" | "PAYPAL" | "PAYU";
  razorPayPaymentId?: string;
  totalAmount?: number;
  date?: string; // DD-MM-YYYY
}
```

---

### 3. Payment Preview (`src/utils/paymentPreview.ts`)

#### Download Payment Voucher

```typescript
downloadPaymentVoucher(request: PaymentPreviewRequest): Promise<Response>
```

**Endpoint:** `POST /portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`

**Body:** `[voucherUniqueName]`

**Response:**

```typescript
{
  status: "success",
  body: string; // base64 PDF content
}
```

#### Get Payment List

```typescript
getPaymentList(request: PaymentPreviewRequest): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers?type=receipt&page=1&count=10&uniqueNames=:voucherUniqueName&voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: {
    items: [{
      uniqueName: string;
      voucherNumber: string;
      voucherDate: string;
      grandTotal: {
        amountForAccount: number;
      };
      accountCurrencySymbol: string;
      paymentMode: {
        name: string;
      };
    }];
    totalItems: number;
  }
}
```

---

### 4. Account Statement (`src/utils/accountStatement.ts`)

#### Get Account Statement

```typescript
getAccountStatement(request: AccountStatementRequest): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/view-statement?page=:page&count=:count&from=:from&to=:to&sort=:sort`

**Request:**

```typescript
interface AccountStatementRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  page: number;
  count: number;
  from: string; // DD-MM-YYYY
  to: string; // DD-MM-YYYY
  sort: "asc" | "desc";
}
```

**Response:**

```typescript
{
  status: "success",
  body: {
    accountName: string;
    companyName: string;
    fromDate: string;
    toDate: string;
    accountAddress: {
      address: string;
      stateName: string;
      countryName: string;
      pinCode: string;
      taxType: string;
      taxNumber: string;
      email: string;
      mobileNo: string;
      currency: {
        code: string;
        symbol: string;
      };
    };
    companyGstAddress: {
      address: string;
      stateName: string;
      countryName: string;
      pinCode: string;
      taxType: string;
      taxNumber: string;
      email: string;
      mobileNo: string;
    };
    accountSummary: {
      openingBalance: {
        amount: number;
        type: "DEBIT" | "CREDIT";
      };
      debitTotal: number;
      creditTotal: number;
      closingBalance: {
        amount: number;
        type: "DEBIT" | "CREDIT";
      };
    };
    transactionDetailList: [{
      date: string;
      voucherType: string;
      voucherNumber: string;
      voucherAmount: {
        amount: number;
        type: "DEBIT" | "CREDIT";
      };
      closingBalance: {
        amount: number;
        type: "DEBIT" | "CREDIT";
      };
    }];
    totalItems: number;
  }
}
```

#### Download Account Statement

```typescript
downloadAccountStatement(request: AccountStatementRequest): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/export-account-statement?page=:page&count=:count&from=:from&to=:to&sort=:sort`

**Response:**

```typescript
{
  status: "success",
  body: {
    data: string; // base64 PDF content
    type: string; // "application/pdf"
    name: string; // filename
  }
}
```

---

### 5. Company Details (`src/lib/api.ts`)

#### Get Company Details

```typescript
getCompanyDetails(companyUniqueName: string, accountUniqueName: string): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/company-details?voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: [{
    companyName: string;
    companyUniqueName: string;
    country: string;
    countryName: string;
    contactNo: string;
    addresses: [{
      address: string;
      stateName: string;
      countryName: string;
      pinCode: string;
      taxType: string;
      taxNumber: string;
    }];
  }]
}
```

#### Get Balance Summary

```typescript
getBalanceSummary(companyUniqueName: string, accountUniqueName: string): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/balance-summary?voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: {
    totalDue: number;
    totalOverdue: number;
    totalPaid: number;
    currencySymbol: string;
  }
}
```

#### Get Account Details

```typescript
getAccountDetails(companyUniqueName: string, accountUniqueName: string): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/account-details?voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: {
    name: string;
    uniqueName: string;
    email: string;
    mobileNo: string;
    addresses: [{
      address: string;
      stateName: string;
      countryName: string;
      pinCode: string;
    }];
  }
}
```

#### Get All Invoices

```typescript
getAllInvoices(params: InvoiceParams): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/invoices?page=:page&count=:count&sort=:sort&sortBy=:sortBy&voucherVersion=2`

**Query Parameters:**

- `page`: number (1-indexed)
- `count`: number (items per page)
- `sort`: "asc" | "desc"
- `sortBy`: "voucherDate" | "grandTotal" | "voucherNumber"

**Response:**

```typescript
{
  status: "success",
  body: {
    items: [{
      uniqueName: string;
      voucherNumber: string;
      voucherDate: string;
      dueDate: string;
      grandTotal: {
        amountForAccount: number;
      };
      balanceDue: {
        amountForAccount: number;
      };
      balanceStatus: string;
      companyCurrencySymbol: string;
    }];
    page: number;
    count: number;
    totalPages: number;
    totalItems: number;
  }
}
```

#### Get All Payments

```typescript
getAllPayments(companyUniqueName: string, accountUniqueName: string): Promise<Response>
```

**Endpoint:** `GET /portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers?type=receipt&voucherVersion=2`

**Response:**

```typescript
{
  status: "success",
  body: {
    items: [{
      uniqueName: string;
      voucherNumber: string;
      voucherDate: string;
      grandTotal: {
        amountForAccount: number;
      };
      companyCurrencySymbol: string;
      account: {
        name: string;
        uniqueName: string;
      };
      paymentMode: {
        name: string;
      };
    }];
  }
}
```

---

## Common Patterns

### 1. Error Handling

```typescript
try {
  const response = await apiFunction(params);
  if (response.status === "success") {
    return response.body;
  } else {
    throw new Error("API request failed");
  }
} catch (error) {
  console.error("Error:", error);
  throw error;
}
```

### 2. Session Header

```typescript
const headers: Record<string, string> = {};
if (sessionId) {
  headers["Session-id"] = sessionId;
}

const response = await apiClient.get(url, { headers });
```

### 3. Base64 to Blob Conversion

```typescript
export function base64ToBlob(
  base64Data: string,
  contentType: string = "application/pdf",
  sliceSize: number = 512
): Blob {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
```

### 4. Date Formatting

```typescript
// Convert Date to DD-MM-YYYY format
export function convertDateToAPIFormat(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
```

### 5. URL Encoding

```typescript
const url = `/portal/company/${encodeURIComponent(companyUniqueName)}/accounts/${encodeURIComponent(accountUniqueName)}/endpoint`;
```

## API Response Standards

### Success Response

```typescript
{
  status: "success",
  body: { ... }
}
```

### Error Response

```typescript
{
  status: "error",
  message: "Error description",
  code?: string
}
```

## Query Parameters

### Common Query Parameters

| Parameter        | Type   | Description             | Example             |
| ---------------- | ------ | ----------------------- | ------------------- |
| `voucherVersion` | number | API version             | `2`                 |
| `page`           | number | Page number (1-indexed) | `1`                 |
| `count`          | number | Items per page          | `10`                |
| `sort`           | string | Sort direction          | `"asc"` or `"desc"` |
| `sortBy`         | string | Sort field              | `"voucherDate"`     |
| `from`           | string | Start date (DD-MM-YYYY) | `"01-01-2026"`      |
| `to`             | string | End date (DD-MM-YYYY)   | `"31-01-2026"`      |
| `type`           | string | Voucher type            | `"receipt"`         |
| `fileType`       | string | File format             | `"base64"`          |

## Rate Limiting

- No specific rate limits documented
- Use debouncing for search/filter operations
- Cache responses in Redux when possible

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://api.giddh.com
```

## Testing APIs

### Using cURL

```bash
curl -X GET \
  'https://api.giddh.com/portal/company/COMPANY/accounts/ACCOUNT/invoices?voucherVersion=2' \
  -H 'Session-id: YOUR_TOKEN'
```

### Using Postman

1. Set base URL: `https://api.giddh.com`
2. Add header: `Session-id: YOUR_TOKEN`
3. Set endpoint path
4. Send request

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const response = await apiCall();
  // Handle success
} catch (error) {
  console.error("API Error:", error);
  // Show user-friendly error
}
```

### 2. Use TypeScript Interfaces

```typescript
interface ApiResponse<T> {
  status: string;
  body: T;
}

async function fetchData(): Promise<ApiResponse<DataType>> {
  const response = await apiClient.get<ApiResponse<DataType>>(url);
  return response.data;
}
```

### 3. Centralize API Calls

Keep all API calls in `src/utils/` files, not in components.

### 4. Cache Responses

Use Redux to cache API responses and avoid redundant calls.

### 5. Handle Loading States

Always show loading indicators during API calls.

### 6. Validate Responses

```typescript
if (response.status === "success" && response.body) {
  // Process data
} else {
  // Handle error
}
```

## Security Considerations

### 1. Never Expose Tokens

- Store tokens in localStorage, not in code
- Never commit tokens to version control
- Use environment variables for API keys

### 2. Sanitize User Input

```typescript
const sanitizedInput = encodeURIComponent(userInput);
```

### 3. HTTPS Only

All API calls must use HTTPS in production.

### 4. Session Expiry

Handle 401 responses by redirecting to login:

```typescript
if (error.response?.status === 401) {
  localStorage.removeItem("token");
  router.push("/auth");
}
```

## Troubleshooting

### Common Issues

**1. 401 Unauthorized**

- Check if session token is valid
- Verify Session-id header is being sent
- Re-authenticate if needed

**2. CORS Errors**

- Ensure API server allows your domain
- Check if credentials are being sent correctly

**3. Network Errors**

- Check internet connection
- Verify API base URL is correct
- Check if API server is running

**4. Timeout Errors**

- Increase timeout in axios config
- Check if API endpoint is slow
- Implement retry logic

### Debug Mode

```typescript
// Enable axios debug logging
apiClient.interceptors.request.use((request) => {
  console.log("Starting Request", request);
  return request;
});

apiClient.interceptors.response.use((response) => {
  console.log("Response:", response);
  return response;
});
```
