import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { DateAdapter } from "@angular/material/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ReplaySubject } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { GeneralService } from "src/app/services/general.service";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { PAYMENT_METHODS_ENUM } from "src/app/app.constant";
import { environment } from "src/environments/environment";
import { InvoiceService } from "src/app/services/invoice.service";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "pay-now",
    templateUrl: "./pay-now.component.html",
    styleUrls: ["./pay-now.component.scss"]
})
export class GiddhPayNowComponent implements OnInit, OnDestroy {
    /** Instance of mat pay modal dialog */
    @ViewChild('payModal', { static: true }) public payModal: any;
    /** Instance of mat pay modal dialog */
    @ViewChild('payuModal', { static: true }) public payuModal: any;
    public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Show/Hide paypal form */
    public showPaypalForm: boolean = false;
    /** Holds paypal url */
    public paypalUrl: string = environment.paypalUrl;
    /** Instance of razaor pay*/
    public razorpay: any;
    /** Paypal form instance */
    public paypalForm: FormGroup;
    /** Holds payment methods */
    public paymentMethodEnum: any = PAYMENT_METHODS_ENUM;
    /** This will use for open window */
    private openedWindow: Window | null = null;
    @Input() selection: SelectionModel<any> = new SelectionModel<any>(false, []);
    @Input() storeData: any = {};
    @Input() region: string = "";
    @Input() voucher: any;
    @Input() selectedPaymentVoucher: any;
    @Input() queryParams: any = {};
    @Input() invoicePreview: boolean = false;
    @Input() paymentDetails: any = {};
    @Input() paymentMethods: any;
    @Input() paymentForm: FormGroup;
    @Input() buttonText: string;
    @Input() customClass: string = '';
    @Input() paymentMethodValue: any;
    @Input() urlParams: any = {};
    /** Hold payu form */
    public payuForm: FormGroup;
    public canPayInvoice: boolean = false;
    public isLoading: boolean = false;
    public paidInvoiceMessage: string = "";
    @Input() public invoicePay: boolean = false;
    /** Instance of modal */
    public confirmationDialogRef: any;
    /** Instance of modal */
    public payuDialogRef: any;
    constructor(
        private generalService: GeneralService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private changeDetectionRef: ChangeDetectorRef,
        private invoiceService: InvoiceService,
    ) {
        this.initPayuForm();
    }

