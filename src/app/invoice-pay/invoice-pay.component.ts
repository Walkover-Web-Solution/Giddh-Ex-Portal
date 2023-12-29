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
import { FormBuilder, UntypedFormGroup } from "@angular/forms";
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
    /** Instance of razaor pay*/
    public razorpay: any;
    /** Hold payment details*/
    public paymentDetails: any;
    /** Hold  store data */
    public storeData: any = {};
    /** Hold  is expanded */
    public isExpanded = true;
    /** Hold  panel open state*/
    public panelOpenState: boolean = true;
    /** Show/Hide paypal form */
    public showPaypalForm: boolean = false;
    /** Paypal form instance */
    public paypalForm: UntypedFormGroup;
    /** True if payment method is paypal or razorpay*/
    public paymentMethodIntegrated: any = {
        razorpay: false,
        paypal: false
    };
    /** Show/Hide  payment button from can pay */
    public canPayInvoice: boolean;
    /** Hold paid invoice message */
    public paidInvoiceMessage: any
    /** Hold active tab */
    public activeTab: any = "";
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
                if (!this.storeData?.session?.id) {
                    this.storeData = {
                        session: {
                            createAt: null,
                            expiresAt: null,
                            id: null
                        },
                        domain: this.urlParams.companyDomainUniqueName,
                        sidebarState: true
                    }
                    this.loginButtonScriptLoaded();
                }
                if (this.urlParams?.accountUniqueName) {
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
        this.url = `/${this.storeData.domain}/auth`;
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
                if (response.body?.RAZORPAY) {
                    this.getVoucherDetails(PAYMENT_METHODS_ENUM.RAZORPAY);
                } else if (response.body?.PAYPAL) {
                    this.getVoucherDetails(PAYMENT_METHODS_ENUM.PAYPAL);
                } else {
                    this.generalService.showSnackbar('warning', 'No payment method is integrated');
                }
                this.paymentMethodIntegrated.razorpay = response.body?.RAZORPAY;
                this.paymentMethodIntegrated.paypal = response.body?.PAYPAL;
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
            const accountUniqueName = this.urlParams.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName;
            const companyUniqueName = this.queryParams.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName;
            const request = { accountUniqueName: accountUniqueName, voucherUniqueName: voucherUniqueNameArray, companyUniqueName: companyUniqueName, sessionId: this.storeData.session?.id, paymentMethod: paymentType, paymentId: this.queryParams?.payment_id };
            this.invoiceService.getVoucherDetails(request).pipe(takeUntil(this.destroyed$)).subscribe(voucherDetailsResponse => {
                this.isLoading = false;
                if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
                    this.paymentDetails = voucherDetailsResponse.body;

                    this.tabSelected(voucherDetailsResponse.body?.paymentGatewayType);
                    let hasPaidVouchers = voucherDetailsResponse.body?.vouchers?.filter(voucher => voucher.status === "PAID");
                    if (!hasPaidVouchers?.length) {
                        this.canPayInvoice = true;
                    } else {
                        const paidVoucherNumbers = hasPaidVouchers?.map(voucher => { return voucher?.number });
                        this.canPayInvoice = false;
                        const paidMessage = paidVoucherNumbers?.length > 1 ? " are" : " is";
                        this.paidInvoiceMessage = paidVoucherNumbers.join(", ") + paidMessage + " already PAID.";
                    }

                    if (this.queryParams?.PayerID && this.canPayInvoice) {
                        this.canPayInvoice = false;
                        this.paymentDetails.vouchers[0].canPay = false;
                        this.paymentDetails.vouchers[0].message = "Invoice payment is being processed.";
                        this.paidInvoiceMessage = "Invoice payment is being processed.";
                    }
                } else {
                    this.generalService.showSnackbar(voucherDetailsResponse?.message);
                    this.backToInvoice();
                }
                this.changeDetectionRef.detectChanges();
            });
        }
    }

    /**
     * This wil be used for initialize payment
     *
     * @param {*} paymentRequest
     * @memberof InvoicePayComponent
     */
    public initializePayment(paymentRequest: any, type: PAYMENT_METHODS_ENUM): void {
        if (type === PAYMENT_METHODS_ENUM.PAYPAL) {
            if (paymentRequest.paymentGatewayType === PAYMENT_METHODS_ENUM.PAYPAL) {
                let returnUrl = document.URL;
                if (returnUrl.indexOf("payment_id") === -1) {
                    if (returnUrl.indexOf("?") > -1) {
                        returnUrl = returnUrl + "&payment_id=" + paymentRequest.paymentId;
                    } else {
                        returnUrl = returnUrl + "?payment_id=" + paymentRequest.paymentId;
                    }
                }

                this.paypalForm = this.formBuilder.group({
                    businessEmail: [paymentRequest.paymentKey],
                    itemName: [paymentRequest.vouchers[0]?.number],
                    custom: [''],
                    amount: [paymentRequest.totalAmount],
                    currencyCode: [paymentRequest.currency.code],
                    notifyUrl: [this.generalService.getPaypalIpnUrl(this.queryParams.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName, this.urlParams.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName, paymentRequest.paymentId)],
                    returnUrl: [returnUrl],
                    cancelReturnUrl: [document.URL]
                });

                this.showPaypalForm = true;

                setTimeout(() => {
                    document.forms['paypalForm'].submit();
                    this.showPaypalForm = false;
                }, 100);
            }
        } else if (paymentRequest.paymentGatewayType === PAYMENT_METHODS_ENUM.RAZORPAY) {
            let that = this;
            let options = {
                key: paymentRequest.paymentKey,
                image: 'data:image/png;base64,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',
                handler: function (res) {
                    that.handleVoucherPayment(res);
                },
                order_id: paymentRequest.orderId,
                theme: {
                    color: '#F37254'
                },
                amount: paymentRequest.totalAmount,
                currency: paymentRequest.currency?.code,
                name: this.storeData?.companyDetails?.name
            };
            try {
                this.razorpay = new window['Razorpay'](options);
                setTimeout(() => {
                    this.razorpay?.open();
                }, 100);
            } catch (exception) { }
        }
    }

    /**
     * Callback for tab change event
     *
     * @param {*} event
     * @memberof InvoicePayComponent
     */
    public tabChange(event: any): void {
        if (event?.tab?.textLabel === PAYMENT_METHODS_ENUM.RAZORPAY) {
            this.tabSelected(PAYMENT_METHODS_ENUM.RAZORPAY);
            this.getVoucherDetails(PAYMENT_METHODS_ENUM.RAZORPAY);
        }
        if (event?.tab?.textLabel === PAYMENT_METHODS_ENUM.PAYPAL) {
            this.tabSelected(PAYMENT_METHODS_ENUM.PAYPAL);
            this.getVoucherDetails(PAYMENT_METHODS_ENUM.PAYPAL);
        }
    }

    /**
     * This will be use for tab selected
     *
     * @param {(PAYMENT_METHODS_ENUM.RAZORPAY | PAYMENT_METHODS_ENUM.PAYPAL)} tabName
     * @memberof InvoicePayComponent
     */
    public tabSelected(tabName: PAYMENT_METHODS_ENUM.RAZORPAY | PAYMENT_METHODS_ENUM.PAYPAL): void {
        this.activeTab = tabName;
    }

    /**
     * This will be use for create paid plans.
     *
     * @param {*} razorPayResponse
     * @memberof InvoicePayComponent
     */
    public handleVoucherPayment(razorPayResponse: any): void {
        if (razorPayResponse && this.paymentDetails?.vouchers[0].contentType === "invoice") {
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
            let date = dd + "-" + mm + "-" + yyyy;

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
            this.invoiceService.payInvoice(payRequest, payload).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                if (response && response.status === 'success') {
                    this.generalService.showSnackbar(response?.body, "success");
                    this.getVoucherDetails(PAYMENT_METHODS_ENUM.RAZORPAY);
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for back to invoice
     *
     * @memberof InvoicePayComponent
     */
    public backToInvoice(): void {
        let url = this.storeData.domain + '/invoice';
        this.router.navigate([url]);
    }

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
