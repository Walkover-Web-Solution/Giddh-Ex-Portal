# Pay Now Functionality Documentation

## Overview

The Pay Now functionality enables vendors to make payments for invoices through integrated payment gateways (Razorpay, PayPal, PayU). This is a reusable component used across multiple pages in the application.

**Component**: `pay-now` (Standalone Component)

**File**: `src/app/shared/pay-now/pay-now.component.ts`

**Template**: `src/app/shared/pay-now/pay-now.component.html`

---

## Table of Contents

1. [Supported Payment Gateways](#supported-payment-gateways)
2. [Component Usage](#component-usage)
3. [Payment Flow](#payment-flow)
4. [API Integration](#api-integration)
5. [Payment Gateway Integration](#payment-gateway-integration)
6. [Component Inputs & Outputs](#component-inputs--outputs)
7. [Payment Methods Detection](#payment-methods-detection)
8. [User Scenarios](#user-scenarios)
9. [Error Handling](#error-handling)
10. [Security Considerations](#security-considerations)

---

## Supported Payment Gateways

### Payment Methods Enum

```typescript
export enum PAYMENT_METHODS_ENUM {
  RAZORPAY = "RAZORPAY",
  PAYPAL = "PAYPAL",
  PAYU = "PAYU",
}
```

### Gateway Comparison

| Gateway      | Region | Integration Type        | User Input Required        |
| ------------ | ------ | ----------------------- | -------------------------- |
| **Razorpay** | India  | Modal/SDK               | No (auto-filled)           |
| **PayPal**   | Global | Form Redirect           | No (auto-filled)           |
| **PayU**     | India  | HTML Form in New Window | Yes (Name, Email, Contact) |

---

## Component Usage

### Basic Usage (Invoice List Page)

```html
<pay-now
  [buttonText]="'Pay Now'"
  [storeData]="storeData"
  [region]="region"
  [selection]="selection"
  [paymentMethods]="paymentMethods"
  [paymentMethodValue]="paymentMethodValue?.value"
  [invoiceGetAll]="true"
  [returnInvoiceGetAll]="returnInvoiceGetAll"
  (invoiceGetAllSuccess)="onPaymentSuccess()"
>
</pay-now>
```

### Usage in Invoice Preview Page

```html
<pay-now
  [buttonText]="'Pay Now'"
  [queryParams]="queryParams"
  [paymentDetails]="paymentDetails"
  [paymentMethods]="paymentMethods"
  [storeData]="storeData"
  [region]="region"
  [paymentMethodValue]="paymentMethodValue?.value"
  [invoicePreview]="true"
  (invoicePreviewSuccess)="onInvoicePreviewSuccess()"
  [returnInvoicePreview]="returnInvoicePreview"
>
</pay-now>
```

### Usage in Invoice Pay Page

```html
<pay-now
  [buttonText]="'Pay Now'"
  [urlParams]="urlParams"
  [queryParams]="queryParams"
  [paymentDetails]="paymentDetails"
  [paymentMethods]="paymentMethods"
  [storeData]="storeData"
  [region]="region"
  [paymentMethodValue]="paymentMethodValue?.value"
  [invoicePay]="true"
  (invoicePaySuccess)="onPaymentSuccess()"
  [returnInvoicePay]="returnInvoicePay"
>
</pay-now>
```

---

## Payment Flow

### High-Level Flow Diagram

```
User Clicks "Pay Now"
        │
        ▼
┌───────────────────────────────────────┐
│ Check Payment Context                 │
│ - Invoice Preview?                    │
│ - Multiple Vouchers Selected?         │
│ - Single Voucher?                     │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Validate Voucher Status               │
│ - Check if already PAID               │
│ - Check if payment PENDING            │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Check Payment Methods Count           │
│ - Multiple methods? → Redirect to     │
│   invoice-pay page for selection      │
│ - Single method? → Proceed directly   │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ PayU Specific Check                   │
│ - User details available?             │
│   Yes → Proceed                       │
│   No → Show PayU form modal           │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Get Voucher Details API               │
│ POST invoice-pay-request              │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Initialize Payment Gateway            │
│ - Razorpay → Open modal               │
│ - PayPal → Submit form                │
│ - PayU → Open new window              │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Payment Gateway Processing            │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Handle Payment Response               │
│ - Success → Update payment status     │
│ - Failure → Show error message        │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ Redirect to Return URL                │
│ - Emit success event                  │
│ - Navigate back to source page        │
└───────────────────────────────────────┘
```

---

## API Integration

### API #1: Get Payment Methods

**Endpoint**: `GET portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-methods?voucherVersion=2`

**Purpose**: Detect which payment gateways are configured for the company

**Headers**:

```json
{
  "Session-id": "session_id_string"
}
```

**Response**:

```json
{
  "status": "success",
  "body": {
    "RAZORPAY": {
      "key": "rzp_live_xxxxx",
      "enabled": true
    },
    "PAYPAL": {
      "businessEmail": "merchant@example.com",
      "enabled": true
    },
    "PAYU": {
      "merchantKey": "xxxxx",
      "enabled": true
    }
  }
}
```

**Service Method**:

```typescript
public getPaymentMethods(model: any): Observable<BaseResponse<any, any>> {
  let args: any = { headers: {} };
  args.headers['Session-id'] = model?.sessionId ?? '';
  return this.http.get(
    this.apiUrl + API.GET_PAYMENT_METHODS
      .replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))
      .replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName)),
    '', args
  );
}
```

---

### API #2: Get Voucher Details for Payment

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`

**Purpose**: Get payment details including gateway-specific information (order ID, payment key, etc.)

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body** (Razorpay/PayPal):

```json
{
  "paymentGatewayType": "RAZORPAY",
  "voucherUniqueNames": ["voucher123", "voucher456"]
}
```

**Request Body** (PayU):

```json
{
  "paymentGatewayType": "PAYU",
  "voucherUniqueNames": ["voucher123"],
  "name": "John Doe",
  "email": "john@example.com",
  "contactNo": "9876543210"
}
```

**Response**:

```json
{
  "status": "success",
  "body": {
    "paymentId": "PAY_123456",
    "orderId": "order_xyz789",
    "paymentKey": "rzp_live_xxxxx",
    "paymentGatewayType": "RAZORPAY",
    "totalAmount": 5000,
    "currency": {
      "code": "INR",
      "symbol": "₹"
    },
    "vouchers": [
      {
        "uniqueName": "voucher123",
        "number": "INV-001",
        "amount": 5000,
        "status": "UNPAID",
        "canPay": true,
        "contentType": "invoice"
      }
    ],
    "company": {
      "uniqueName": "company123",
      "name": "Company Name"
    },
    "htmlString": "<html>...</html>" // For PayU only
  }
}
```

---

### API #3: Update Payment Status

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/invoices/:paymentId/pay?voucherVersion=2`

**Purpose**: Update payment status after successful gateway response

**Headers**:

```json
{
  "Content-Type": "application/json"
}
```

**Request Body** (Razorpay):

```json
{
  "paymentGatewayType": "RAZORPAY",
  "razorPayPaymentId": "pay_xxxxx",
  "totalAmount": 5000,
  "date": "13-01-2026"
}
```

**Request Body** (PayU):

```json
{
  "paymentGatewayType": "PAYU"
}
```

**Response**:

```json
{
  "status": "success",
  "body": "Payment successful"
}
```

---

## Payment Gateway Integration

### 1. Razorpay Integration

**SDK**: Razorpay Checkout.js (loaded via script tag)

**Implementation**:

```typescript
public initializePayment(paymentRequest: any, type: PAYMENT_METHODS_ENUM): void {
  if (paymentRequest.paymentGatewayType === PAYMENT_METHODS_ENUM.RAZORPAY) {
    let options = {
      key: paymentRequest.paymentKey,              // Razorpay API key
      image: "data:image/png;base64,...",          // Company logo
      handler: (res) => {
        this.handleVoucherPayment(res);            // Success callback
      },
      order_id: paymentRequest.orderId,            // Order ID from API
      theme: {
        color: "#F37254"
      },
      amount: paymentRequest.totalAmount,          // Amount in paise
      currency: paymentRequest.currency?.code,     // INR, USD, etc.
      name: this.storeData?.companyDetails?.name   // Company name
    };

    this.razorpay = new window["Razorpay"](options);
    setTimeout(() => {
      this.razorpay?.open();
    }, 100);
  }
}
```

**Success Handler**:

```typescript
public handleVoucherPayment(razorPayResponse: any): void {
  let today = new Date();
  let date = `${dd}-${mm}-${yyyy}`;  // Format: DD-MM-YYYY

  let payload = {
    paymentGatewayType: PAYMENT_METHODS_ENUM.RAZORPAY,
    razorPayPaymentId: razorPayResponse.razorpay_payment_id,
    totalAmount: this.paymentDetails.totalAmount,
    date: date
  };

  let payRequest = {
    accountUniqueName: this.storeData.userDetails?.account.uniqueName,
    companyUniqueName: this.paymentDetails.company.uniqueName,
    paymentId: this.paymentDetails.paymentId
  };

  this.payuRazorPayUpdate(payRequest, payload);
}
```

**Features**:

- Modal-based checkout
- Auto-filled user details
- Immediate callback on success/failure
- No page redirect required

---

### 2. PayPal Integration

**Integration Type**: Form POST to PayPal

**Implementation**:

```typescript
public initializePayment(paymentRequest: any, type: PAYMENT_METHODS_ENUM): void {
  if (type === PAYMENT_METHODS_ENUM.PAYPAL) {
    let returnUrl = document.URL;
    if (returnUrl.indexOf("payment_id") === -1) {
      if (returnUrl.indexOf("?") > -1) {
        returnUrl = returnUrl + "&payment_id=" + paymentRequest.paymentId;
      } else {
        returnUrl = returnUrl + "?payment_id=" + paymentRequest.paymentId;
      }
    }

    this.showPaypalForm = true;

    this.paypalForm = this.formBuilder.group({
      businessEmail: [paymentRequest?.paymentKey],
      itemName: [paymentRequest.vouchers[0]?.number],
      custom: [""],
      amount: [paymentRequest.totalAmount],
      currencyCode: [paymentRequest.currency.code],
      notifyUrl: [this.generalService.getPaypalIpnUrl(...)],
      returnUrl: [returnUrl],
      cancelReturnUrl: [document.URL]
    });

    setTimeout(() => {
      document.forms["paypalForm"].submit();
      this.showPaypalForm = false;
    }, 100);
  }
}
```

**HTML Form**:

```html
<form [action]="paypalUrl" method="post" name="paypalForm" [formGroup]="paypalForm">
  <input type="hidden" name="business" formControlName="businessEmail" />
  <input type="hidden" name="cmd" value="_xclick" />
  <input type="hidden" name="custom" formControlName="custom" />
  <input type="hidden" name="amount" formControlName="amount" />
  <input type="hidden" name="currency_code" formControlName="currencyCode" />
  <input type="hidden" name="notify_url" formControlName="notifyUrl" />
  <input type="hidden" name="return" formControlName="returnUrl" />
  <input type="hidden" name="cancel_return" formControlName="cancelReturnUrl" />
</form>
```

**Return URL Handling**:

- PayPal redirects back with `PayerID` query parameter
- Application detects `PayerID` and shows "Payment is being processed" message
- Backend webhook (IPN) updates payment status asynchronously

**Features**:

- Redirects to PayPal website
- Returns to application after payment
- Webhook-based status update
- Supports multiple currencies

---

### 3. PayU Integration

**Integration Type**: HTML form in new window with postMessage communication

**User Details Form**:

```typescript
private initPayuForm(storeData?: any): void {
  this.payuForm = this.formBuilder.group({
    name: [
      storeData?.portalDetails?.name ? storeData?.portalDetails?.name : "",
      Validators.required
    ],
    email: [
      storeData?.portalDetails?.email ? storeData?.portalDetails?.email : "",
      [Validators.required, Validators.email]
    ],
    contactNo: [
      storeData?.portalDetails?.contactNo ? storeData?.portalDetails?.contactNo : "",
      [Validators.required, Validators.pattern("^[0-9]{10}$")]
    ]
  });
}
```

**PayU Check**:

```typescript
public payuCheck(): void {
  this.initPayuForm(this.storeData);

  if (
    this.storeData?.portalDetails?.name &&
    this.storeData?.portalDetails?.email &&
    this.storeData?.portalDetails?.contactNo
  ) {
    // User details available, proceed directly
    this.getVoucherDetails(this.paymentMethodValue);
  } else {
    // Show modal to collect user details
    this.payuDialogRef = this.dialog.open(this.payuModal, {
      width: "600px"
    });
  }
}
```

**Implementation**:

```typescript
private openPayUPayment(html: string): void {
  // Open PayU HTML in new window
  const blob = new Blob([html], { type: "text/html" });
  this.openWindow(URL.createObjectURL(blob));

  // Listen for PayU response from new window
  const handlePayUMessage = (event: MessageEvent<{
    status: string;
    transactionId: string;
    provider: string;
  }>) => {
    if (event.data?.status) {
      let payload = {
        paymentGatewayType: PAYMENT_METHODS_ENUM.PAYU
      };
      let payRequest = {
        accountUniqueName: this.storeData.userDetails?.account.uniqueName,
        companyUniqueName: this.paymentDetails.company.uniqueName,
        paymentId: this.paymentDetails.paymentId
      };
      this.payuRazorPayUpdate(payRequest, payload);

      // Remove listener
      window.removeEventListener("message", handlePayUMessage);
    }
  };
  window.addEventListener("message", handlePayUMessage);
}
```

**Features**:

- Opens in new centered window
- Requires user details (name, email, contact)
- Uses postMessage for communication
- Auto-closes after payment

---

## Component Inputs & Outputs

### Input Properties

| Property               | Type                  | Required | Description                           |
| ---------------------- | --------------------- | -------- | ------------------------------------- |
| `selection`            | `SelectionModel<any>` | No       | Selected vouchers (for bulk payment)  |
| `storeData`            | `any`                 | Yes      | Session and user data from NgRx store |
| `region`               | `string`              | Yes      | Region code (in/uk)                   |
| `voucher`              | `any`                 | No       | Single voucher object                 |
| `queryParams`          | `any`                 | No       | URL query parameters                  |
| `invoicePreview`       | `boolean`             | No       | Flag for invoice preview context      |
| `paymentDetails`       | `any`                 | No       | Pre-loaded payment details            |
| `paymentMethods`       | `any`                 | Yes      | Available payment gateways            |
| `paymentForm`          | `FormGroup`           | No       | Payment form (if applicable)          |
| `buttonText`           | `string`              | Yes      | Button label text                     |
| `customClass`          | `string`              | No       | Additional CSS classes                |
| `paymentMethodValue`   | `any`                 | Yes      | Selected payment method               |
| `urlParams`            | `any`                 | No       | URL path parameters                   |
| `invoicePay`           | `boolean`             | No       | Flag for invoice pay page context     |
| `invoiceGetAll`        | `boolean`             | No       | Flag for invoice list context         |
| `returnInvoiceGetAll`  | `string`              | No       | Return URL for invoice list           |
| `returnInvoicePreview` | `string`              | No       | Return URL for invoice preview        |
| `returnInvoicePay`     | `string`              | No       | Return URL for invoice pay            |

### Output Events

| Event                   | Payload | Description                        |
| ----------------------- | ------- | ---------------------------------- |
| `payNowInvoice`         | `any`   | Emitted from invoice list page     |
| `payNowInvoicePay`      | `any`   | Emitted from invoice pay page      |
| `invoicePreviewSuccess` | `void`  | Payment success in preview context |
| `invoicePaySuccess`     | `void`  | Payment success in pay context     |
| `invoiceGetAllSuccess`  | `void`  | Payment success in list context    |

---

## Payment Methods Detection

### Detection Flow

```typescript
private getPaymentMethods(): void {
  this.isLoading = true;
  const request = {
    accountUniqueName: this.storeData.userDetails?.account.uniqueName,
    companyUniqueName: this.storeData.userDetails?.companyUniqueName,
    sessionId: this.storeData.session?.id
  };

  this.invoiceService.getPaymentMethods(request)
    .pipe(takeUntil(this.destroyed$))
    .subscribe(response => {
      this.isLoading = false;
      if (response && response.status === 'success') {
        this.paymentMethods = response.body;

        // Set default payment method based on priority
        if (response.body?.RAZORPAY) {
          this.paymentMethodValue.setValue(PAYMENT_METHODS_ENUM.RAZORPAY);
        } else if (response.body?.PAYPAL) {
          this.paymentMethodValue.setValue(PAYMENT_METHODS_ENUM.PAYPAL);
        } else if (response.body?.PAYU) {
          this.paymentMethodValue.setValue(PAYMENT_METHODS_ENUM.PAYU);
        } else {
          this.generalService.showSnackbar('No payment method is integrated', 'warning');
        }
      }
    });
}
```

### Priority Order

1. **Razorpay** (First choice for India)
2. **PayPal** (Second choice, global)
3. **PayU** (Third choice for India)

---

## User Scenarios

### Scenario 1: Single Voucher Payment

**Context**: User clicks "Pay Now" on a single invoice

**Flow**:

1. Click "Pay Now" button
2. Check if payment method is PayU → Show user details form if needed
3. Fetch voucher details with payment gateway info
4. Initialize payment gateway
5. Complete payment
6. Update status and redirect

---

### Scenario 2: Multiple Vouchers Payment

**Context**: User selects multiple invoices and clicks "Pay Now"

**Flow**:

1. Click "Pay Now" button
2. Validate all selected vouchers:
   - Check for PAID vouchers → Show error
   - Check for PENDING vouchers → Show warning
3. If multiple payment methods available:
   - Redirect to `/invoice-pay` page for method selection
4. If single payment method:
   - Proceed directly with payment
5. Complete payment for all vouchers
6. Update status and redirect

**Validation Logic**:

```typescript
public paySelectedVouchers(): void {
  if (!this.selection?.selected?.length) {
    return;
  }

  const paidVoucherNumbers: string[] = [];
  const pendingVoucherNumbers: string[] = [];

  for (const voucher of this.selection.selected) {
    if (voucher?.balanceStatus === "PAID") {
      paidVoucherNumbers.push(voucher?.voucherNumber);
    } else if (voucher?.paymentInfo?.paymentStatus === "PENDING") {
      pendingVoucherNumbers.push(voucher?.voucherNumber);
    }
  }

  // No paid or pending vouchers, proceed to pay
  if (!paidVoucherNumbers.length && !pendingVoucherNumbers.length) {
    this.openPayDialog();
    return;
  }

  // Show error messages for paid/pending vouchers
  const messages = [];
  if (paidVoucherNumbers.length) {
    messages.push(`${paidVoucherNumbers.join(', ')} already PAID`);
  }
  if (pendingVoucherNumbers.length) {
    messages.push(`${pendingVoucherNumbers.join(', ')} PENDING`);
  }

  this.generalService.showSnackbar(messages.join(' , '));
}
```

---

### Scenario 3: Invoice Preview Payment

**Context**: User views invoice preview and clicks "Pay Now"

**Flow**:

1. Click "Pay Now" button
2. If multiple payment methods available:
   - Redirect to `/invoice-pay` page
3. If single payment method:
   - Proceed directly with payment
4. Complete payment
5. Emit `invoicePreviewSuccess` event
6. Redirect back to invoice preview

---

### Scenario 4: Payment Method Selection Page

**Context**: User is on `/invoice-pay` page to select payment method

**Flow**:

1. Display payment method options (Razorpay, PayPal, PayU)
2. User selects preferred method
3. Click "Pay Now"
4. If PayU selected → Show user details form
5. Fetch voucher details
6. Initialize selected payment gateway
7. Complete payment
8. Redirect back to source page

---

## Error Handling

### 1. No Payment Method Configured

```typescript
if (!response.body?.RAZORPAY && !response.body?.PAYPAL && !response.body?.PAYU) {
  this.generalService.showSnackbar("No payment method is integrated", "warning");
}
```

**User Experience**: Warning message, Pay Now button disabled

---

### 2. Invoice Already Paid

```typescript
let hasPaidVouchers = voucherDetailsResponse.body?.vouchers?.filter(
  (voucher) => voucher.status === "PAID"
);

if (hasPaidVouchers?.length) {
  this.canPayInvoice = false;
  const paidVoucherNumbers = hasPaidVouchers?.map((v) => v.number);
  this.paidInvoiceMessage = `${paidVoucherNumbers.join(", ")} already paid.`;
}
```

**User Experience**: Error message displayed, payment disabled

---

### 3. Payment Processing (PayPal)

```typescript
if (this.queryParams?.PayerID && this.canPayInvoice) {
  this.canPayInvoice = false;
  this.paymentDetails.vouchers[0].canPay = false;
  this.paymentDetails.vouchers[0].message = "Invoice payment is being processed.";
  this.paidInvoiceMessage = "Invoice payment is being processed.";
}
```

**User Experience**: Info message, payment button disabled temporarily

---

### 4. PayU User Details Missing

```typescript
public payuCheck(): void {
  this.initPayuForm(this.storeData);

  if (
    !this.storeData?.portalDetails?.name ||
    !this.storeData?.portalDetails?.email ||
    !this.storeData?.portalDetails?.contactNo
  ) {
    // Show modal to collect details
    this.payuDialogRef = this.dialog.open(this.payuModal, {
      width: "600px"
    });
  }
}
```

**User Experience**: Modal form to collect name, email, contact number

---

### 5. Payment Gateway Failure

```typescript
public payuRazorPayUpdate(payRequest: any, payload: any): void {
  this.invoiceService.payInvoice(payRequest, payload)
    .pipe(takeUntil(this.destroyed$))
    .subscribe((response: any) => {
      if (response && response.status === "success") {
        this.generalService.showSnackbar(response?.body, "success");
        // Redirect to return URL
      } else {
        if (response?.status === "error") {
          this.generalService.showSnackbar(response?.message);
        }
      }
    });
}
```

**User Experience**: Error snackbar with message from API

---

## Security Considerations

### 1. Session Validation

- All API calls include `Session-id` header
- Session expiry handled automatically
- Redirect to login on invalid session

### 2. Payment Gateway Keys

- API keys never exposed in frontend code
- Keys fetched from backend API
- Secure transmission over HTTPS

### 3. Amount Verification

- Amount calculated on backend
- Frontend cannot modify payment amount
- Gateway order ID verified on backend

### 4. URL Encoding

```typescript
.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
```

### 5. PayU User Data Validation

```typescript
this.payuForm = this.formBuilder.group({
  name: ["", Validators.required],
  email: ["", [Validators.required, Validators.email]],
  contactNo: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
});
```

### 6. Window Communication (PayU)

```typescript
const handlePayUMessage = (event: MessageEvent) => {
  if (event.data?.status) {
    // Verify message origin if needed
    // Process payment response
    window.removeEventListener("message", handlePayUMessage);
  }
};
```

---

## Component State Management

### State Variables

```typescript
{
  destroyed$: ReplaySubject<boolean>,           // Cleanup subscriptions
  showPaypalForm: boolean,                      // Show/hide PayPal form
  razorpay: any,                                // Razorpay instance
  paypalForm: FormGroup,                        // PayPal form data
  payuForm: FormGroup,                          // PayU user details form
  paymentMethodEnum: PAYMENT_METHODS_ENUM,      // Payment method constants
  openedWindow: Window | null,                  // PayU popup window
  isFormSubmitted: boolean,                     // Form validation flag
  confirmationDialogRef: any,                   // Confirmation modal ref
  payuDialogRef: any,                           // PayU modal ref
  canPayInvoice: boolean,                       // Payment allowed flag
  paidInvoiceMessage: string,                   // Error/info message
  isVoucherDetailsLoading: boolean              // Loading state
}
```

---

## Navigation & Redirects

### Redirect to Invoice Pay Page

```typescript
public voucherPay(): void {
  const activeCount = Object.values(this.paymentMethods).filter(Boolean).length;

  if (activeCount > 1) {
    let url = `${this.storeData.domain}/${this.region}/invoice-pay`;

    if (this.selection?.selected?.length) {
      const voucherUniqueNames = this.selection?.selected?.map(v => v.uniqueName);
      const accountUniqueName = this.selection?.selected[0].account.uniqueName;
      const encodedVouchers = voucherUniqueNames.map(encodeURIComponent);
      url = url + `/account/${accountUniqueName}/voucher/${encodedVouchers.join('|')}`;
    } else {
      url = url + '/account/' + this.voucher?.account?.uniqueName +
            '/voucher/' + this.voucher?.uniqueName;
    }

    this.router.navigate([url]);
  }
}
```

### Return After Payment

```typescript
public payuRazorPayUpdate(payRequest: any, payload: any): void {
  this.invoiceService.payInvoice(payRequest, payload)
    .subscribe((response: any) => {
      if (response && response.status === "success") {
        this.generalService.showSnackbar(response?.body, "success");

        let url: string;

        if (this.invoiceGetAll) {
          this.invoiceGetAllSuccess.emit();
          url = this.returnInvoiceGetAll;
        }
        if (this.invoicePreview) {
          this.invoicePreviewSuccess.emit();
          url = this.returnInvoicePreview;
        }
        if (this.invoicePay) {
          this.invoicePaySuccess.emit();
          url = this.returnInvoicePay;
        }

        if (url) {
          let updatedUrl = `/${this.storeData.domain}${url}`;
          this.router.navigateByUrl(updatedUrl);
        }
      }
    });
}
```

---

## Testing Scenarios

### Test Case 1: Razorpay Payment

1. Select invoice with Razorpay configured
2. Click "Pay Now"
3. Verify Razorpay modal opens
4. Complete payment
5. Verify success message
6. Verify redirect to source page

### Test Case 2: PayPal Payment

1. Select invoice with PayPal configured
2. Click "Pay Now"
3. Verify redirect to PayPal
4. Complete payment on PayPal
5. Verify return to application
6. Verify "Payment processing" message

### Test Case 3: PayU Payment (With Details)

1. Select invoice with PayU configured
2. User details already available
3. Click "Pay Now"
4. Verify PayU window opens
5. Complete payment
6. Verify success message

### Test Case 4: PayU Payment (Without Details)

1. Select invoice with PayU configured
2. No user details available
3. Click "Pay Now"
4. Verify modal opens for details
5. Fill name, email, contact
6. Click "Proceed to Payment"
7. Verify PayU window opens
8. Complete payment

### Test Case 5: Multiple Vouchers

1. Select 3 invoices
2. Click "Pay Now"
3. Verify all vouchers included in payment
4. Complete payment
5. Verify all invoices marked as paid

### Test Case 6: Paid Invoice Error

1. Select already paid invoice
2. Click "Pay Now"
3. Verify error message displayed
4. Verify payment button disabled

### Test Case 7: Multiple Payment Methods

1. Configure Razorpay and PayPal
2. Click "Pay Now"
3. Verify redirect to invoice-pay page
4. Select payment method
5. Complete payment

---

## Troubleshooting

### Issue: Razorpay Modal Not Opening

**Possible Causes**:

- Razorpay script not loaded
- Invalid API key
- Browser blocking popup

**Solution**:

1. Check browser console for errors
2. Verify Razorpay script loaded
3. Check API key in response
4. Disable popup blocker

---

### Issue: PayPal Not Redirecting

**Possible Causes**:

- Form not submitting
- Invalid business email
- Network error

**Solution**:

1. Check form values in console
2. Verify PayPal URL
3. Check network tab for POST request
4. Verify business email configured

---

### Issue: PayU Window Not Opening

**Possible Causes**:

- Popup blocked
- Invalid HTML string
- postMessage not working

**Solution**:

1. Allow popups for the domain
2. Check HTML string in response
3. Verify window.postMessage support
4. Check browser console for errors

---

### Issue: Payment Status Not Updating

**Possible Causes**:

- API call failed
- Invalid payment ID
- Session expired

**Solution**:

1. Check network tab for API response
2. Verify payment ID in request
3. Check session validity
4. Retry payment update API

---

## Future Enhancements

1. **Stripe Integration**: Add Stripe as fourth payment option
2. **Partial Payments**: Allow paying partial amount
3. **Payment History**: Show payment history on invoice
4. **Retry Failed Payments**: Retry mechanism for failed payments
5. **Payment Receipts**: Auto-generate payment receipts
6. **Multi-Currency**: Support for multiple currencies
7. **Saved Payment Methods**: Save user's preferred payment method
8. **Payment Reminders**: Send reminders for pending payments

---

## Related Documentation

- [Invoice Preview Page](./INVOICE_PREVIEW_PAGE.md)
- [Invoice List Page](./INVOICE_LIST_PAGE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Session Management](./SESSION_MANAGEMENT.md)

---

**Last Updated**: January 13, 2026  
**Version**: 1.0  
**Maintainer**: Development Team
