import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { takeUntil } from "rxjs/operators";
import { ReplaySubject, combineLatest } from "rxjs";
import { ReciptResponse } from "../models/Company";
import { ActivatedRoute, Router } from "@angular/router";
import { InvoiceService } from "../services/invoice.service";
import { select, Store } from '@ngrx/store';
import { PAYMENT_METHODS_ENUM } from "../app.constant";
import { GeneralService } from "../services/general.service";
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup, Validators } from "@angular/forms";
import { setFolderData } from "../store/actions/session.action";
import { BreakpointObserver } from "@angular/cdk/layout";
import { environment } from "src/environments/environment";

@Component({
    selector: "invoice-pay",
    templateUrl: "invoice-pay.component.html",
    styleUrls: ["invoice-pay.component.scss"]
})
export class InvoicePayComponent implements OnInit, OnDestroy {
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold voucher data */
    public voucherData: ReciptResponse;
    /** Hold payment id */
    public paymentId: string = '';
    /** Hold payment details*/
    public paymentDetails: any;
    /** Hold  store data */
    public storeData: any = {};
    /** Hold  is expanded */
    public isExpanded = true;
    /** Hold  panel open state*/
    public panelOpenState: boolean = true;
    /** Show/Hide  payment button from can pay */
    public canPayInvoice: boolean;
    /** Hold paid invoice message */
    public paidInvoiceMessage: any
    /** Hold decoded voucher uniqueNames  */
    public decodedVoucherUniqueNames: string[] = [];
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
    /** Holds payment options */
    public paymentOptions: Array<{ label: string, value: string, image: string }> = [
        { label: "Razorpay", value: "RAZORPAY", image: "https://github.com/razorpay/razorpay-payment-button/blob/master/demo/assets/razorpay-button1.png?raw=true" },
        { label: "Paypal", value: "PAYPAL", image: "https://www.paypalobjects.com/webstatic/en_US/i/buttons/checkout-logo-large.png" },
        { label: "PayU", value: "PAYU", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/PayU.svg/320px-PayU.svg.png" }
    ];
    public paymentMethodValue: FormControl = new FormControl('');
    public paymentMethods: any[] = [];

    constructor(
        public dialog: MatDialog,
        private invoiceService: InvoiceService,
        private generalService: GeneralService,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store,
        private formBuilder: FormBuilder,
        private changeDetectionRef: ChangeDetectorRef,
        private breakpointObserver: BreakpointObserver
    ) {
    }

    /**
     * This will be use for component initialization
     *
     * @memberof InvoicePayComponent
     */
    public ngOnInit(): void {
        this.breakpointObserver.observe([
            "(max-width: 576px)",
        ]).pipe(takeUntil(this.destroyed$)).subscribe(result => {
            this.isMobileScreen = result?.breakpoints["(max-width: 576px)"];
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
                        redirectUrl: this.storeData.redirectUrl
                    }
                    this.loginButtonScriptLoaded();
                }
                if (this.urlParams?.accountUniqueName || this.queryParams?.accountUniqueName) {
                    this.getPaymentMethods();
                }
            }
        });
    }

    /**
     *  This will be use for login button script loading
     *
     * @memberof InvoicePayComponent
     */
    public loginButtonScriptLoaded(): void {
        this.url = `/${this.storeData.domain}/${this.storeData?.region}/auth`;
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
            this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { domain: this.storeData.domain } }));
            this.generalService.loadScript(environment.proxyReferenceId, configuration);
        }, 200)
    }

    /**
     * This will be use for get payment methods
     *
     * @private
     * @memberof InvoicePayComponent
     */
    private getPaymentMethods(): void {
        this.isLoading = true;
        const accountUniqueName = this.urlParams.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName;
        const companyUniqueName = this.queryParams.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName;
        const request = { accountUniqueName: accountUniqueName, companyUniqueName: companyUniqueName, sessionId: this.storeData.session?.id };
        this.invoiceService.getPaymentMethods(request).pipe(takeUntil(this.destroyed$)).subscribe(response => {
            this.isLoading = false;
            if (response && response.status === 'success') {
                this.paymentMethods = response.body;
                this.paymentOptions= this.paymentOptions.filter(option => this.paymentMethods[option.value]);
                if (response.body?.RAZORPAY || response.body?.PAYPAL || response.body?.PAYU) {
                    if (response.body?.RAZORPAY) {
                        this.paymentMethodValue.setValue('RAZORPAY');
                    } else if (response.body?.PAYPAL) {
                        this.paymentMethodValue.setValue('PAYPAL');
                    } else if (response.body?.PAYU) {
                        this.paymentMethodValue.setValue('PAYU');
                    }
                    this.getVoucherDetails();
                } else {
                    this.generalService.showSnackbar('No payment method is integrated', 'warning');
                }
            } else {
                this.generalService.showSnackbar(response?.message);
            }
        });
    }

    /**
     * This will be use for get voucher details
     *
     * @private
     * @memberof InvoicePayComponent
     */
    private getVoucherDetails(paymentType?: string): void {
        this.isLoading = true;
        this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { sidebarState: !this.isMobileScreen } }));

        const voucherUniqueName = this.urlParams.voucherUniqueName || '';
        const voucherUniqueNameArray = voucherUniqueName.split('|');
        if (this.urlParams?.accountUniqueName) {
            const accountUniqueName = this.urlParams.accountUniqueName || this.storeData.userDetails?.account.uniqueName;
            const companyUniqueName = this.queryParams.companyUniqueName || this.storeData.userDetails?.companyUniqueName;
            const request = { accountUniqueName: accountUniqueName, voucherUniqueName: voucherUniqueNameArray, companyUniqueName: companyUniqueName, sessionId: this.storeData.session?.id, paymentMethod: paymentType, paymentId: this.queryParams?.payment_id };
            this.invoiceService.getVoucherDetails(request).pipe(takeUntil(this.destroyed$)).subscribe(voucherDetailsResponse => {
                this.isLoading = false;
                if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
                    this.paymentDetails = voucherDetailsResponse.body;

                    let hasPaidVouchers = voucherDetailsResponse.body?.vouchers?.filter(voucher => voucher.status === "PAID");
                    if (!hasPaidVouchers?.length) {
                        this.canPayInvoice = true;
                    } else {
                        const paidVoucherNumbers = hasPaidVouchers?.map(voucher => { return voucher?.number });
                        this.canPayInvoice = false;
                        const paidMessage = paidVoucherNumbers?.length > 1 ? " are" : " is";
                        this.paidInvoiceMessage = paidVoucherNumbers.join(", ") + paidMessage + " successfully paid.";
                    }

                    if (this.queryParams?.PayerID && this.canPayInvoice) {
                        this.canPayInvoice = false;
                        this.paymentDetails.vouchers[0].canPay = false;
                        this.paymentDetails.vouchers[0].message = "Invoice payment is being processed.";
                        this.paidInvoiceMessage = "Invoice payment is being processed.";
                    }
                } else {
                    this.generalService.showSnackbar(voucherDetailsResponse?.message);
                }
                this.changeDetectionRef.detectChanges();
            });
        }
    }

    /**
     * This will be use for back to invoice
     *
     * @memberof InvoicePayComponent
     */
    public backToInvoice(): void {
        let url = `${this.storeData.domain}/${this.region}/invoice`;
        this.router.navigate([url]);
    }



    /**
     * Callback for tab change event
     *
     * @param {*} event
     * @memberof InvoicePayComponent
     */
    // public tabChange(event: any): void {
    //     if (event?.tab?.textLabel === PAYMENT_METHODS_ENUM.RAZORPAY) {
    //         this.tabSelected(PAYMENT_METHODS_ENUM.RAZORPAY);
    //         // this.getVoucherDetails(PAYMENT_METHODS_ENUM.RAZORPAY, true, event?.tab?.textLabel);    
    //     }
    //     if (event?.tab?.textLabel === PAYMENT_METHODS_ENUM.PAYPAL) {
    //         this.tabSelected(PAYMENT_METHODS_ENUM.PAYPAL);
    //         // this.getVoucherDetails(PAYMENT_METHODS_ENUM.PAYPAL, true, event?.tab?.textLabel);
    //     }
    //     if (event?.tab?.textLabel === PAYMENT_METHODS_ENUM.PAYU) {
    //         this.tabSelected(PAYMENT_METHODS_ENUM.PAYU);
    //         // this.getVoucherDetails(PAYMENT_METHODS_ENUM.PAYU, true, event?.tab?.textLabel);
    //     }
    // }

    /**
     * This will be use for tab selected
     *
     * @param {(PAYMENT_METHODS_ENUM.RAZORPAY | PAYMENT_METHODS_ENUM.PAYPAL | PAYMENT_METHODS_ENUM.PAYU)} tabName
     * @memberof InvoicePayComponent
     */
    // public tabSelected(tabName: PAYMENT_METHODS_ENUM.RAZORPAY | PAYMENT_METHODS_ENUM.PAYPAL | PAYMENT_METHODS_ENUM.PAYU): void {
    //     this.activeTab = tabName;
    // }




    /**
     * This will be use for component destroy
     *
     * @memberof InvoicePayComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    /**
     * This will be use for toggle panel
     *
     * @memberof InvoicePayComponent
     */
    public togglePanel(): void {
        this.panelOpenState = !this.panelOpenState;
    }
}
