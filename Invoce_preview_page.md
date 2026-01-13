# Invoice Preview Page Documentation

## Page Overview

**URL Pattern**: `/:companyDomainUniqueName/:region/invoice/preview?voucher=:voucherUniqueName`

**Example URL**: `/PiyusssshhCompany/in/invoice/preview?voucher=deuws1768286006815`

**Purpose**: Display invoice PDF with payment options, comments, and download/print functionality

**Authentication**: Public access (no authentication required, but features vary based on login status)

---

## URL Structure

### Path Parameters

| Parameter                 | Example             | Description                  |
| ------------------------- | ------------------- | ---------------------------- |
| `companyDomainUniqueName` | `PiyusssshhCompany` | Company subdomain identifier |
| `region`                  | `in`                | Region code (in/uk)          |

### Query Parameters

| Parameter           | Example              | Required | Description                             |
| ------------------- | -------------------- | -------- | --------------------------------------- |
| `voucher`           | `deuws1768286006815` | Yes      | Invoice/voucher unique identifier       |
| `accountUniqueName` | -                    | No       | Account unique name (optional override) |
| `companyUniqueName` | -                    | No       | Company unique name (optional override) |

---

## Route Configuration

**File**: `src/app/app-routing.module.ts:13`

```typescript
{
  path: ":companyDomainUniqueName/:region/invoice/preview",
  loadChildren: () => import('./invoice-preview/invoice-preview.module')
    .then(module => module.InvoicePdfModule)
}
```

**Authentication Guard**: None (publicly accessible)

---

## Component Files

| File      | Path                                                     | Purpose              |
| --------- | -------------------------------------------------------- | -------------------- |
| Component | `src/app/invoice-preview/invoice-preview.component.ts`   | Main logic           |
| Template  | `src/app/invoice-preview/invoice-preview.component.html` | UI markup            |
| Service   | `src/app/services/invoice.service.ts`                    | API calls            |
| API URLs  | `src/app/services/apiurls/invoice.api.ts`                | Endpoint definitions |

---

## Page Initialization Flow

### 1. Route Parameter Extraction

```typescript
combineLatest([
  this.route.queryParams, // { voucher: "deuws1768286006815" }
  this.route.params, // { companyDomainUniqueName: "PiyusssshhCompany", region: "in" }
  this.store.pipe(select((state) => state)), // NgRx store state
]);
```

### 2. Session Check

**If NO session exists**:

- Display proxy login button
- Store redirect URL for post-login navigation
- Limited features (read-only comments)

**If session exists**:

- Full access to all features
- Can add comments
- Can make payments

### 3. Store Redirect URL

```typescript
this.store.dispatch(
  setFolderData({
    folderName: this.storeData.domain,
    data: {
      redirectUrl: updatedUrl,
      region: response[1]?.region,
    },
  })
);
```

---

## API Calls

### API #1: Get Payment Methods

**Endpoint**: `GET portal/company/:companyUniqueName/accounts/:accountUniqueName/payment-methods`

**Purpose**: Determine available payment gateways

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
      /* Razorpay config */
    },
    "PAYPAL": {
      /* PayPal config */
    },
    "PAYU": {
      /* PayU config */
    }
  }
}
```

**Logic**:

- Sets default payment method based on availability
- Priority: RAZORPAY → PAYPAL → PAYU
- Shows warning if no payment method configured

---

### API #2: Get Voucher Details

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/invoice-pay-request?voucherVersion=2`

**Method**: `POST`

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
["deuws1768286006815"]
```

**Response**:

```json
{
  "status": "success",
  "body": {
    "vouchers": [
      {
        "content": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC...",
        "number": "INV-001",
        "dueDate": "2026-01-20",
        "amount": 5000,
        "canPay": true,
        "message": ""
      }
    ],
    "currency": {
      "code": "INR",
      "symbol": "₹"
    }
  }
}
```

**Fields Used**:

- `vouchers[0].content` - Base64 encoded PDF
- `vouchers[0].number` - Invoice number
- `vouchers[0].dueDate` - Due date
- `vouchers[0].amount` - Balance due
- `vouchers[0].canPay` - Payment allowed flag
- `vouchers[0].message` - Error/info message
- `currency.symbol` - Currency symbol
- `currency.code` - Currency code

---

### API #3: Get Invoice Comments

**Endpoint**: `GET portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/comments?voucherVersion=2`

**Method**: `GET`

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
  "body": [
    {
      "id": 123,
      "description": "Payment received, thank you!",
      "userName": "John Doe",
      "dateString": "12 Jan 2026, 2:30 PM"
    }
  ]
}
```

