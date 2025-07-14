import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { takeUntil } from "rxjs/operators";
import { ReplaySubject, combineLatest } from "rxjs";
import { ReciptResponse } from "../models/Company";
import { ActivatedRoute, Router } from "@angular/router";
import { InvoiceService } from "../services/invoice.service";
import { select, Store } from "@ngrx/store";
import { PAYMENT_METHODS_ENUM } from "../app.constant";
import { GeneralService } from "../services/general.service";
import {
    FormControl
} from "@angular/forms";
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
    public paidInvoiceMessage: any;
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
    public url: string = "";
    /** Hold region */
    public region: string = "";
    /** Holds payment method value */
    public paymentMethodValue: FormControl = new FormControl("");
    /** Holds payment methods */
    public paymentMethods: any[] = [];
    /** Holds payment method list */
    public paymentMethodList: any = {};
    /** Holds return invoice pay */
    public returnInvoicePay: string = "";
    /** Holds mapped payment methods */
    public mappedPaymentMethodsFlat: any[] = [];

    constructor(
        public dialog: MatDialog,
        private invoiceService: InvoiceService,
        private generalService: GeneralService,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store,
        private changeDetectionRef: ChangeDetectorRef,
        private breakpointObserver: BreakpointObserver
    ) { }

    /**
     * This will be use for component initialization
     *
     * @memberof InvoicePayComponent
     */
    public ngOnInit(): void {
        document.body.classList.add("invoice-pay");
        this.breakpointObserver
            .observe(["(max-width: 576px)"])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((result) => {
                this.isMobileScreen = result?.breakpoints["(max-width: 576px)"];
            });

        combineLatest([
            this.route.queryParams,
            this.route.params,
            this.store.pipe(select((state) => state)),
        ])
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response) => {
                if (response[0] && response[1] && !this.storeData?.session) {
                    this.queryParams = response[0];
                    this.urlParams = response[1];
                    this.storeData =
                        response[2]["folderName"][
                        this.urlParams?.companyDomainUniqueName
                        ];
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
                        };
                        this.loginButtonScriptLoaded();
                    }
                    if (
                        this.urlParams?.accountUniqueName ||
                        this.queryParams?.accountUniqueName
                    ) {
                        this.getPaymentMethods();
                        this.getPaymentMethodList();
                    }
                    const routerState = (this.route as any)._routerState
                        ?.snapshot?.url;
                    const updatedUrl = routerState.replace(
                        "/" + this.storeData.domain,
                        ""
                    );
                    this.returnInvoicePay = updatedUrl;
                }
            });
    }

    /**
     * This will be use for get payment methods
     *
     * @memberof InvoicePayComponent
     */
    public getPaymentMethodList(): void {
        const accountUniqueName =
            this.urlParams.accountUniqueName ??
            this.storeData?.userDetails?.account.uniqueName;
        const companyUniqueName =
            this.queryParams.companyUniqueName ??
            this.storeData?.userDetails?.companyUniqueName;
        const request = {
            accountUniqueName: accountUniqueName,
            companyUniqueName: companyUniqueName,
            sessionId: this.storeData.session?.id,
        };
        this.invoiceService
            .getPaymentMethodList(request)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response) => {
                if (response && response.status === "success") {
                    this.paymentMethodList = response.body;
                    this.mappedPaymentMethodsFlat = Object.entries(this.paymentMethodList).map(([mainKey, methods]) => ({
                        value: mainKey,
                        methods: Object.entries(methods)
                            .filter(([typeKey, _]) => typeKey !== 'debitcard') // removes debitcard
                            .map(([typeKey, label]) => ({
                                typeKey,
                                label,
                                image: this.getImageForType(typeKey)
                            }))
                    }));
                }
            });
    }

    /**
     *This will be use for get payment method image
     *
     * @param {string} type
     * @return {*}  {string}
     * @memberof InvoicePayComponent
     */
    public getImageForType(type: string): string {
        const images = {
            cashcard: 'assets/images/cashcard.svg',
            netbanking: 'assets/images/netbanking.svg',
            creditcard: 'assets/images/creditcard.svg',
            upi: 'assets/images/upi.svg',
            paypal: 'assets/images/paypal.svg',
            payu: 'assets/images/payu.svg',
            razorpay: 'assets/images/razorpay.svg'
        };
        return images[type];
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
                    redirect_path: this.url,
                },
                success: (data: any) => { },
                failure: (error: any) => {
                    this.generalService.showSnackbar(error?.message);
                },
            };
            this.store.dispatch(
                setFolderData({
                    folderName: this.storeData.domain,
                    data: { domain: this.storeData.domain }
                })
            );
            this.generalService.loadScript(
                environment.proxyReferenceId,
                configuration
            );
        }, 200);
    }

    /**
     * This will be use for get payment methods
     *
     * @private
     * @memberof InvoicePayComponent
     */
    private getPaymentMethods(): void {
        this.isLoading = true;
        const accountUniqueName =
            this.urlParams.accountUniqueName ??
            this.storeData.userDetails?.account.uniqueName;
        const companyUniqueName =
            this.queryParams.companyUniqueName ??
            this.storeData.userDetails?.companyUniqueName;
        const request = {
            accountUniqueName: accountUniqueName,
            companyUniqueName: companyUniqueName,
            sessionId: this.storeData.session?.id,
        };
        this.invoiceService
            .getPaymentMethods(request)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response) => {
                this.isLoading = false;
                if (response && response.status === "success") {
                    this.paymentMethods = response.body;
                    if (
                        response.body?.RAZORPAY ||
                        response.body?.PAYPAL ||
                        response.body?.PAYU
                    ) {
                        if (response.body?.RAZORPAY) {
                            this.paymentMethodValue.setValue("RAZORPAY");
                        } else if (response.body?.PAYPAL) {
                            this.paymentMethodValue.setValue("PAYPAL");
                        } else if (response.body?.PAYU) {
                            this.paymentMethodValue.setValue("PAYU");
                        }
                        this.getVoucherDetails();
                    } else {
                        this.generalService.showSnackbar(
                            "No payment method is integrated",
                            "warning"
                        );
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
        this.store.dispatch(
            setFolderData({
                folderName: this.storeData.domain,
                data: { sidebarState: !this.isMobileScreen },
            })
        );

        const voucherUniqueName = this.urlParams.voucherUniqueName || "";
        const voucherUniqueNameArray = voucherUniqueName.split("|");
        if (this.urlParams?.accountUniqueName) {
            const accountUniqueName =
                this.urlParams.accountUniqueName ||
                this.storeData.userDetails?.account.uniqueName;
            const companyUniqueName =
                this.queryParams.companyUniqueName ||
                this.storeData.userDetails?.companyUniqueName;
            const request = {
                accountUniqueName: accountUniqueName,
                voucherUniqueName: voucherUniqueNameArray,
                companyUniqueName: companyUniqueName,
                sessionId: this.storeData.session?.id,
            };
            this.invoiceService
                .getVoucherDetails(request)
                .pipe(takeUntil(this.destroyed$))
                .subscribe((voucherDetailsResponse) => {
                    this.isLoading = false;
                    if (
                        voucherDetailsResponse &&
                        voucherDetailsResponse.status === "success"
                    ) {
                        this.paymentDetails = voucherDetailsResponse.body;

                        let hasPaidVouchers =
                            voucherDetailsResponse.body?.vouchers?.filter(
                                (voucher) => voucher.status === "PAID"
                            );
                        if (!hasPaidVouchers?.length) {
                            this.canPayInvoice = true;
                        } else {
                            const paidVoucherNumbers = hasPaidVouchers?.map(
                                (voucher) => {
                                    return voucher?.number;
                                }
                            );
                            this.canPayInvoice = false;
                            const paidMessage =
                                paidVoucherNumbers?.length > 1 ? " are" : " is";
                            this.paidInvoiceMessage =
                                paidVoucherNumbers.join(", ") +
                                paidMessage +
                                " successfully paid.";
                        }

                        if (this.queryParams?.PayerID && this.canPayInvoice) {
                            this.canPayInvoice = false;
                            this.paymentDetails.vouchers[0].canPay = false;
                            this.paymentDetails.vouchers[0].message =
                                "Invoice payment is being processed.";
                            this.paidInvoiceMessage =
                                "Invoice payment is being processed.";
                        }
                    } else {
                        this.generalService.showSnackbar(
                            voucherDetailsResponse?.message
                        );
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
     * This will be use for component destroy
     *
     * @memberof InvoicePayComponent
     */
    public ngOnDestroy(): void {
        document.body.classList.remove("invoice-pay");
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

    /**
     * This will be use for get voucher details
     *
     * @memberof InvoicePayComponent
     */
    public onInvoicePaySuccess(): void {
        this.getVoucherDetails();
    }
}
