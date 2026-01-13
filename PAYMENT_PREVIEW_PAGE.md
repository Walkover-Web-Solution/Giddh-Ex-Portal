# Payment Preview Page Documentation

## Overview

The Payment Preview page displays a detailed view of a payment voucher (receipt) in PDF format. This page allows vendors to view, print, and download their payment receipts issued by the company.

**Component**: `payment-preview`

**File**: `src/app/payment-preview/payment-preview.component.ts`

**Template**: `src/app/payment-preview/payment-preview.component.html`

**Route**: `/:companyDomainUniqueName/:region/payment/preview`

---

## Table of Contents

1. [URL Structure & Routing](#url-structure--routing)
2. [Page Components](#page-components)
3. [API Integration](#api-integration)
4. [Page Initialization Flow](#page-initialization-flow)
5. [PDF Rendering Process](#pdf-rendering-process)
6. [UI Sections](#ui-sections)
7. [User Actions](#user-actions)
8. [Component State](#component-state)
9. [Error Handling](#error-handling)
10. [Key Features](#key-features)
11. [Security Considerations](#security-considerations)
12. [Testing Scenarios](#testing-scenarios)

---

## URL Structure & Routing

### URL Pattern

```
/:companyDomainUniqueName/:region/payment/preview?voucher=:voucherUniqueName
```

### Example URL

```
https://portal.giddh.com/PiyusssshhCompany/in/payment/preview?voucher=nejil1768286090516
```

### URL Parameters

| Parameter                 | Type     | Location | Description                              | Example              |
| ------------------------- | -------- | -------- | ---------------------------------------- | -------------------- |
| `companyDomainUniqueName` | `string` | Path     | Unique domain name of the company        | `PiyusssshhCompany`  |
| `region`                  | `string` | Path     | Region code                              | `in`, `uk`, `us`     |
| `voucher`                 | `string` | Query    | Unique identifier of the payment voucher | `nejil1768286090516` |

### Route Configuration

**File**: `src/app/app-routing.module.ts`

```typescript
{
  path: ":companyDomainUniqueName/:region/payment/preview",
  loadChildren: () => import('./payment-preview/payment-preview.module')
    .then(module => module.PaymentPdfModule),
  canActivate: [NeedsAuthentication]
}
```

**Authentication**: Required (protected by `NeedsAuthentication` guard)

**Module**: Lazy loaded for performance optimization

---

## Page Components

### Component Files

1. **TypeScript**: `src/app/payment-preview/payment-preview.component.ts`
2. **Template**: `src/app/payment-preview/payment-preview.component.html`
3. **Styles**: `src/app/payment-preview/payment-preview.component.scss`
4. **Module**: `src/app/payment-preview/payment-preview.module.ts`
5. **Routing**: `src/app/payment-preview/payment-preview.routing.module.ts`
6. **Service**: `src/app/services/payment.service.ts`
7. **API URLs**: `src/app/services/apiurls/payment.api.ts`

### Dependencies

**Angular Material Modules**:

- `MatCheckboxModule`
- `MatSidenavModule`
- `MatSelectModule`
- `MatDialogModule`
- `MatTabsModule`
- `MatAutocompleteModule`
- `MatProgressSpinnerModule`

**Third-Party Libraries**:

- `file-saver`: For downloading PDF files
- `@ngrx/store`: State management

**Custom Components**:

- `sidebar`: Navigation sidebar component

---

## API Integration

### API #1: Download Payment Voucher (PDF)

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`

**Purpose**: Download payment voucher as base64-encoded PDF

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
["nejil1768286090516"]
```

**Response Structure**:

```json
{
  "status": "success",
  "body": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSAxIDAgUj4+L1Byb2NTZXRbL1BERi9UZXh0L0ltYWdlQi9JbWFnZUMvSW1hZ2VJXT4+L01lZGlhQm94WzAgMCA1OTUuMzIgODQxLjkyXS9Db250ZW50cyA0IDAgUi9Hcm91cDw8L1R5cGUvR3JvdXAvUy9UcmFuc3BhcmVuY3kvQ1MvRGV2aWNlUkdCPj4vVGFicz..."
}
```

**Service Method**:

```typescript
public downloadVoucher(model: any): Observable<BaseResponse<any, any>> {
  let voucherUniqueName = [model.voucherUniqueName];
  let args: any = { headers: {} };
  args.headers['Session-id'] = model?.sessionId;

  return this.http.post(
    this.apiUrl + PAYMENT_API.DOWNLOAD_VOUCHER
      .replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))
      .replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName)),
    voucherUniqueName,
    args
  ).pipe(
    map((res) => {
      let data: BaseResponse<any, any> = res;
      data.request = voucherUniqueName;
      return data;
    }),
    catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
  );
}
```

---

### API #2: Get Payment Voucher Details

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`

**Purpose**: Get payment voucher metadata (not used for PDF, but for additional details)

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
["nejil1768286090516"]
```

**Response Structure**:

```json
{
  "status": "success",
  "body": {
    "paymentId": "PAY_123456",
    "vouchers": [
      {
        "uniqueName": "nejil1768286090516",
        "number": "RCT-001",
        "voucherType": "receipt",
        "amount": 5000,
        "date": "13-01-2026"
      }
    ]
  }
}
```

---

### API #3: Get Payment List

**Endpoint**: `GET portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers?voucherVersion=2`

**Purpose**: Get list of payment vouchers to fetch voucher number and other metadata

**Headers**:

```json
{
  "Session-id": "session_id_string"
}
```

**Query Parameters**:

- `type`: `receipt`
- `page`: Page number
- `count`: Records per page
- `sortBy`: Sort field
- `sort`: Sort direction
- `uniqueNames`: Voucher unique name to filter

**Response Structure**:

```json
{
  "status": "success",
  "body": {
    "items": [
      {
        "uniqueName": "nejil1768286090516",
        "voucherNumber": "RCT-001",
        "voucherDate": "13-01-2026",
        "grandTotal": {
          "amountForAccount": 5000
        },
        "accountCurrencySymbol": "₹",
        "paymentMode": {
          "name": "Cash"
        }
      }
    ],
    "totalItems": 1
  }
}
```

**Service Method**:

```typescript
public getInvoiceList(model: any): Observable<BaseResponse<any, any>> {
  let args: any = { headers: {} };
  args.headers['Session-id'] = model?.sessionId;

  return this.http.get(
    this.apiUrl + PAYMENT_API.GET_VOUCHER_LIST
      .replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))
      .replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName))
      + `?type=${model.type}&page=${model.page}&count=${model.count}&uniqueNames=${model.uniqueNames}`,
    '', args
  ).pipe(
    map((res) => {
      let data: BaseResponse<any, string> = res;
      return data;
    }),
    catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
  );
}
```

---

## Page Initialization Flow

### Initialization Sequence

```
1. Component ngOnInit()
   │
   ▼
2. Subscribe to Route Params & Query Params
   │
   ▼
3. Extract Parameters
   - companyDomainUniqueName (from route params)
   - region (from store)
   - voucher (from query params)
   │
   ▼
4. Load Store Data
   - Session ID
   - User details
   - Account unique name
   - Company unique name
   │
   ▼
5. Call getPaymentDetails()
   │
   ▼
6. API Call: downloadVoucher()
   - POST with voucher unique name
   - Returns base64 PDF
   │
   ▼
7. Convert Base64 to Blob
   - Decode base64 string
   - Create Blob with MIME type 'application/pdf'
   │
   ▼
8. Create Object URL
   - URL.createObjectURL(blob)
   - Sanitize URL for iframe
   │
   ▼
9. Call getInvoiceList()
   - Fetch voucher metadata
   - Get voucher number for download filename
   │
   ▼
10. Render UI
    - Display PDF in iframe
    - Show action buttons (Back, Print, Download)
```

### Code Implementation

```typescript
public ngOnInit(): void {
  combineLatest([
    this.route.queryParams,
    this.route.params,
    this.store.pipe(select(state => state))
  ])
  .pipe(takeUntil(this.destroyed$))
  .subscribe((response) => {
    if (response[0] && response[1] && response[2] && !this.storeData?.session) {
      this.storeData = response[2]['folderName'][response[1].companyDomainUniqueName];
      this.region = this.storeData?.region;
      this.voucherUniqueName = response[0].voucher;

      this.getPaymentDetails();
    }
  });
}
```

---

## PDF Rendering Process

### Step-by-Step Process

#### 1. Fetch Base64 PDF from API

```typescript
public getPaymentDetails(): void {
  let urlRequest = {
    accountUniqueName: this.storeData.userDetails.account.uniqueName,
    companyUniqueName: this.storeData.userDetails.companyUniqueName,
    sessionId: this.storeData.session.id,
    voucherUniqueName: this.voucherUniqueName
  }

  this.isLoading = true;
  this.paymentService.downloadVoucher(urlRequest)
    .pipe(takeUntil(this.destroyed$))
    .subscribe((voucherDetailsResponse: any) => {
      if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
        // Process PDF...
      }
    });
}
```

#### 2. Convert Base64 to Blob

```typescript
let blob = this.generalService.base64ToBlob(voucherDetailsResponse.body, "application/pdf", 512);
```

**Base64 to Blob Conversion**:

```typescript
public base64ToBlob(b64Data: string, contentType: string, sliceSize: number): Blob {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  let byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);
    let byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
```

#### 3. Create Object URL

```typescript
URL.revokeObjectURL(this.pdfFileURL); // Clean up previous URL
this.pdfFileURL = URL.createObjectURL(blob);
```

#### 4. Sanitize URL for Security

```typescript
this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
```

**Why Sanitization?**: Angular's security model blocks untrusted URLs in iframes. The `DomSanitizer` explicitly marks the URL as safe.

#### 5. Render in Iframe

```html
<iframe #pdfContainer width="100%" height="100%" [src]="sanitizedPdfFileUrl"> </iframe>
```

---

## UI Sections

### 1. Loading Spinner

Displayed while fetching payment voucher data.

```html
<mat-spinner [diameter]="60" *ngIf="isLoading"></mat-spinner>
```

**Visibility**: Shown during API calls, hidden when data loaded

---

### 2. Sidebar Navigation

```html
<sidebar></sidebar>
```

**Purpose**: Provides navigation to other sections (Welcome, Invoices, Payments, Account Statement)

---

### 3. Action Header

Contains Back, Print, and Download buttons.

```html
<div class="back-header d-flex justify-content-between align-items-center">
  <!-- Back Button -->
  <button mat-stroked-button color="primary" (click)="backToInvoices()">Back</button>

  <!-- Action Buttons -->
  <div class="d-flex column-gap10">
    <!-- Print Button -->
    <button mat-stroked-button color="primary" (click)="printVoucher()">
      <img src="../../assets/images/print.svg" alt="print" />
      Print
    </button>

    <!-- Download Button -->
    <button
      mat-stroked-button
      color="primary"
      (click)="downloadPdf(voucherUniqueName, selectedPaymentVoucher[0]?.voucherNumber)"
    >
      <img
        class="download-button icon-size"
        src="../../assets/images/download.svg"
        alt="download"
      />
    </button>
  </div>
</div>
```

---

### 4. PDF Viewer

Displays the payment receipt PDF in an embedded iframe.

```html
<div class="pdf-wrapper mr-b50 mr-t15">
  <iframe #pdfContainer width="100%" height="100%" [src]="sanitizedPdfFileUrl"> </iframe>
</div>
```

**Features**:

- Full-width responsive layout
- Scrollable if content exceeds viewport
- Native browser PDF controls (zoom, page navigation)

---

## User Actions

### 1. Back to Payments List

**Button**: "Back"

**Action**: Navigate back to payments list page

**Implementation**:

```typescript
public backToInvoices(): void {
  let url = `${this.storeData.domain}/${this.region}/payment`;
  this.router.navigate([url]);
}
```

**Navigation**: `/:companyDomainUniqueName/:region/payment`

---

### 2. Print Payment Voucher

**Button**: "Print" (with print icon)

**Action**: Opens browser print dialog for the PDF

**Implementation**:

```typescript
public printVoucher() {
  if (this.pdfContainer) {
    const window = this.pdfContainer?.nativeElement?.contentWindow;
    if (window) {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 200);
    }
  }
}
```

**Process**:

1. Access iframe's content window
2. Focus on iframe window
3. Wait 200ms for focus
4. Trigger browser print dialog

**User Experience**: Native browser print dialog opens with PDF ready to print

---

### 3. Download Payment Voucher

**Button**: Download icon

**Action**: Downloads PDF file to user's device

**Implementation**:

```typescript
public downloadPdf(voucherUniqueName: any, voucherNumber: any): void {
  let urlRequest = {
    accountUniqueName: this.storeData.userDetails.account.uniqueName,
    companyUniqueName: this.storeData.userDetails.companyUniqueName,
    sessionId: this.storeData.session.id,
    voucherUniqueName: voucherUniqueName
  }

  this.paymentService.downloadVoucher(urlRequest)
    .pipe(takeUntil(this.destroyed$))
    .subscribe((response: any) => {
      if (response) {
        let blob: Blob = this.generalService.base64ToBlob(
          response.body,
          'application/pdf',
          512
        );
        saveAs(blob, voucherNumber, 'application/pdf');
      } else {
        if (response?.status === 'error') {
          this.generalService.showSnackbar(response?.message);
        }
      }
    });
}
```

**File Name**: Uses voucher number (e.g., `RCT-001.pdf`)

**Library**: `file-saver` library for cross-browser download support

---

## Component State

### State Variables

```typescript
{
  isLoading: boolean,                    // API call in progress
  destroyed$: ReplaySubject<boolean>,    // Cleanup subscriptions
  invoiceListData: any[],                // Payment list data
  pdfFileURL: any,                       // Blob URL for PDF
  sanitizedPdfFileUrl: any,              // Sanitized URL for iframe
  voucherUniqueName: string,             // Voucher unique identifier
  paymentId: string,                     // Payment ID
  selectedPaymentVoucher: any[],         // Selected voucher metadata
  paymentDetails: any,                   // Payment details from API
  paymentListRequest: {
    companyUniqueName: string,
    accountUniqueName: string,
    sessionId: string,
    type: 'receipt',
    page: number,
    count: number,
    sortBy: string,
    sort: string,
    balanceStatus: any[],
    uniqueNames: any[]
  },
  storeData: any,                        // NgRx store data
  region: string                         // Region code
}
```

### State Lifecycle

1. **Initial State**: All values undefined/null, `isLoading = false`
2. **Loading State**: `isLoading = true` when API calls start
3. **Loaded State**: `isLoading = false`, PDF URL and metadata populated
4. **Error State**: `isLoading = false`, error message displayed

---

## Error Handling

### 1. API Error - Download Voucher

```typescript
if (voucherDetailsResponse?.status === "error") {
  this.generalService.showSnackbar(voucherDetailsResponse?.message);
}
```

**User Experience**: Error message displayed in snackbar

**Common Errors**:

- Voucher not found
- Session expired
- Insufficient permissions

---

### 2. API Error - Get Invoice List

```typescript
if (invoiceListResponse?.status === "error") {
  this.generalService.showSnackbar(invoiceListResponse?.message);
}
```

**User Experience**: Error message displayed, but PDF may still be visible

---

### 3. Download Error

```typescript
if (response?.status === "error") {
  this.generalService.showSnackbar(response?.message);
}
```

**User Experience**: Download fails, error message shown

---

### 4. Session Expiry

**Guard**: `NeedsAuthentication` route guard

**Behavior**: Automatic redirect to login page

**User Experience**: User redirected to login, can return to payment preview after authentication

---

## Key Features

### 1. PDF Viewer

**Technology**: Native browser iframe PDF viewer

**Advantages**:

- No external PDF library needed
- Native browser controls (zoom, page navigation)
- Consistent across browsers
- Secure (sandboxed iframe)

**Supported Browsers**:

- Chrome: Built-in PDF viewer
- Firefox: Built-in PDF viewer
- Safari: Built-in PDF viewer
- Edge: Built-in PDF viewer

---

### 2. Print Functionality

**Method**: Access iframe's content window and trigger print

**Features**:

- Preserves PDF formatting
- Uses browser's native print dialog
- Supports print preview
- Allows printer selection

---

### 3. Download Functionality

**Method**: Convert base64 to blob and trigger download

**Features**:

- Cross-browser compatible (via file-saver)
- Automatic filename (voucher number)
- No page reload required
- Works with popup blockers

---

### 4. Responsive Design

**Layout**:

- Sidebar navigation on left
- Content area on right
- Full-height PDF viewer
- Mobile-responsive buttons

**Breakpoints**:

- Desktop: Sidebar + content
- Mobile: Stacked layout, wrapped buttons

---

## Security Considerations

### 1. Authentication Required

**Route Guard**: `NeedsAuthentication`

**Behavior**: Redirects unauthenticated users to login

---

### 2. Session Validation

**Session Header**: All API calls include `Session-id` header

```typescript
args.headers["Session-id"] = model?.sessionId;
```

**Validation**: Backend validates session and user permissions

---

### 3. URL Sanitization

**DomSanitizer**: Prevents XSS attacks

```typescript
this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
```

**Why Needed**: Angular blocks untrusted URLs in iframes by default

---

### 4. URL Encoding

**Parameter Encoding**: All URL parameters are encoded

```typescript
.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))
.replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName))
```

---

### 5. Blob URL Cleanup

**Memory Management**: Revoke old blob URLs to prevent memory leaks

```typescript
URL.revokeObjectURL(this.pdfFileURL);
```

---

## Testing Scenarios

### Test Case 1: View Payment Voucher

**Steps**:

1. Login as vendor
2. Navigate to Payments list
3. Click on payment number link
4. Verify redirect to payment preview page
5. Verify PDF loads in iframe
6. Verify action buttons displayed

**Expected Result**: Payment voucher PDF displayed correctly

---

### Test Case 2: Print Payment Voucher

**Steps**:

1. Open payment preview page
2. Click "Print" button
3. Verify browser print dialog opens
4. Verify PDF content in print preview
5. Cancel or complete print

**Expected Result**: Print dialog opens with correct PDF

---

### Test Case 3: Download Payment Voucher

**Steps**:

1. Open payment preview page
2. Click download button
3. Verify file download initiated
4. Check downloaded file
5. Verify filename matches voucher number
6. Open PDF and verify content

**Expected Result**: PDF downloaded successfully with correct filename

---

### Test Case 4: Back Navigation

**Steps**:

1. Open payment preview page
2. Click "Back" button
3. Verify redirect to payments list page

**Expected Result**: User returned to payments list

---

### Test Case 5: Invalid Voucher

**Steps**:

1. Navigate to payment preview with invalid voucher ID
2. Verify error message displayed
3. Verify PDF not loaded

**Expected Result**: Error message shown, graceful failure

---

### Test Case 6: Session Expiry

**Steps**:

1. Open payment preview page
2. Clear session from browser
3. Try to print or download
4. Verify redirect to login

**Expected Result**: User redirected to login page

---

### Test Case 7: Mobile Responsive

**Steps**:

1. Open payment preview on mobile device
2. Verify layout adapts to screen size
3. Verify buttons are accessible
4. Verify PDF scrollable

**Expected Result**: Page fully functional on mobile

---

## Troubleshooting

### Issue: PDF Not Displaying

**Possible Causes**:

- Browser doesn't support PDF in iframe
- Base64 decode error
- Invalid PDF data from API

**Solution**:

1. Check browser console for errors
2. Verify API response contains base64 data
3. Try different browser
4. Check PDF viewer browser extension conflicts

---

### Issue: Print Not Working

**Possible Causes**:

- Iframe not focused
- Browser blocking print dialog
- PDF not fully loaded

**Solution**:

1. Increase timeout before print (currently 200ms)
2. Check browser console for errors
3. Verify iframe has content window
4. Try manual print (Ctrl+P)

---

### Issue: Download Not Working

**Possible Causes**:

- Browser blocking download
- file-saver library not loaded
- Invalid blob data

**Solution**:

1. Check browser download settings
2. Verify file-saver library imported
3. Check browser console for errors
4. Try different browser

---

### Issue: Slow Loading

**Possible Causes**:

- Large PDF file
- Slow network connection
- Server response time

**Solution**:

1. Show loading spinner
2. Optimize PDF size on backend
3. Implement caching
4. Add timeout handling

---

## Performance Considerations

### 1. Lazy Loading

**Module**: Lazy loaded via routing

```typescript
loadChildren: () =>
  import("./payment-preview/payment-preview.module").then((module) => module.PaymentPdfModule);
```

**Benefits**: Reduces initial bundle size, faster app load time

---

### 2. Blob URL Management

**Cleanup**: Revoke old URLs to prevent memory leaks

```typescript
URL.revokeObjectURL(this.pdfFileURL);
```

**Benefits**: Prevents memory accumulation over time

---

### 3. Subscription Cleanup

**Destroyed Subject**: Prevents memory leaks

```typescript
private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

ngOnDestroy(): void {
  this.destroyed$.next(true);
  this.destroyed$.complete();
}
```

**Benefits**: Automatic unsubscription on component destroy

---

### 4. Base64 Conversion Optimization

**Slice Size**: Process base64 in chunks (512 bytes)

```typescript
this.generalService.base64ToBlob(response.body, "application/pdf", 512);
```

**Benefits**: Prevents browser freezing on large files

---

## Navigation Flow

### Entry Points

1. **From Payments List**: Click on payment number
2. **Direct URL**: Navigate directly with voucher query parameter

### Exit Points

1. **Back Button**: Return to payments list
2. **Sidebar Navigation**: Navigate to other sections
3. **Browser Back**: Return to previous page

### Navigation Code

```typescript
// Navigate to payment preview
public paymentPreview(invoice: any): void {
  let url = `${this.storeData.domain}/${this.region}/payment/preview`;
  this.router.navigate([url], {
    queryParams: {
      voucher: invoice?.uniqueName
    }
  });
}

// Navigate back to payments list
public backToInvoices(): void {
  let url = `${this.storeData.domain}/${this.region}/payment`;
  this.router.navigate([url]);
}
```

---

## Comparison with Invoice Preview

### Similarities

| Feature        | Payment Preview   | Invoice Preview   |
| -------------- | ----------------- | ----------------- |
| PDF Rendering  | ✅ Base64 to Blob | ✅ Base64 to Blob |
| Print          | ✅ Iframe print   | ✅ Iframe print   |
| Download       | ✅ file-saver     | ✅ file-saver     |
| Authentication | ✅ Required       | ❌ Optional       |
| Sidebar        | ✅ Yes            | ✅ Yes            |

### Differences

| Feature            | Payment Preview  | Invoice Preview          |
| ------------------ | ---------------- | ------------------------ |
| **Document Type**  | Payment Receipt  | Sales Invoice            |
| **Pay Button**     | ❌ No            | ✅ Yes                   |
| **Comments**       | ❌ No            | ✅ Yes                   |
| **Login Button**   | ❌ No            | ✅ Yes (unauthenticated) |
| **Authentication** | Required         | Optional                 |
| **API Endpoint**   | `/download-file` | `/download-file`         |
| **Query Param**    | `voucher`        | `voucher`                |

---

## Related Documentation

- [Invoice Preview Page](./INVOICE_PREVIEW_PAGE.md)
- [Pay Now Functionality](./PAY_NOW_FUNCTIONALITY.md)
- [Payment List Page](./PAYMENT_LIST_PAGE.md)
- [Account Statement](./ACCOUNT_STATEMENT_FUNCTIONALITY.md)
- [Session Management](./SESSION_MANAGEMENT.md)

---

## Future Enhancements

1. **Email Payment Receipt**: Send receipt via email
2. **Share Receipt**: Generate shareable link
3. **Payment History**: Show related invoices paid by this receipt
4. **Multi-Receipt View**: View multiple receipts in one session
5. **Receipt Annotations**: Add notes to receipts
6. **Export Options**: Export as Excel or CSV
7. **Receipt Verification**: QR code for verification
8. **Payment Reconciliation**: Mark as reconciled

---

## API Reference Summary

| API                 | Method | Endpoint                                                                             | Purpose              |
| ------------------- | ------ | ------------------------------------------------------------------------------------ | -------------------- |
| Download Voucher    | POST   | `/portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file`       | Get PDF as base64    |
| Get Voucher Details | POST   | `/portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request` | Get payment metadata |
| Get Invoice List    | GET    | `/portal/company/:companyUniqueName/accounts/:accountUniqueName/vouchers`            | Get voucher list     |

---

**Last Updated**: January 13, 2026  
**Version**: 1.0  
**Maintainer**: Development Team
