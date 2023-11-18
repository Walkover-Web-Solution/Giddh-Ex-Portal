import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanyResponse } from "src/app/models/Company";
import { select, Store } from '@ngrx/store';
import { WelcomeService } from "src/app/services/welcome.service";
import { GeneralService } from "src/app/services/general.service";
import { setCompanyDetails } from "src/app/store/actions/session.action";

@Component({
    selector: "footer",
    templateUrl: "footer.component.html",
    styleUrls: ["footer.component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
    /**Instance of company data emit */
    @Output() companyData: EventEmitter<CompanyResponse> = new EventEmitter<CompanyResponse>();
    /** Hold company response */
    public companyDetails: CompanyResponse;
    /** True if api call in progress */
    public isLoading: boolean = true;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Request body for get portal url params */
    public companyDetailsQueryParams = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
    };
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private welcomeService: WelcomeService,
        private generalService: GeneralService,
        private store: Store
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof FooterComponent
     */
    public ngOnInit(): void {
        this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
            if (sessionState.session) {
                this.storeData = sessionState.session;
            }
        });
        this.getCompanyDetails();
    }

    /**
     * This will be use for get company details
     *
     * @memberof FooterComponent
     */
    public getCompanyDetails(): void {
        if (this.storeData.session.id) {
            this.companyDetailsQueryParams.accountUniqueName = this.storeData.userDetails.account.uniqueName;
            this.companyDetailsQueryParams.companyUniqueName = this.storeData.userDetails.companyUniqueName;
            this.companyDetailsQueryParams.sessionId = this.storeData.session.id;
            this.welcomeService.getCompanyDetails(this.companyDetailsQueryParams).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
                if (response && response.status === 'success') {
                    this.companyDetails = response.body;
                    this.companyData.emit(this.companyDetails);
                    this.store.dispatch(setCompanyDetails({ companyDetails: this.companyDetails }));
                } else {
                    this.generalService.showSnackbar(response?.message);
                }
            });
        }
    }

    /**
     * This will be use for component destroy
     *
     * @memberof FooterComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