---

### API #4: Add Comment (Authenticated Only)

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/:voucherUniqueName/add-comment?voucherVersion=2`

**Method**: `POST`

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
"This is my comment text"
```

**Response**:

```json
{
  "status": "success",
  "message": "Comment added successfully"
}
```

---

### API #5: Download Voucher

**Endpoint**: `POST portal/company/:companyUniqueName/accounts/:accountUniqueName/download-file?voucherVersion=2&fileType=base64`

**Method**: `POST`

**Headers**:

```json
{
  "Session-id": "session_id_string",
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
["deuws1768286006815"]
```

**Response**:

```json
{
  "status": "success",
  "body": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC..."
}
```

---

## PDF Rendering Process

### Step 1: Receive Base64 PDF

```typescript
const base64Content = voucherDetailsResponse.body?.vouchers[0]?.content;
```

### Step 2: Convert Base64 to Blob

```typescript
let blob = this.generalService.base64ToBlob(
  base64Content,
  "application/pdf",
  512 // Chunk size
);
```

**Conversion Logic**:

1. Decode base64 string using `atob()`
2. Split into 512-byte chunks
3. Convert each chunk to Uint8Array
4. Create Blob from arrays

### Step 3: Create Object URL

```typescript
URL.revokeObjectURL(this.pdfFileURL); // Clean up previous URL
this.pdfFileURL = URL.createObjectURL(blob);
```

### Step 4: Sanitize for iframe

```typescript
this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
```

### Step 5: Display in iframe

```html
<iframe #pdfContainer width="100%" height="100%" [src]="sanitizedPdfFileUrl"></iframe>
```

---

## Page Sections

### 1. Login Section (Unauthenticated Users Only)

**Condition**: `!storeData?.session?.id`

```html
<div class="login-section" *ngIf="!storeData?.session?.id">
  <div class="login-btn-wrap d-flex text-white" [id]="loginId"></div>
</div>
```

**Functionality**:

- Loads external proxy authentication script
- Displays login button
- Redirects to `/PiyusssshhCompany/in/auth` after successful login
- Preserves current URL for post-login redirect

---

### 2. Loading Spinner

```html
<mat-spinner [diameter]="60" *ngIf="isLoading"></mat-spinner>
```

**Shown during**:

- Initial page load
- API calls
- PDF processing

---

### 3. Invoice Header

**Elements**:

- Back button
- Pay Now button (conditional)
- Print button
- Download button

```html
<div class="back-header d-flex justify-content-between align-items-center">
  <button mat-stroked-button color="primary" (click)="backToInvoices()">Back</button>
  <div class="d-flex column-gap10">
    <pay-now *ngIf="paymentDetails?.vouchers[0]?.canPay" />
    <button mat-stroked-button color="primary" (click)="printVoucher()">Print</button>
    <button mat-stroked-button color="primary" (click)="downloadPdf()">Download</button>
  </div>
</div>
```

---

### 4. Payment Not Allowed Message

**Condition**: `!paymentDetails?.vouchers[0]?.canPay`

```html
<span class="razorpay-message error-message" *ngIf="!paymentDetails?.vouchers[0]?.canPay">
  {{ paymentDetails?.vouchers[0]?.message }}
</span>
```

**Example Messages**:

- "Invoice already paid"
- "Payment gateway not configured"
- "Invoice expired"

---

### 5. Invoice Information

