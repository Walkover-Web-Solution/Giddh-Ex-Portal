import { Component, OnDestroy, OnInit } from "@angular/core";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanyResponse } from "src/app/models/Company";
import { select, Store } from '@ngrx/store';
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "footer",
    templateUrl: "footer.component.html",
    styleUrls: ["footer.component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
    /** Hold company response */
    public companyDetails: CompanyResponse;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private store: Store,
        private route: ActivatedRoute
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof FooterComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && !this.storeData?.session) {
                this.storeData = response[1]['folderName'][response[0].companyDomainUniqueName];
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
