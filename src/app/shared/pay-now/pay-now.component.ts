import {
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    ViewChild,
    Output,
    EventEmitter
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ReplaySubject } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { GeneralService } from "src/app/services/general.service";
import { MatDialog } from "@angular/material/dialog";
import { NavigationExtras, Router } from "@angular/router";
import { PAYMENT_METHODS_ENUM } from "src/app/app.constant";
import { environment } from "src/environments/environment";
import { InvoiceService } from "src/app/services/invoice.service";
import { takeUntil } from "rxjs/operators";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
@Component({
    selector: "pay-now",
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule
    ],
    templateUrl: "./pay-now.component.html",
    styleUrls: ["./pay-now.component.scss"],
})
export class GiddhPayNowComponent implements OnDestroy {
    /** This will use for mat payu modal dialog */
    @ViewChild("payuModal", { static: true }) public payuModal: any;
    /** Output event for InvoiceComponent */
    @Output() payNowInvoice: EventEmitter<any> = new EventEmitter<any>();
    /** Output event for InvoicePayComponent */
    @Output() payNowInvoicePay: EventEmitter<any> = new EventEmitter<any>();
    /** This will use for emit success event */
    @Output() invoicePreviewSuccess: EventEmitter<any> = new EventEmitter<any>();
    /** This will use for emit success event */
    @Output() invoicePaySuccess: EventEmitter<any> = new EventEmitter<any>();
    /** This will use for selection model */
    @Input() selection: SelectionModel<any> = new SelectionModel<any>(
        false,
        []
    );
    /** This will use for store data */
    @Input() storeData: any = {};
    /** This will use for region */
    @Input() region: string = "";
    /** This will use for voucher */
    @Input() voucher: any;
    /** This will use for query params */
    @Input() queryParams: any = {};
    /** This will use for invoice preview */
    @Input() invoicePreview: boolean = false;
    /** This will use for payment details */
    @Input() paymentDetails: any = {};
    /** This will use for payment methods */
    @Input() paymentMethods: any;
    /** This will use for payment form */
    @Input() paymentForm: FormGroup;
    /** This will use for button text */
    @Input() buttonText: string;
    /** This will use for custom class */
    @Input() customClass: string = "";
    /** This will use for payment method value */
    @Input() paymentMethodValue: any;
    /** This will use for url params */
    @Input() urlParams: any = {};
    /** This will use for invoice pay */
    @Input() public invoicePay: boolean = false;
    /** This will use for emit success event */
    @Output() invoiceGetAllSuccess: EventEmitter<any> = new EventEmitter<any>();
    /** This will use for get all */
    @Input() invoiceGetAll: boolean = false;
    /** This will use for return invoice get all */
    @Input() returnInvoiceGetAll: string = '';
    /** This will use for return invoice preview */
    @Input() returnInvoicePreview: string = '';
    /** This will use for return invoice pay */
    @Input() returnInvoicePay: string = '';
    /** This will use for destroyed$ subject */
    public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** This will use for show/hide paypal form */
    public showPaypalForm: boolean = false;
    /** This will use for paypal url */
    public paypalUrl: string = environment.paypalUrl;
    /** This will use for razorpay instance */
    public razorpay: any;
    /** This will use for paypal form instance */
    public paypalForm: FormGroup;
    /** This will use for payment methods */
    public paymentMethodEnum: any = PAYMENT_METHODS_ENUM;
    /** This will use for open window */
    private openedWindow: Window | null = null;
    /** This will use for form submitted state */
    public isFormSubmitted: boolean = false;
    /** Hold payu form */
    public payuForm: FormGroup;
    /** Instance of modal */
    public confirmationDialogRef: any;
    /** Instance of modal */
    public payuDialogRef: any;
    /** This will use for can pay invoice */
    public canPayInvoice: boolean = false;
    /** This will use for paid invoice message */
    public paidInvoiceMessage: string = "";
    /** This will use for voucher details loading state */
    public isVoucherDetailsLoading: boolean = false;

    constructor(
        private generalService: GeneralService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private router: Router,
        private changeDetectionRef: ChangeDetectorRef,
        private invoiceService: InvoiceService
    ) {
        this.initPayuForm();
    }