```html
<div class="invoice-content-header">
  <div class="amount-total date-amount">
    <img src="../../assets/images/note.svg" alt="notebook" />
    <div class="date-border">
      <p class="text-mute">{{ paymentDetails?.vouchers[0]?.number }}</p>
      <span class="mr-t5 d-block">{{ paymentDetails?.vouchers[0]?.dueDate }}</span>
    </div>
    <div class="balance-due">
      <p class="text-mute balance-txt">Balance Due</p>
      <span class="mr-t5 d-block balance-number">
        {{ paymentDetails?.currency?.symbol }} {{ paymentDetails?.vouchers[0]?.amount | number:
        '1.0-0' }}
      </span>
    </div>
  </div>
</div>
```

**Displays**:

- Invoice number
- Due date
- Balance due with currency symbol
- Formatted amount (no decimals)

---

### 6. Comments Section

#### For Unauthenticated Users (Read-Only)

**Condition**: `voucherComments?.length && !storeData.session?.id`

```html
<div class="comment-wrapper">
  <h3 class="text-muted">Comments :</h3>
  <ul class="list-unstyled" *ngFor="let comment of voucherComments">
    <li class="media">
      <div class="comment-time-web">
        <p class="font-sm text-muted">{{ comment?.dateString }}</p>
      </div>
      <div class="media-body">
        <p class="comment media-heading font-sm">
          {{ comment?.description }}
          <i class="text-muted">by {{ comment?.userName }}</i>
        </p>
      </div>
    </li>
  </ul>
</div>
```

#### For Authenticated Users (Interactive)

**Condition**: `storeData.session?.id`

```html
<div class="comment-container">
  <form [formGroup]="commentForm">
    <mat-form-field class="w-100" appearance="outline">
      <mat-label>Enter Your Comments</mat-label>
      <textarea
        rows="2"
        matInput
        placeholder="Enter Your Comments"
        formControlName="commentText"
        class="textarea-resize"
      >
      </textarea>
    </mat-form-field>
    <button mat-stroked-button color="primary" (click)="addComment()">Add Comment</button>
  </form>

  <div class="list-unstyled" *ngFor="let comment of voucherComments">
    <div class="media">
      <div class="comment-time-web">
        <p class="font-sm text-muted">{{ comment?.dateString }}</p>
      </div>
      <div class="media-body">
        <p class="comment media-heading font-sm">{{ comment?.description }}</p>
      </div>
      <div class="media-content">
        <i class="text-muted">by {{ comment?.userName }}</i>
      </div>
    </div>
  </div>
</div>
```

---

### 7. PDF Viewer

```html
<div class="pdf-wrapper mr-b50" *ngIf="sanitizedPdfFileUrl">
  <iframe #pdfContainer width="100%" height="100%" [src]="sanitizedPdfFileUrl"> </iframe>
</div>
```

**Features**:

- Full-width responsive display
- Embedded PDF viewer
- Print functionality via iframe
- Automatic cleanup on component destroy

---

## User Actions

### 1. Back to Invoices

**Function**: `backToInvoices()`

```typescript
public backToInvoices(): void {
  let url = `${this.storeData.domain}/${this.region}/invoice`;
  this.router.navigate([url]);
}
```

**Navigation**: `/PiyusssshhCompany/in/invoice`

---

### 2. Print Invoice

**Function**: `printVoucher()`

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

1. Get iframe window reference
2. Focus iframe
3. Trigger browser print dialog (200ms delay)

---

### 3. Download Invoice

**Function**: `downloadPdf(voucherUniqueName, voucherNumber)`

```typescript
public downloadPdf(voucherUniqueName: any, voucherNumber: any): void {
  let urlRequest = {
    accountUniqueName: this.invoiceListRequest.accountUniqueName,
    companyUniqueName: this.invoiceListRequest.companyUniqueName,
    sessionId: this.storeData.session?.id ?? '',
    voucherUniqueName: voucherUniqueName
  }

  this.invoiceService.downloadVoucher(urlRequest)
    .pipe(takeUntil(this.destroyed$))
    .subscribe((response: any) => {
      if (response) {
        let blob: Blob = this.generalService.base64ToBlob(
          response.body,
          'application/pdf',
          512
        );
        saveAs(blob, voucherNumber, 'application/pdf');
      }
    });
}
```

