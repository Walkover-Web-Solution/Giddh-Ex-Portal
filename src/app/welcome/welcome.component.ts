import { Component, OnDestroy, OnInit } from "@angular/core";
import { ReplaySubject, combineLatest } from "rxjs";
import { select, Store } from '@ngrx/store';
import { takeUntil } from "rxjs/operators";
import { GeneralService } from "../services/general.service";
import { CompanyResponse, ReciptResponse } from "../models/Company";
import { DashboardService } from "../services/dashboard.service.";
import { Router } from "@angular/router";
import { WelcomeService } from "../services/welcome.service";

@Component({
    selector: "welcome",
    templateUrl: "welcome.component.html",
    styleUrls: ["welcome.component.scss"]
})
export class WelcomeComponent implements OnInit, OnDestroy {
    /** This will be use for company details */
    public receivedCompanyDetails: CompanyResponse;
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Request body for get user balance url params */
    public userBalanceSummary = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
    };
    /** Hold balance summary */
    public balanceSummary: any = {};
    /** Hold account details*/
    public accountDetails: any = {
        name: undefined,
        email: undefined,
        countryName: undefined,
        data: {
            gstNumber: undefined,
            address: undefined,
            stateCode: undefined,
            isDefault: null,
            partyType: undefined,
            isComposite: false,
            pincode: undefined,
            gstinStatus: undefined,
            state: {
                stateGstCode: undefined,
                name: undefined,
                code: undefined
            },
            stateName: undefined,
            stateGstCode: undefined,
            stateCodeString: undefined
        },
        attentionTo: undefined,
        mobileNo: undefined
    };
    /** Hold accounts*/
    public accounts: any[] = [];
    /** Hold voucher data*/
    public voucherData: ReciptResponse;
    /** Request body for last payment url params */
    public lastPaymentRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'receipt',
        page: 1,
        count: 1,
        sortBy: 'DESC',
        sort: ''
    };
    /** True show account details*/
    public isShowAccountDetails: boolean = false;
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private dashboardService: DashboardService,
        private generalService: GeneralService,
        private welcomeService: WelcomeService,
        private store: Store,
        private router: Router
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof WelcomeComponent
     */
    public ngOnInit(): void {
        this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState) => {
            this.storeData = sessionState;
        });
        document.querySelector('body')?.classList.add('welcome-main');
        this.userBalanceSummary.accountUniqueName = this.storeData.session.userDetails.account.uniqueName;
        this.userBalanceSummary.companyUniqueName = this.storeData.session.userDetails.companyUniqueName;
        this.userBalanceSummary.sessionId = this.storeData.session.session.id;
        this.lastPaymentRequest.accountUniqueName = this.storeData.session.userDetails.account.uniqueName;
        this.lastPaymentRequest.companyUniqueName = this.storeData.session.userDetails.companyUniqueName;
        this.lastPaymentRequest.sessionId = this.storeData.session.session.id;
        this.isLoading = true;
        const balanceSummary$ = this.dashboardService.getBalanceSummary(this.userBalanceSummary);
        const accountDetails$ = this.dashboardService.getAccountDetails(this.userBalanceSummary);
        const accounts$ = this.dashboardService.getAccounts(this.userBalanceSummary);
        const lastPayment$ = this.welcomeService.getLastPaymentMade(this.lastPaymentRequest);

        combineLatest([balanceSummary$, accountDetails$, accounts$, lastPayment$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                ([balanceSummaryResponse, accountDetailsResponse, accountsResponse, lastPaymentResponse]) => {
                    this.handleBalanceSummaryResponse(balanceSummaryResponse);
                    this.handleAccountDetailsResponse(accountDetailsResponse);
                    this.handleAccountsResponse(accountsResponse);
                    this.handleLastPaymentResponse(lastPaymentResponse);
                    this.isLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                }
            );
    }

    /**
     * This will be use for handle balance summary response
     *
     * @private
     * @param {*} response
     * @memberof WelcomeComponent
     */
    private handleBalanceSummaryResponse(response: any): void {
        if (response && response.status === 'success') {
            this.balanceSummary = response.body;
        } else {
            this.generalService.showSnackbar(response?.message);
        }
    }

    /**
     * This will be use for handle account details  response
     *
     * @private
     * @param {*} response
     * @memberof WelcomeComponent
     */
    private handleAccountDetailsResponse(response: any): void {
        if (response && response.status === 'success') {
            this.accountDetails.name = response.body.name;
            this.accountDetails.email = response.body.email;
            this.accountDetails.countryName = response.body.countryName;
            this.accountDetails.data = response.body.addresses[0];
            this.accountDetails.attentionTo = response.body.attentionTo;
            this.accountDetails.mobileNo= response.body.mobileNo;
        } else {
            this.generalService.showSnackbar(response?.message);
        }
    }

    /**
     * This will be use for handle account  response
     *
     * @private
     * @param {*} response
     * @memberof WelcomeComponent
     */
    private handleAccountsResponse(response: any): void {
        if (response && response.status === 'success') {
            this.accounts = response.body;
        } else {
            this.generalService.showSnackbar(response?.message);
        }
    }

    /**
     * This will be use for handle last payment made  response
     *
     * @private
     * @param {*} response
     * @memberof WelcomeComponent
     */
    private handleLastPaymentResponse(response: any): void {
        if (response && response.status === 'success') {
            this.voucherData = response.body;
        } else {
            this.generalService.showSnackbar(response?.message);
        }
    }

    /**
     * This will be use for company details
     *
     * @param {CompanyResponse} companyDetails
     * @memberof WelcomeComponent
     */
    public onCompanyDataReceived(companyDetails: CompanyResponse): void {
        this.receivedCompanyDetails = companyDetails;
    }

    /**
     * This will be use for receipt preview
     *
     * @param {*} invoice
     * @memberof WelcomeComponent
     */
    public receiptPreview(uniqueName: any): void {
        let url = this.storeData.session.domain + '/payment/preview';
        this.router.navigate([url], {
            queryParams: {
                voucher: uniqueName,
            }
        });
    }

    /**
   * This will be use for invoice preview
   *
   * @param {*} invoice
   * @memberof WelcomeComponent
   */
    public invoicePreview(uniqueName: any): void {
        let url = this.storeData.session.domain + '/invoice/preview';
        this.router.navigate([url], {
            queryParams: {
                voucher: uniqueName,
            }
        });
    }

    /**
     * This will be use for component destroyed
     *
     * @memberof WelcomeComponent
     */
    public ngOnDestroy(): void {
        document.querySelector('body')?.classList.remove('welcome-main');
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