    /**
     * Initializes the PayU payment form with user/store details.
     * @param storeData Store or user data to prefill the form
     * @memberof GiddhPayNowComponent
     */
    private initPayuForm(storeData?: any): void {
        this.payuForm = this.formBuilder.group({
            name: [
                storeData?.portalDetails?.name
                    ? storeData?.portalDetails?.name
                    : "",
                Validators.required,
            ],
            email: [
                storeData?.portalDetails?.email
                    ? storeData?.portalDetails?.email
                    : "",
                [Validators.required, Validators.email],
            ],
            contactNo: [
                storeData?.portalDetails?.contactNo
                    ? storeData?.portalDetails?.contactNo
                    : "",
                [Validators.required, Validators.pattern("^[0-9]{10}$")],
            ],
        });
    }

    /**
     * Opens the payment dialog for the selected item or voucher.
     * @param item The item or voucher to be paid
     * @memberof GiddhPayNowComponent
     */
    public openPayDialog(): void {
        if (this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYU) {
            this.payuCheck();
        } else {
            this.voucherPay();
        }
    }

    /**
     * Checks if PayU details are available and opens the PayU dialog.
     * @memberof GiddhPayNowComponent
     */
    public payuCheck(): void {
        this.initPayuForm(this.storeData);
        if (
            this.storeData?.portalDetails?.name &&
            this.storeData?.portalDetails?.email &&
            this.storeData?.portalDetails?.contactNo
        ) {
            this.getVoucherDetails(this.paymentMethodValue);
        } else {
            this.payuDialogRef = this.dialog.open(this.payuModal, {
                width: "600px",
            });
        }
    }

    /**
     * Initiates payment for the selected voucher(s).
     * @memberof GiddhPayNowComponent
     */
    public paySelectedVouchers(): void {
        if (!this.selection?.selected?.length) {
            return;
        }
    
        const paidVoucherNumbers: string[] = [];
        const pendingVoucherNumbers: string[] = [];
        const unpaidVoucherNumbers: string[] = [];
    
        for (const voucher of this.selection.selected) {
            if (voucher?.balanceStatus === "PAID") {
                paidVoucherNumbers.push(voucher?.voucherNumber);
            } else if (voucher?.paymentInfo?.paymentStatus === "PENDING") {
                pendingVoucherNumbers.push(voucher?.voucherNumber);
            } 
        }
    
        // No paid or pending vouchers, proceed to pay
        if (!paidVoucherNumbers.length && !pendingVoucherNumbers.length) {
            this.openPayDialog();
            return;
        }
    
        // Helper to format message for each status
        const formatStatusMsg = (voucherNumbers: string[], status: string) => {
            if (!voucherNumbers.length) return '';
            const isPlural = voucherNumbers.length > 1;
            return `${voucherNumbers.join(', ')} ${isPlural ? 'are' : 'is'} ${status}`;
        };
    
        // Build the combined message
        const messages = [];
        if (paidVoucherNumbers.length) {
            messages.push(formatStatusMsg(paidVoucherNumbers, ' already PAID'));
        }
        if (pendingVoucherNumbers.length) {
            messages.push(formatStatusMsg(pendingVoucherNumbers, 'PENDING'));
        }
    
        // Show the combined message (separated by commas)
        if (messages.length) {
            this.generalService.showSnackbar(messages.join(' , '));
        }
    }

    /**
     * Initiates payment for the selected voucher.
     * @memberof GiddhPayNowComponent
     */
    public voucherPay(): void {
        this.confirmationDialogRef?.close();
        if (this.invoicePay) {
            if (
                this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYPAL ||
                this.paymentMethodValue === PAYMENT_METHODS_ENUM.RAZORPAY ||
                this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYU
            ) {
                this.getVoucherDetails(this.paymentMethodValue);
            }
        } else {
            const activeCount = Object.values(this.paymentMethods).filter(
                Boolean
            ).length;
            if (activeCount > 1) {
                let url = `${this.storeData.domain}/${this.region}/invoice-pay`;
                if (this.selection?.selected?.length) {
                    const voucherUniqueNames = this.selection?.selected?.map(voucher => {
                        return voucher.uniqueName;
                    });
                    const accountUniqueName = this.selection?.selected[0].account.uniqueName;
                    const encodedVoucherUniqueNames = voucherUniqueNames.map(encodeURIComponent);
                    url = url + `/account/${accountUniqueName}/voucher/${encodedVoucherUniqueNames.join('|')}`;
                    this.router.navigate([url]);
                } else {
                    url = url + '/account/' + this.voucher?.account?.uniqueName + '/voucher/' + this.voucher?.uniqueName;
                    this.router.navigate([url]);
                }
            } else {
                if (this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYU) {
                    this.payuCheck();
                } else {
                    this.getVoucherDetails(this.paymentMethodValue);
                }
            }
        }
    }