    /**
 * This will be use for payu form initialization
 *
 * @memberof InvoicePayComponent
 */
    private initPayuForm(storeData?: any): void {
        this.payuForm = this.formBuilder.group({
            name: [storeData?.portalDetails?.name ? storeData?.portalDetails?.name : '', Validators.required],
            email: [storeData?.portalDetails?.email ? storeData?.portalDetails?.email : '', [Validators.required, Validators.email]],
            contactNo: [storeData?.portalDetails?.contactNo ? storeData?.portalDetails?.contactNo : '', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        });
    }

    /**
     * Initializes the component and sets the locale for the date adapter
     * 
     * @returns {void}
     * @memberof GiddhDatepickerComponent
     */
    public ngOnInit(): void {
        // console.log(this.storeData, this.region, this.queryParams, this.urlParams, this.invoicePay, this.paymentMethods, this.paymentMethodValue);
    }


    /**
     * Releases the memory and cleans up subscriptions
     * 
     * @returns {void}
     * @memberof GiddhDatepickerComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    /**
     * Opens the pay dialog
     * 
     * @param {any} element - The element to be paid
     * @memberof GiddhPayNowComponent
     */
    public openPayDialog(item?: any): void {
        if (this.invoicePay) {
            if (this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYU) {
                if (this.storeData?.portalDetails?.name && this.storeData?.portalDetails?.email && this.storeData?.portalDetails?.contactNo) {
                    this.getVoucherDetails(this.paymentMethodValue);
                } else {
                    this.initPayuForm(this.storeData);
                    this.payuDialogRef = this.dialog.open(this.payuModal, {
                        width: '600px'
                    });
                }
            } else {
                this.confirmationDialogRef = this.dialog.open(this.payModal, {
                    width: '600px'
                });
            }
        } else {

            if (!this.selection?.selected?.length) {
                this.selectedPaymentVoucher = item;
            }
        }
    }

    public paySelectedVouchers(): void {
        if (this.selection?.selected?.length) {
            let hasPaidVouchers = this.selection?.selected?.filter(voucher => voucher.balanceStatus === "PAID");
            if (!hasPaidVouchers?.length) {
                this.openPayDialog();
            } else {
                const paidVoucherNumbers = hasPaidVouchers?.map(voucher => { return voucher?.voucherNumber });
                this.generalService.showSnackbar(paidVoucherNumbers.join(", ") + (paidVoucherNumbers?.length > 1 ? " are" : " is") + " already PAID.");
            }
        }
    }

    /**
     * This will be use for pay voucher
     *
     * @memberof InvoiceComponent
     */
    public voucherPay(): void {
        this.confirmationDialogRef?.close();
        console.log(this.storeData, this.region, this.queryParams, this.urlParams, this.invoicePay, this.paymentMethods, this.paymentMethodValue);
        if (this.invoicePay) {
            if (this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYPAL || this.paymentMethodValue === PAYMENT_METHODS_ENUM.RAZORPAY) {
                this.getVoucherDetails(this.paymentMethodValue);
            }
        } else {
            const activeCount = Object.values(this.paymentMethods).filter(Boolean).length;
            if (activeCount > 1) {
                if (this.selection?.selected?.length) {
                    const voucherUniqueNames = this.selection?.selected?.map(voucher => {
                        return voucher.uniqueName;
                    });
                    const accountUniqueName = this.selection?.selected[0].account.uniqueName;
                    const encodedVoucherUniqueNames = voucherUniqueNames.map(encodeURIComponent);
                    let url = `${this.storeData.domain}/${this.region}/invoice-pay/account/${accountUniqueName}/voucher/${encodedVoucherUniqueNames.join('|')}`;
                    this.router.navigate([url]);
                }
            } else {
                console.log('singlecase')
            }
        }
    }

    public submitPayuForm(): void {
        this.payuDialogRef?.close();
        this.getVoucherDetails(this.paymentMethodValue);
    }


    /**
    * This will be use for redirecting to pay now
    *
    * @param {*} details
    * @memberof InvoicePreviewComponent
    */
    public redirectToPayNow(details: any): void {
        let queryParams = {
            companyUniqueName: this.queryParams.companyUniqueName
        }
        let navigationExtras: NavigationExtras = {
            queryParams: queryParams
        };
        const activeCount = Object.values(this.paymentMethods).filter(Boolean).length;
        let url = "";
        if (activeCount > 1) {
            if (!this.storeData.session?.id) {
                url = '/' + this.storeData.domain + `/${this.region}` + '/invoice-pay/account/' + (this.queryParams?.accountUniqueName) + '/voucher/' + details?.vouchers[0]?.uniqueName;
                this.router.navigate([url], navigationExtras);
            } else {
                url = '/' + this.storeData.domain + `/${this.region}` + '/invoice-pay/account/' + (this.storeData.userDetails?.account?.uniqueName) + '/voucher/' + details?.vouchers[0]?.uniqueName;
                this.router.navigate([url]);
            }
        } else {
            console.log('singlecase')
        }

    }

    /**
 * This wil be used for initialize payment
 *
 * @param {*} paymentRequest
 * @memberof InvoicePayComponent
 */
    public initializePayment(paymentRequest: any, type: PAYMENT_METHODS_ENUM): void {
        console.log(paymentRequest, type);
        
        if (type === PAYMENT_METHODS_ENUM.PAYPAL) {
                let returnUrl = document.URL;
                if (returnUrl.indexOf("payment_id") === -1) {
                    if (returnUrl.indexOf("?") > -1) {
                        returnUrl = returnUrl + "&payment_id=" + paymentRequest.paymentId;
                    } else {
                        returnUrl = returnUrl + "?payment_id=" + paymentRequest.paymentId;
                    }
                }
                this.showPaypalForm = true;

                this.paypalForm = this.formBuilder.group({
                    businessEmail: ['ashish.websyms@gmail.com'],
                    itemName: [paymentRequest.vouchers[0]?.number],
                    custom: [''],
                    amount: [paymentRequest.totalAmount],
                    currencyCode: [paymentRequest.currency.code],
                    returnUrl: [returnUrl],
                    cancelReturnUrl: [document.URL]
                });
                console.log(this.paypalForm.value);
                setTimeout(() => {
                    document.forms['paypalForm'].submit();
                    this.showPaypalForm = false;
                }, 100);
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
        } else if (type === PAYMENT_METHODS_ENUM.PAYU) {
            this.getVoucherDetails(PAYMENT_METHODS_ENUM.PAYU);
        }
    }

    private getVoucherDetails(paymentType: string): void {
        this.isLoading = true;
        const voucherUniqueName = this.urlParams.voucherUniqueName || '';
        const voucherUniqueNameArray = voucherUniqueName.split('|');
        let paymentReqObj;
        if (paymentType === PAYMENT_METHODS_ENUM.PAYU) {
            paymentReqObj = {
                // if passed this will be used as payment id otherwise a random payment id of 20 characters will be generated
                paymentGatewayType: paymentType, // Possible values are: RAZORPAY, PAYPAL, STRIPE, PAYU - Its a mandatory parameter 
                voucherUniqueNames: voucherUniqueNameArray, // It need to be passed, this is the list of vouchers for which payment is done
                name: this.payuForm?.value?.name, // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
                email: this.payuForm?.value?.email, // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
                contactNo: this.payuForm?.value?.contactNo // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
            }
        } else {
            paymentReqObj = {
                // if passed this will be used as payment id otherwise a random payment id of 20 characters will be generated
                paymentGatewayType: paymentType, // Possible values are: RAZORPAY, PAYPAL, STRIPE, PAYU - Its a mandatory parameter 
                voucherUniqueNames: voucherUniqueNameArray // It need to be passed, this is the list of vouchers for which payment is done
            }
        }
        if (this.urlParams?.accountUniqueName) {
            const accountUniqueName = this.urlParams.accountUniqueName || this.storeData.userDetails?.account.uniqueName;
            const companyUniqueName = this.queryParams.companyUniqueName || this.storeData.userDetails?.companyUniqueName;
            console.log(paymentReqObj);
            const request = { accountUniqueName: accountUniqueName, voucherUniqueName: voucherUniqueNameArray, companyUniqueName: companyUniqueName, sessionId: this.storeData.session?.id, paymentMethod: paymentType, paymentId: this.queryParams?.payment_id, paymentRequest: paymentReqObj ?? null };
            this.invoiceService.getVoucherDetails(request, true).pipe(takeUntil(this.destroyed$)).subscribe(voucherDetailsResponse => {
                this.isLoading = false;
                if (voucherDetailsResponse && voucherDetailsResponse.status === 'success') {
                    this.initializePayment(this.paymentDetails, this.paymentMethodValue)
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
* This will be open window by url
*
* @param {string} url
* @memberof BuyPlanComponent
*/
    public openWindow(url: string): void {
        const width = 800;
        const height = 900;

        this.openedWindow = this.generalService.openCenteredWindow(url, '', width, height);
    }



    /**
     * Open PayU HTML in new window and listen for PayU response 
     * then update subscription
     * 
     * @param {string} html - PayU HTML
     */
    private openPayUPayment(html: string): void {
        // Open PayU HTML in new window
        const blob = new Blob([html], { type: 'text/html' });
        this.openWindow(URL.createObjectURL(blob));

        // Listen for PayU response from new window
        const handlePayUMessage = (event: MessageEvent<{
            status: string;
            transactionId: string;
            provider: string;
        }>) => {
            if (event.data?.status) {
                // const model = {
                //     payuTransactionId: event.data.transactionId,
                //     paymentProvider: event.data.provider,
                //     subscriptionId: this.subscriptionId,
                //     duration: this.firstStepForm.get('duration')?.value
                // };
                // this.componentStore.changePlan(model);

                // remove listener
                window.removeEventListener("message", handlePayUMessage);
            }
        };
        window.addEventListener("message", handlePayUMessage);
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
                    if (this.storeData.redirectUrl) {
                        let url = `/${this.storeData.domain}${this.storeData.redirectUrl}`;
                        this.router.navigateByUrl(url);
                    }
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }
}