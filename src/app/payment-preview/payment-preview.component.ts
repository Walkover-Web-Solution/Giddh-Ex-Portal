import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PaymentService } from "../services/payment.service.";
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import { MatSnackBar } from "@angular/material/snack-bar";
import { select, Store } from '@ngrx/store';
@Component({
  selector: "payment-preview",
  templateUrl: "payment-preview.component.html",
  styleUrls: ["payment-preview.component.scss"]
})
export class PaymentPreviewComponent implements OnInit, OnDestroy {
  /** Instance of PDF container iframe */
  @ViewChild('pdfContainer', { static: false }) pdfContainer: ElementRef;
  /** True if api call in progress */
  public isLoading: boolean = false;
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
  /** Hold  store data */
  public storeData: any = {};

  constructor(
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private store: Store
  ) {
    this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
      this.storeData = sessionState.session;
    });
  }

  /**
   * This will be use for component initialization
   *
   * @memberof PaymentPreviewComponent
   */
  public ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.voucherUniqueName = params.voucher;
      }
    });
    this.getPaymentDetails();
  }

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
      .subscribe(
        (voucherDetailsResponse: any) => {
          this.isLoading = false;
          if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
            this.isLoading = false;
            this.paymentDetails = voucherDetailsResponse.body;
            let blob = this.paymentService.base64ToBlob(voucherDetailsResponse.body, 'application/pdf', 512);
            const file = new Blob([blob], { type: 'application/pdf' });
            URL.revokeObjectURL(this.pdfFileURL);
            this.pdfFileURL = URL.createObjectURL(file);
            this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
          } else {
            this.isLoading = false;
            this.showSnackbar(voucherDetailsResponse?.message);
          }
        });
  }

  /**
 * This will be use for  download pdf file
 *
 * @param {*} item
 * @memberof PaymentPreviewComponent
 */
  public downloadPdf(voucherUniqueName: any, voucherNumber: any): void {
    let urlRequest = {
      accountUniqueName: this.storeData.userDetails.account.uniqueName,
      companyUniqueName: this.storeData.userDetails.companyUniqueName,
      sessionId: this.storeData.session.id,
      voucherUniqueName: voucherUniqueName
    }
    this.paymentService.downloadVoucher(urlRequest)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (response: any) => {
          if (response) {
            let blob: Blob = this.paymentService.base64ToBlob(response.body, 'application/pdf', 512);
            saveAs(blob, voucherNumber, 'application/pdf');
          } else {
            this.showSnackbar(response?.message);
          }
        });
  }

  /**
   * This will be use for back to invoice
   *
   * @memberof PaymentPreviewComponent
   */
  public backToInvoices(): void {
    let url = this.storeData.domain + '/payment';
    this.router.navigate([url]);
  }

  /**
   * This will be use for print voucher pdf
   *
   * @memberof PaymentPreviewComponent
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
 * @memberof PaymentPreviewComponent
 */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
   * This will be use for component destroyed
   *
   * @memberof PaymentPreviewComponent
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}