**Process**:

1. Call download API
2. Receive base64 PDF
3. Convert to Blob
4. Download with invoice number as filename

---

### 4. Add Comment

**Function**: `addComment()`

```typescript
public addComment(): void {
  const commentText = this.commentForm.get('commentText').value;
  if (commentText) {
    let urlRequest = {
      accountUniqueName: this.storeData.userDetails?.account?.uniqueName,
      companyUniqueName: this.storeData?.userDetails?.companyUniqueName,
      sessionId: this.storeData.session?.id,
      voucherUniqueName: this.voucherUniqueName
    }

    this.invoiceService.addComments(urlRequest, commentText)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        if (response && response.status === 'success') {
          this.commentForm.reset();
          this.generalService.showSnackbar('Comment successfully added', "success");
          // Refresh comments list
          this.getInvoiceComments();
        }
      });
  }
}
```

**Process**:

1. Get comment text from form
2. Submit to API
3. Show success message
4. Refresh comments list
5. Clear form

---

### 5. Pay Now

**Component**: `<pay-now>`

**Props**:

- `buttonText`: "Pay Now"
- `queryParams`: URL query parameters
- `paymentDetails`: Voucher details
- `paymentMethods`: Available payment gateways
- `storeData`: Session data
- `region`: Region code
- `paymentMethodValue`: Selected payment method
- `invoicePreview`: Boolean flag
- `returnInvoicePreview`: Return URL after payment

**Functionality**:

- Redirects to payment page
- Integrates with payment gateway
- Returns to invoice preview after payment

---

## Component State

### State Variables

```typescript
{
  isLoading: boolean,                    // Loading indicator
  paymentDetails: {                      // Voucher details
    vouchers: Array,
    currency: Object
  },
  voucherComments: Array,                // Comments list
  pdfFileURL: string,                    // Blob URL for PDF
  sanitizedPdfFileUrl: SafeResourceUrl,  // Sanitized URL for iframe
  paymentMethods: Object,                // Available payment gateways
  voucherUniqueName: string,             // Voucher ID
  commentForm: FormGroup,                // Comment form
  storeData: {                           // Session data
    session: { id, createAt, expiresAt },
    userDetails: { account, companyUniqueName, vendorContactUniqueName },
    domain: string,
    region: string
  },
  queryParams: Object,                   // URL query parameters
  urlParams: Object,                     // URL path parameters
  region: string,                        // Region code
  invoicePreview: boolean,               // Preview mode flag
  returnInvoicePreview: string           // Return URL
}
```

---

## Error Handling

### No Payment Method Configured

```typescript
if (!response.body?.RAZORPAY && !response.body?.PAYPAL && !response.body?.PAYU) {
  this.generalService.showSnackbar("No payment method is integrated", "warning");
}
```

### API Error Response

```typescript
if (response?.status === "error") {
  this.generalService.showSnackbar(response?.message);
}
```

### Payment Not Allowed

```html
<span class="error-message" *ngIf="!paymentDetails?.vouchers[0]?.canPay">
  {{ paymentDetails?.vouchers[0]?.message }}
</span>
```

### Missing Session (Optional)

```typescript
if (!this.storeData?.session?.id) {
  // Show login button
  this.loginButtonScriptLoaded();
}
```

---

## Key Features

| Feature              | Description                          | Auth Required |
| -------------------- | ------------------------------------ | ------------- |
| **View Invoice PDF** | Display invoice in embedded viewer   | No            |
| **Download PDF**     | Download invoice as PDF file         | No            |
| **Print Invoice**    | Print invoice via browser dialog     | No            |
| **View Comments**    | Read existing comments               | No            |
| **Add Comments**     | Post new comments                    | Yes           |
| **Pay Invoice**      | Make payment via gateway             | Yes           |
| **Payment Methods**  | Auto-detect available gateways       | No            |
| **Deep Linking**     | Preserve URL for post-login redirect | No            |

---

## Dependencies

### Angular Modules

- `@angular/router` - Route parameter extraction
- `@angular/forms` - Reactive forms for comments
- `@angular/material` - UI components
- `@angular/platform-browser` - DomSanitizer