    /**
     * Validates and submits the PayU payment form.
     * @memberof GiddhPayNowComponent
     */
    public submitPayuForm(): void {
        this.isFormSubmitted = false;
        if (this.payuForm.invalid) {
            this.isFormSubmitted = true;
            return;
        }
        this.payuDialogRef?.close();
        this.getVoucherDetails(this.paymentMethodValue);
    }

    /**
     * Redirects user to the Pay Now page for the given payment details.
     * @param details Payment or voucher details for redirect
     * @memberof GiddhPayNowComponent
     */
    public redirectToPayNow(details: any): void {
        let queryParams = {
            companyUniqueName: this.queryParams.companyUniqueName,
        };
        let navigationExtras: NavigationExtras = {
            queryParams: queryParams,
        };
        const activeCount = Object.values(this.paymentMethods).filter(
            Boolean
        ).length;
        let url = "";
        if (activeCount > 1) {
            if (!this.storeData.session?.id) {
                url =
                    "/" +
                    this.storeData.domain +
                    `/${this.region}` +
                    "/invoice-pay/account/" +
                    this.queryParams?.accountUniqueName +
                    "/voucher/" +
                    details?.vouchers[0]?.uniqueName;
                this.router.navigate([url], navigationExtras);
            } else {
                url =
                    "/" +
                    this.storeData.domain +
                    `/${this.region}` +
                    "/invoice-pay/account/" +
                    this.storeData.userDetails?.account?.uniqueName +
                    "/voucher/" +
                    details?.vouchers[0]?.uniqueName;
                this.router.navigate([url]);
            }
        } else {
            if (this.paymentMethodValue === PAYMENT_METHODS_ENUM.PAYU) {
                this.payuCheck();
            } else {
                this.getVoucherDetails(this.paymentMethodValue);
            }
        }
    }

    /**
     * Initializes the payment process for the selected payment method.
     * @param paymentRequest Request object containing payment info
     * @param type Selected payment method enum
     * @memberof GiddhPayNowComponent
     */
    public initializePayment(
        paymentRequest: any,
        type: PAYMENT_METHODS_ENUM
    ): void {
        if (type === PAYMENT_METHODS_ENUM.PAYPAL) {
            let returnUrl = document.URL;
            if (returnUrl.indexOf("payment_id") === -1) {
                if (returnUrl.indexOf("?") > -1) {
                    returnUrl =
                        returnUrl + "&payment_id=" + paymentRequest.paymentId;
                } else {
                    returnUrl =
                        returnUrl + "?payment_id=" + paymentRequest.paymentId;
                }
            }
            this.showPaypalForm = true;

            this.paypalForm = this.formBuilder.group({
                businessEmail: [paymentRequest?.paymentKey],
                itemName: [paymentRequest.vouchers[0]?.number],
                custom: [""],
                amount: [paymentRequest.totalAmount],
                currencyCode: [paymentRequest.currency.code],
                notifyUrl: [this.generalService.getPaypalIpnUrl(this.queryParams.companyUniqueName ?? this.storeData.userDetails?.companyUniqueName, this.urlParams.accountUniqueName ?? this.storeData.userDetails?.account.uniqueName, paymentRequest.paymentId)],
                returnUrl: [returnUrl],
                cancelReturnUrl: [document.URL],
            });
            setTimeout(() => {
                document.forms["paypalForm"].submit();
                this.showPaypalForm = false;
            }, 100);
        } else if (
            paymentRequest.paymentGatewayType === PAYMENT_METHODS_ENUM.RAZORPAY
        ) {
            let that = this;
            let options = {
                key: paymentRequest.paymentKey,
                image: "data:image/png;base64,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",
                handler: function (res) {
                    that.handleVoucherPayment(res);
                },
                order_id: paymentRequest.orderId,
                theme: {
                    color: "#F37254",
                },
                amount: paymentRequest.totalAmount,
                currency: paymentRequest.currency?.code,
                name: this.storeData?.companyDetails?.name,
            };
            try {
                this.razorpay = new window["Razorpay"](options);
                setTimeout(() => {
                    this.razorpay?.open();
                }, 100);
            } catch (exception) { }
        } else if (type === PAYMENT_METHODS_ENUM.PAYU) {
            this.openPayUPayment(this.paymentDetails?.htmlString);
        }
        setTimeout(() => {
            this.isVoucherDetailsLoading = false;
        }, 300);
    }

