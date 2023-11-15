import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { InvoiceService } from "../services/invoice.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormBuilder, UntypedFormGroup } from "@angular/forms";

@Component({
  selector: "invoice-pdf",
  templateUrl: "invoice-pdf.component.html",
  styleUrls: ["invoice-pdf.component.scss"]
})
export class InvoicePdfComponent implements OnInit, OnDestroy {
  /** Instance of PDF container iframe */
  @ViewChild('pdfContainer', { static: false }) pdfContainer: ElementRef;
  /** True if api call in progress */
  public isLoading: boolean;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Hold invoice response table data */
  public invoiceListData: any[] = [];
  /** PDF src */
  public pdfFileURL: any = '';
  /** PDF file url created with blob */
  public sanitizedPdfFileUrl: any = null;
  /** Hold voucher uniquename*/
  public voucherUniqueName: any = '';
  /** Hold payment id*/
  public paymentId: string = '';
  /** Hold selected paymentvoucher */
  public selectedPaymentVoucher: any[] = [];
  /** Hold razorpay elements*/
  public razorpay: any;
  /** Hold payment details*/
  public paymentDetails: any;
  /** This will be use for invoice url params request*/
  public invoiceListRequest: any = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
    type: 'sales',
    page: 1,
    count: 50,
    sortBy: 'ASC',
    sort: '',
    balanceStatus: []
  };
  /** Hold voucher comments */
  public voucherComments: any[] = [];
  /** Comment form */
  public commentForm: UntypedFormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder
  ) {

  }

  /**
   * This will be use for component initialization
   *
   * @memberof InvoicePdfComponent
   */
  public ngOnInit(): void {
    this.commentForm = this.formBuilder.group({
      commentText: ['']
    });
    this.isLoading = true;
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.voucherUniqueName = params.voucher;
        let data = JSON.parse(localStorage.getItem('session'));
        this.invoiceListRequest.accountUniqueName = data.userDetails.account.uniqueName;
        this.invoiceListRequest.companyUniqueName = data.userDetails.companyUniqueName;
        this.invoiceListRequest.sessionId = data.session.id;
        let request = { accountUniqueName: data.userDetails.account.uniqueName, voucherUniqueName: params.voucher, companyUniqueName: data.userDetails.companyUniqueName, sessionId: data.session.id };
        combineLatest([
          this.invoiceService.getInvoiceList(this.invoiceListRequest),
          this.invoiceService.getVoucherDetails(request),
          this.invoiceService.getInvoiceComments(request)
        ]).pipe(takeUntil(this.destroyed$)).subscribe(([invoiceListResponse, voucherDetailsResponse, commentsResponse]) => {
          if (invoiceListResponse && invoiceListResponse.status === 'success') {
            this.isLoading = false;
            this.selectedPaymentVoucher = invoiceListResponse.body.items.filter(invoice => invoice.uniqueName === params?.voucher);
          } else {
            this.isLoading = false;
            this.showSnackbar(invoiceListResponse?.message);
          }
          if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
            this.paymentDetails = voucherDetailsResponse.body[0];
            let blob = this.invoiceService.base64ToBlob(voucherDetailsResponse.body[0].content, 'application/pdf', 512);
            const file = new Blob([blob], { type: 'application/pdf' });
            URL.revokeObjectURL(this.pdfFileURL);
            this.pdfFileURL = URL.createObjectURL(file);
            this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
            this.isLoading = false;
            this.paymentDetails = voucherDetailsResponse.body[0];
          } else {
            this.isLoading = false;
            this.showSnackbar(voucherDetailsResponse?.message);
          }
          if (commentsResponse && commentsResponse.status === 'success') {
            this.isLoading = false;
            this.voucherComments = commentsResponse.body;
          } else {
            this.isLoading = false;
            this.showSnackbar(commentsResponse?.message);
          }
        });
      }
    });
  }
  /**
 * This will be use for  download pdf file
 *
 * @param {*} item
 * @memberof InvoicePdfComponent
 */
  public downloadPdf(voucherUniqueName: any, voucherNumber: any): void {
    let data = JSON.parse(localStorage.getItem('session'));
    let urlRequest = {
      accountUniqueName: data.userDetails.account.uniqueName,
      companyUniqueName: data.userDetails.companyUniqueName,
      sessionId: data.session.id,
      voucherUniqueName: voucherUniqueName
    }
    this.invoiceService.downloadVoucher(urlRequest)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (response: any) => {
          if (response) {
            let blob: Blob = this.invoiceService.base64ToBlob(response.body, 'application/pdf', 512);
            saveAs(blob, voucherNumber, 'application/pdf');
          } else {
            this.showSnackbar(response?.message);
          }
        });
  }

  /**
   * This will be use for back to invoice
   *
   * @memberof InvoicePdfComponent
   */
  public backToInvoices(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    let url = data.domain + '/invoice';
    this.router.navigate([url]);
  }

  /**
   * This will be use for print voucher pdf
   *
   * @memberof InvoicePdfComponent
   */
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

  /**
 * This will be use for show snack bar
 *
 * @param {string} message
 * @return {*}
 * @memberof InvoicePdfComponent
 */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
   * This will be use for initialize payment method
   *
   * @param {*} paymentRequest
   * @memberof InvoicePdfComponent
   */
  public initializePayment(paymentRequest: any): void {
    let that = this;
    let options = {
      key: "rzp_test_aWNTpuTtWRMJ9u", // razor pay key
      image: 'data:image/png;base64,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',
      handler: function (res) {
        that.createPaidPlanCompany(res);
      },
      order_id: paymentRequest.orderId,
      theme: {
        color: '#F37254'
      },
      amount: paymentRequest.amount,
      currency: paymentRequest.currency?.code,
      name: 'GIDDH',
      description: 'Walkover Technologies Private Limited.'
    };
    try {
      this.razorpay = new window['Razorpay'](options);
      setTimeout(() => {
        this.razorpay?.open();
      }, 100);
    } catch (exception) { }
  }

  /**
   * This will be use for create paid plan company
   *
   * @param {*} razorPayResponse
   * @memberof InvoicePdfComponent
   */
  public createPaidPlanCompany(razorPayResponse: any): void {
    if (razorPayResponse) {
      if (this.paymentDetails.contentType === "invoice") {
        let payload;
        let today = new Date();
        let dd: any = today.getDate();
        let mm: any = today.getMonth() + 1;
        let yyyy = today.getFullYear();

        if (dd < 10) {
          dd = "0" + dd;
        }
        if (mm < 10) {
          mm = "0" + mm;
        }
        var date = dd + "-" + mm + "-" + yyyy;

        payload = {
          paymentId: razorPayResponse.razorpay_payment_id,
          amount: this.paymentDetails.amount,
          date: date
        };

        // payInvoiceGiddh(
        //     "/company/" +
        //     this.paymentDetails.company.uniqueName +
        //     "/invoices/" +
        //     this.paymentDetails.contentNumber +
        //     "/pay?voucherVersion=2",
        //     payload
        // );
      }
    }
  }

  /**
   * This will be use for add comment
   *
   * @memberof InvoicePdfComponent
   */
  public addComment(): void {
    const commentText = this.commentForm.get('commentText').value;
    let data = JSON.parse(localStorage.getItem('session'));
    let urlRequest = {
      accountUniqueName: data.userDetails.account.uniqueName,
      companyUniqueName: data.userDetails.companyUniqueName,
      sessionId: data.session.id,
      voucherUniqueName: this.voucherUniqueName
    }
    this.invoiceService.addComments(urlRequest, commentText).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      if (response && response.status === 'success') {
        this.commentForm.reset();
        this.showSnackbar('Comment successfully added');
        this.invoiceService.getInvoiceComments(urlRequest).pipe(takeUntil(this.destroyed$)).subscribe((commentsResponse: any) => {
          if (commentsResponse && commentsResponse.status === 'success') {
            this.voucherComments = commentsResponse.body;
          } else {
            this.showSnackbar(commentsResponse?.message);
          }
        });
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }

  /**
   * This will be use for component destroyed
   *
   * @memberof InvoicePdfComponent
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