### Third-Party Libraries

- `rxjs` - Observable-based async operations
- `file-saver` - PDF download functionality
- `@ngrx/store` - State management

### External Services

- Proxy authentication script
- Payment gateway integrations (Razorpay/PayPal/PayU)

---

## Security Considerations

### 1. URL Sanitization

```typescript
this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
```

### 2. Session Validation

- Session ID validated on every API call
- Session expiry handled automatically
- Redirect to login on session expiry

### 3. Public Access Control

- No sensitive data exposed without authentication
- Comments read-only for unauthenticated users
- Payment actions require valid session

### 4. URL Encoding

```typescript
encodeURIComponent(params.companyUniqueName);
encodeURIComponent(params.accountUniqueName);
```

---

## Performance Optimizations

### 1. Lazy Loading

```typescript
loadChildren: () =>
  import("./invoice-preview/invoice-preview.module").then((module) => module.InvoicePdfModule);
```

### 2. Parallel API Calls

```typescript
combineLatest([
  this.invoiceService.getVoucherDetails(request),
  this.invoiceService.getInvoiceComments(request),
]).subscribe(([voucherResponse, commentsResponse]) => {
  // Handle both responses
});
```

### 3. Memory Cleanup

```typescript
URL.revokeObjectURL(this.pdfFileURL);  // Clean up blob URLs

public ngOnDestroy(): void {
  this.destroyed$.next(true);
  this.destroyed$.complete();
}
```

---

## Testing Scenarios

### Test Case 1: Unauthenticated User

1. Navigate to invoice preview URL
2. Verify login button displayed
3. Verify PDF loads
4. Verify comments are read-only
5. Verify Pay Now button hidden

### Test Case 2: Authenticated User

1. Login and navigate to invoice preview
2. Verify all buttons visible
3. Verify comment form displayed
4. Add comment and verify success
5. Verify payment button visible (if canPay = true)

### Test Case 3: Payment Not Allowed

1. Navigate to paid invoice
2. Verify error message displayed
3. Verify Pay Now button hidden
4. Verify PDF and comments still accessible

### Test Case 4: Download/Print

1. Click download button
2. Verify PDF downloads with correct filename
3. Click print button
4. Verify browser print dialog opens

### Test Case 5: Deep Linking

1. Access invoice preview without login
2. Click login button
3. Complete authentication
4. Verify redirect back to invoice preview

---

## Troubleshooting

### Issue: PDF Not Displaying

**Possible Causes**:

- Invalid base64 content
- CORS issues
- Browser security restrictions

**Solution**:

1. Check base64 content in response
2. Verify DomSanitizer usage
3. Check browser console for errors

### Issue: Comments Not Loading

**Possible Causes**:

- Invalid session ID
- Network error
- Incorrect voucher unique name

**Solution**:

1. Verify session ID in request headers
2. Check network tab for API response
3. Verify voucher unique name matches

### Issue: Payment Button Not Showing

**Possible Causes**:

- `canPay` flag is false
- No payment method configured
- User not authenticated

**Solution**:

1. Check `paymentDetails.vouchers[0].canPay` value
2. Verify payment methods API response
3. Check session status

---

## Future Enhancements

1. **Offline Support**: Cache PDFs for offline viewing
2. **Multi-language**: Support for multiple languages
3. **Email Invoice**: Send invoice via email
4. **Share Link**: Generate shareable link
5. **Payment History**: Show payment history on invoice
6. **Bulk Download**: Download multiple invoices
7. **Invoice Comparison**: Compare multiple invoices
8. **Auto-refresh**: Auto-refresh comments

---

## Related Documentation

- [Proxy Authentication Flow](./PROXY_AUTH_FLOW.mdx)
- [API Documentation](./API_DOCUMENTATION.md)
- [Payment Integration Guide](./PAYMENT_INTEGRATION.md)
- [Session Management](./SESSION_MANAGEMENT.md)

---

**Last Updated**: January 13, 2026  
**Version**: 1.0  
**Maintainer**: Development Team
