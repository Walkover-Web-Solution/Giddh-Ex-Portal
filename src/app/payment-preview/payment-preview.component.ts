import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PaymentService } from "../services/payment.service.";
import { saveAs } from 'file-saver';
import { select, Store } from '@ngrx/store';
import { PAGINATION_LIMIT } from "../app.constant";
import { GeneralService } from "../services/general.service";

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
    /** Hold invocie url request */
    public paymentListRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'receipt',
        page: 1,
        count: PAGINATION_LIMIT,
        sortBy: 'grandTotal',
        sort: 'asc',
        balanceStatus: [],
        uniqueNames: []
    }
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private generalService: GeneralService,
        private paymentService: PaymentService,
        private router: Router,
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private store: Store
    ) {

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
        this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
            if (sessionState.session) {
                this.storeData = sessionState.session;
                this.getPaymentDetails();
            }
        });
    }

    /**
     * Get payment details
     *
     * @memberof PaymentPreviewComponent
     */
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
                        this.getInvoiceList();
                        this.isLoading = false;
                        this.paymentDetails = voucherDetailsResponse.body;
                        let blob = this.generalService.base64ToBlob(voucherDetailsResponse.body, 'application/pdf', 512);
                        const file = new Blob([blob], { type: 'application/pdf' });
                        URL.revokeObjectURL(this.pdfFileURL);
                        this.pdfFileURL = URL.createObjectURL(file);
                        this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
                    } else {
                        this.isLoading = false;
                        this.generalService.showSnackbar(voucherDetailsResponse?.message);
                    }
                });
    }

    /**
     * This will be use for get receipt list
     *
     * @memberof PaymentPreviewComponent
     */
    public getInvoiceList(): void {
        this.paymentListRequest.accountUniqueName = this.storeData.userDetails.account.uniqueName;
        this.paymentListRequest.companyUniqueName = this.storeData.userDetails.companyUniqueName;
        this.paymentListRequest.sessionId = this.storeData.session.id;
        this.paymentListRequest.uniqueNames = this.voucherUniqueName;
        this.isLoading = true;
        this.paymentService.getInvoiceList(this.paymentListRequest).pipe(takeUntil(this.destroyed$)).subscribe((invoiceListResponse: any) => {
            this.isLoading = false;
            if (invoiceListResponse && invoiceListResponse.status === 'success') {
                this.selectedPaymentVoucher = invoiceListResponse.body.items.filter(invoice => invoice.uniqueName === this.voucherUniqueName);
            } else {
                this.generalService.showSnackbar(invoiceListResponse?.message);
            }
        });
    }

    /**
     * This will be use for download pdf file
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
                        let blob: Blob = this.generalService.base64ToBlob(response.body, 'application/pdf', 512);
                        saveAs(blob, voucherNumber, 'application/pdf');
                    } else {
                        this.generalService.showSnackbar(response?.message);
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
     * This will be use for component destroyed
     *
     * @memberof PaymentPreviewComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
