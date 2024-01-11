import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { InvoiceService } from "../services/invoice.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { saveAs } from 'file-saver';
import { DomSanitizer } from "@angular/platform-browser";
import { FormBuilder, UntypedFormGroup } from "@angular/forms";
import { select, Store } from '@ngrx/store';
import { PAGINATION_LIMIT, PAYMENT_METHODS_ENUM } from "../app.constant";
import { GeneralService } from "../services/general.service";
declare var initVerification: any;
@Component({
    selector: "invoice-preview",
    templateUrl: "invoice-preview.component.html",
    styleUrls: ["invoice-preview.component.scss"]
})
export class InvoicePreviewComponent implements OnInit, OnDestroy {
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
    /** Hold payment details*/
    public paymentDetails: any;
    /** This will be use for invoice url params request*/
    public invoiceListRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'sales',
        page: 1,
        count: PAGINATION_LIMIT,
        sortBy: 'ASC',
        sort: '',
        balanceStatus: []
    };
    /** Hold voucher comments */
    public voucherComments: any[] = [];
    /** Comment form */
    public commentForm: UntypedFormGroup;
    /** Hold  store data */
    public storeData: any = {};
    /** Holds payment methods */
    public paymentMethodEnum: any = PAYMENT_METHODS_ENUM;

    constructor(
        private generalService: GeneralService,
        private invoiceService: InvoiceService,
        private router: Router,
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private store: Store,
        private changeDetectionRef: ChangeDetectorRef
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof InvoicePreviewComponent
     */
    public ngOnInit(): void {
        this.commentForm = this.formBuilder.group({
            commentText: ['']
        });

        combineLatest([this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && !this.storeData?.session) {
                this.storeData = response[1]['folderName'][response[0].companyDomainUniqueName];
                this.getPaymentMethods();
            }
        });
    }

    /**
   * This will be use for get payment methods
   *
   * @private
   * @memberof InvoicePayComponent
   */
    private getPaymentMethods(): void {
        this.isLoading = true;
        const accountUniqueName = this.storeData.userDetails?.account.uniqueName;
        const companyUniqueName = this.storeData.userDetails?.companyUniqueName;
        const request = { accountUniqueName: accountUniqueName, companyUniqueName: companyUniqueName, sessionId: this.storeData.session?.id };
        this.invoiceService.getPaymentMethods(request).pipe(takeUntil(this.destroyed$)).subscribe(response => {
            this.isLoading = false;
            if (response && response.status === 'success') {
                if (response.body?.RAZORPAY) {
                    this.getVoucherDetails(this.paymentMethodEnum.RAZORPAY);
                } else if (response.body?.PAYPAL) {
                    this.getVoucherDetails(this.paymentMethodEnum.PAYPAL);
                } else {
                    this.getVoucherDetails();
                    this.generalService.showSnackbar('warning', 'No payment method is integrated');
                }
            } else {
                this.generalService.showSnackbar(response?.message);
            }
        });
    }

    /**
     * Get voucher details
     *
     * @public
     * @memberof InvoicePreviewComponent
     */
    public getVoucherDetails(paymentType?: string): void {
        this.isLoading = true;
        this.changeDetectionRef.detectChanges();
        let request;
        this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
            this.voucherUniqueName = params.voucherUniqueName ?? params.voucher;
            this.invoiceListRequest.accountUniqueName = params.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName;
            this.invoiceListRequest.companyUniqueName = params.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName;
            this.invoiceListRequest.sessionId = this.storeData.session?.id;
            this.invoiceListRequest.uniqueNames = params.voucherUniqueName ?? params.voucher;

            request = { accountUniqueName: this.invoiceListRequest.accountUniqueName, voucherUniqueName: [this.invoiceListRequest.uniqueNames], companyUniqueName: this.invoiceListRequest.companyUniqueName, sessionId: this.storeData.session?.id, paymentMethod: 'RAZORPAY' };

            combineLatest([
                this.invoiceService.getVoucherDetails(request),
                this.invoiceService.getInvoiceComments(request)
            ]).pipe(takeUntil(this.destroyed$))?.subscribe(([voucherDetailsResponse, commentsResponse]) => {
                this.isLoading = false;

                if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
                    this.paymentDetails = voucherDetailsResponse.body;
                    let blob = this.generalService.base64ToBlob(voucherDetailsResponse.body?.vouchers[0]?.content, 'application/pdf', 512);
                    URL.revokeObjectURL(this.pdfFileURL);
                    this.pdfFileURL = URL.createObjectURL(blob);
                    this.sanitizedPdfFileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfFileURL);
                } else {
                    if (voucherDetailsResponse?.status === 'error') {
                        this.generalService.showSnackbar(voucherDetailsResponse?.message);
                    }
                }
                if (commentsResponse && commentsResponse.status === 'success') {
                    this.voucherComments = commentsResponse.body;
                } else {
                    if (commentsResponse?.status === 'error') {
                        this.generalService.showSnackbar(commentsResponse?.message);
                    }
                }

                this.changeDetectionRef.detectChanges();
            });
        });
    }

    /**
     * This will be use for  download pdf file
     *
     * @param {*} item
     * @memberof InvoicePreviewComponent
     */
    public downloadPdf(voucherUniqueName: any, voucherNumber: any): void {
        let urlRequest = {
            accountUniqueName: this.invoiceListRequest.accountUniqueName,
            companyUniqueName: this.invoiceListRequest.companyUniqueName,
            sessionId: this.storeData.session.id,
            voucherUniqueName: voucherUniqueName
        }
        this.invoiceService.downloadVoucher(urlRequest)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                (response: any) => {
                    if (response) {
                        let blob: Blob = this.generalService.base64ToBlob(response.body, 'application/pdf', 512);
                        saveAs(blob, voucherNumber, 'application/pdf');
                    } else {
                        if (response?.status === 'error') {
                            this.generalService.showSnackbar(response?.message);
                        }
                    }
                });
    }

    /**
     * This will be use for back to invoice
     *
     * @memberof InvoicePreviewComponent
     */
    public backToInvoices(): void {
        let url = this.storeData.domain + '/invoice';
        this.router.navigate([url]);
    }

    /**
     * This will be use for print voucher pdf
     *
     * @memberof InvoicePreviewComponent
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
     * This will be use for add comment
     *
     * @memberof InvoicePreviewComponent
     */
    public addComment(): void {
        const commentText = this.commentForm.get('commentText').value;
        if (commentText) {
            let urlRequest = {
                accountUniqueName: this.storeData.userDetails?.account?.uniqueName,
                companyUniqueName: this.storeData?.userDetails?.companyUniqueName,
                sessionId: this.storeData.session?.id,
                voucherUniqueName: this.voucherUniqueName
            }
            this.invoiceService.addComments(urlRequest, commentText).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                if (response && response.status === 'success') {
                    this.commentForm.reset();
                    this.generalService.showSnackbar('Comment successfully added', "success");
                    this.invoiceService.getInvoiceComments(urlRequest).pipe(takeUntil(this.destroyed$)).subscribe((commentsResponse: any) => {
                        if (commentsResponse && commentsResponse.status === 'success') {
                            this.voucherComments = commentsResponse.body;
                        } else {
                            if (commentsResponse?.status === 'error') {
                                this.generalService.showSnackbar(commentsResponse?.message);
                            }
                        }
                    });
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for redirecting to pay now
     *
     * @param {*} details
     * @memberof InvoicePreviewComponent
     */
    public redirectToPayNow(details: any): void {
        let url = '/' + this.storeData.domain + '/invoice-pay/account/' + this.storeData.userDetails?.account?.uniqueName + '/voucher/' + details?.vouchers[0]?.uniqueName;
        this.router.navigate([url]);
    }

    /**
     * This will be use for component destroyed
     *
     * @memberof InvoicePreviewComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