    /**
     * Fetches voucher details and updates payment state for the given payment type.
     * @param paymentType The selected payment method type
     * @memberof GiddhPayNowComponent
     */
    private getVoucherDetails(paymentType: string): void {
        this.isVoucherDetailsLoading = true;
        let voucherUniqueName;
        let voucherUniqueNameArray;
        if (this.queryParams.source) {
            voucherUniqueName = this.queryParams.voucherUniqueName;
            voucherUniqueNameArray = [voucherUniqueName];
        } else if (this.queryParams.voucher || this.urlParams.voucherUniqueName) {
            voucherUniqueName = this.queryParams.voucher || this.urlParams.voucherUniqueName || "";
            voucherUniqueNameArray = voucherUniqueName.split("|");
        } else if (!this.voucher) {
            const uniqueNames: string[] = this.selection?.selected?.map(item => item.uniqueName) ?? [];
            let selectedVoucher = this.selection?.selected?.length > 0 ? uniqueNames : [this.selection?.selected[0]?.uniqueName];
            voucherUniqueName = selectedVoucher || "";
            voucherUniqueNameArray = selectedVoucher || [];
        } else {
            voucherUniqueName = this.voucher?.uniqueName || "";
            voucherUniqueNameArray = [this.voucher?.uniqueName];
        }
        let paymentReqObj;
        if (paymentType === PAYMENT_METHODS_ENUM.PAYU) {
            paymentReqObj = {
                // if passed this will be used as payment id otherwise a random payment id of 20 characters will be generated
                paymentGatewayType: paymentType, // Possible values are: RAZORPAY, PAYPAL, STRIPE, PAYU - Its a mandatory parameter
                voucherUniqueNames: voucherUniqueNameArray, // It need to be passed, this is the list of vouchers for which payment is done
                name: this.payuForm?.value?.name, // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
                email: this.payuForm?.value?.email, // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
                contactNo: this.payuForm?.value?.contactNo, // Mandatory in the case of PAYU - UI must pre fill it using the data of the user fetched using api : /portal/company/companyUniqueName/accounts/accountUniqueName/contacts
            };
        } else {
            paymentReqObj = {
                // if passed this will be used as payment id otherwise a random payment id of 20 characters will be generated
                paymentGatewayType: paymentType, // Possible values are: RAZORPAY, PAYPAL, STRIPE, PAYU - Its a mandatory parameter
                voucherUniqueNames: voucherUniqueNameArray, // It need to be passed, this is the list of vouchers for which payment is done
            };
        }
        const accountUniqueName =
            this.urlParams.accountUniqueName || this.queryParams.accountUniqueName ||
            this.storeData.userDetails?.account.uniqueName;
        const companyUniqueName =
            this.queryParams.companyUniqueName ||
            this.storeData.userDetails?.companyUniqueName;
        const request = {
            accountUniqueName: accountUniqueName,
            voucherUniqueName: voucherUniqueNameArray,
            companyUniqueName: companyUniqueName,
            sessionId: this.storeData.session?.id,
            paymentMethod: paymentType,
            paymentId: this.queryParams?.payment_id,
            paymentRequest: paymentReqObj ?? null,
        };
        this.invoiceService
            .getVoucherDetails(request, true)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((voucherDetailsResponse) => {
                if (
                    voucherDetailsResponse &&
                    voucherDetailsResponse.status === "success"
                ) {
                    this.paymentDetails = voucherDetailsResponse.body;
                    this.initializePayment(
                        this.paymentDetails,
                        this.paymentMethodValue
                    );
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
                    this.isVoucherDetailsLoading = false;
                }
                this.changeDetectionRef.detectChanges();
            });
    }

