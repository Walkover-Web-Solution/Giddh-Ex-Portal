import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { InvoiceService } from "../services/invoice.service";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { saveAs } from 'file-saver';
import { DomSanitizer } from "@angular/platform-browser";
import { FormBuilder, FormControl, UntypedFormGroup } from "@angular/forms";
import { select, Store } from '@ngrx/store';
import { PAGINATION_LIMIT, PAYMENT_METHODS_ENUM } from "../app.constant";
import { GeneralService } from "../services/general.service";
import { environment } from "src/environments/environment";
import { setFolderData } from "../store/actions/session.action";
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
    /** Holds url parameters */
    public urlParams: any = {};
    /** Holds query parameters */
    public queryParams: any = {};
    /** True if it is mobile screen */
    public isMobileScreen: boolean = false;
    /** Hold proxy button  id */
    public loginId = environment.proxyReferenceId;
    /** Hold current url*/
    public url: string = '';
    /** Hold region */
    public region: string = "";
    /** Holds invoice preview */
    public invoicePreview: boolean = true;
    /** Holds payment methods */
    public paymentMethods: any[] = [];
    /** Holds return url for invoice preview */
    public returnInvoicePreview: string = '';
    /** Holds payment method value */
    public paymentMethodValue: FormControl = new FormControl('');

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

        combineLatest([this.route.queryParams, this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && !this.storeData?.session) {
                this.queryParams = response[0];
                this.urlParams = response[1];
                this.storeData = response[2]['folderName'][this.urlParams?.companyDomainUniqueName];
                this.region = this.storeData?.region ?? response[1]?.region;
                if (!this.storeData?.session?.id) {
                    this.storeData = {
                        session: {
                            createAt: null,
                            expiresAt: null,
                            id: null
                        },
                        domain: this.urlParams.companyDomainUniqueName,
                        sidebarState: true,
                        redirectUrl: this.storeData?.redirectUrl,
                        region: response[1]?.region
                    }
                    this.loginButtonScriptLoaded();
                }
                if (this.urlParams?.accountUniqueName || this.queryParams?.accountUniqueName) {
                    this.getPaymentMethods();
                }
                const routerState = (this.route as any)._routerState?.snapshot?.url;
                const updatedUrl = routerState.replace('/' + this.storeData.domain, '');
                this.returnInvoicePreview = updatedUrl;
                this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { redirectUrl: updatedUrl, region: response[1]?.region } }));
            }
        });
        if (this.queryParams.voucher) {
            this.getPaymentMethods();
        }
    }

    /**
     * This will be use for invoice preview success
     *
     * @memberof InvoicePreviewComponent
     */
    public onInvoicePreviewSuccess(): void {
        this.invoicePreview = false;
        this.getVoucherDetails();
    }

    /**
 *  This will be use for login button script loading
 *
 * @memberof InvoicePreviewComponent
 */
    public loginButtonScriptLoaded(): void {
        this.url = `/${this.storeData.domain}/${this.region}/auth`;
        setTimeout(() => {
            let configuration = {
                referenceId: environment.proxyReferenceId,
                addInfo: {
                    redirect_path: this.url
                },
                success: (data: any) => {
                },
                failure: (error: any) => {
                    this.generalService.showSnackbar(error?.message);
                }
            };
            const routerState = (this.route as any)._routerState?.snapshot?.url;
            const updatedUrl = routerState.replace('/' + this.storeData.domain, '');
            this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { redirectUrl: updatedUrl, domain: this.storeData.domain } }));
            this.generalService.loadScript(environment.proxyReferenceId, configuration);
        }, 200)
    }

    /**
   * This will be use for get payment methods
   *
   * @private
   * @memberof InvoicePreviewComponent
   */
    private getPaymentMethods(): void {
        this.isLoading = true;
        const accountUniqueName = this.storeData.userDetails?.account.uniqueName ?? this.queryParams?.accountUniqueName;
        const companyUniqueName = this.storeData.userDetails?.companyUniqueName ?? this.queryParams.companyUniqueName;
        const request = { accountUniqueName, companyUniqueName, sessionId: this.storeData.session?.id };
        this.invoiceService.getPaymentMethods(request).pipe(takeUntil(this.destroyed$)).subscribe(response => {
            this.isLoading = false;
            if (response && response.status === 'success') {
                this.paymentMethods = response.body;
                if (response.body?.RAZORPAY) {
                    this.getVoucherDetails();
                    this.paymentMethodValue.setValue(this.paymentMethodEnum.RAZORPAY);
                } else if (response.body?.PAYPAL) {
                    this.getVoucherDetails();
                    this.paymentMethodValue.setValue(this.paymentMethodEnum.PAYPAL);
                } else if (response.body?.PAYU) {
                    this.getVoucherDetails();
                    this.paymentMethodValue.setValue(this.paymentMethodEnum.PAYU);
                } else {
                    this.getVoucherDetails();
                    this.generalService.showSnackbar('No payment method is integrated', 'warning');
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
    public getVoucherDetails(): void {
        this.isLoading = true;
        this.changeDetectionRef.detectChanges();
        let request;
        this.voucherUniqueName = this.queryParams.voucherUniqueName ?? this.queryParams.voucher;
        this.invoiceListRequest.accountUniqueName = this.queryParams.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName;
        this.invoiceListRequest.companyUniqueName = this.queryParams.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName;
        this.invoiceListRequest.sessionId = this.storeData.session?.id;
        this.invoiceListRequest.uniqueNames = this.queryParams.voucherUniqueName ?? this.queryParams.voucher;

        request = { accountUniqueName: this.invoiceListRequest.accountUniqueName, voucherUniqueName: [this.invoiceListRequest.uniqueNames], companyUniqueName: this.invoiceListRequest.companyUniqueName, sessionId: this.storeData.session?.id};

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
        let url = `${this.storeData.domain}/${this.region}/invoice`;
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
     * This will be use for component destroyed
     *
     * @memberof InvoicePreviewComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
