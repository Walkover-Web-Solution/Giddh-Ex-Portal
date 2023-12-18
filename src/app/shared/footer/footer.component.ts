import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanyResponse } from "src/app/models/Company";
import { select, Store } from '@ngrx/store';

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
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold  store data */
    public storeData: any = {};

    constructor(
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
                this.companyData.emit(this.storeData.companyDetails);
                this.companyDetails = this.storeData.companyDetails;
            }
        });
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