    /**
     * Opens a new browser window with the given URL (centered).
     * @param url The URL to open in a new window
     * @memberof GiddhPayNowComponent
     */
    public openWindow(url: string): void {
        const width = 800;
        const height = 900;

        this.openedWindow = this.generalService.openCenteredWindow(
            url,
            "",
            width,
            height
        );
    }

    /**
     * Opens PayU payment HTML in a new window and listens for response.
     * @param html The PayU HTML string to open
     * @memberof GiddhPayNowComponent
     */
    private openPayUPayment(html: string): void {
        // Open PayU HTML in new window
        const blob = new Blob([html], { type: "text/html" });
        this.openWindow(URL.createObjectURL(blob));

        // Listen for PayU response from new window
        const handlePayUMessage = (
            event: MessageEvent<{
                status: string;
                transactionId: string;
                provider: string;
            }>
        ) => {
            if (event.data?.status) {
                let payload = {
                    paymentGatewayType: PAYMENT_METHODS_ENUM.PAYU,
                };
                let payRequest = {
                    accountUniqueName:
                        this.storeData.userDetails?.account.uniqueName,
                    companyUniqueName: this.paymentDetails.company.uniqueName,
                    paymentId: this.paymentDetails.paymentId,
                };
                this.payuRazorPayUpdate(payRequest, payload);
                // remove listener
                window.removeEventListener("message", handlePayUMessage);
            }
        };
        window.addEventListener("message", handlePayUMessage);
    }

    /**
     * Handles the Razorpay success callback and updates payment status.
     * @param razorPayResponse Response from Razorpay
     * @memberof GiddhPayNowComponent
     */
    public handleVoucherPayment(razorPayResponse: any): void {
        if (
            razorPayResponse &&
            this.paymentDetails?.vouchers[0].contentType === "invoice"
        ) {
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
                date: date,
            };
            let payRequest = {
                accountUniqueName:
                    this.storeData.userDetails?.account.uniqueName,
                companyUniqueName: this.paymentDetails.company.uniqueName,
                paymentId: this.paymentDetails.paymentId,
            };
            this.payuRazorPayUpdate(payRequest, payload);
        }
    }

    /**
     * Calls the API to update invoice payment status for PayU or Razorpay.
     * @param payRequest Request object for payment
     * @param payload Payload containing payment gateway info
     * @memberof GiddhPayNowComponent
     */
    public payuRazorPayUpdate(payRequest: any, payload: any): void {
        this.invoiceService
            .payInvoice(payRequest, payload)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((response: any) => {
                if (response && response.status === "success") {
                    this.generalService.showSnackbar(response?.body, "success");
                    let url: string;

                    if (this.invoiceGetAll) {
                        this.invoiceGetAllSuccess.emit();
                        url = this.returnInvoiceGetAll;
                    }
                    if (this.invoicePreview) {
                        this.invoicePreviewSuccess.emit();
                        url = this.returnInvoicePreview;
                    }

                    if (this.invoicePay) {
                        this.invoicePaySuccess.emit();
                        url = this.returnInvoicePay;
                    }

                    if (url) {
                        let updatedUrl = `/${this.storeData.domain}${url}`;
                        this.router.navigateByUrl(updatedUrl);
                    }
                } else {
                    if (response?.status === "error") {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
    }

    /**
     * This will close the current window
     *
     * @memberof GiddhPayNowComponent
     */
    public closeWindow(): void {
        if (this.openedWindow) {
            this.openedWindow.close();
            this.openedWindow = null;
        }
    }

    /**
     * Angular lifecycle method: Cleans up subscriptions on destroy.
     * @returns void
     * @memberof GiddhPayNowComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
