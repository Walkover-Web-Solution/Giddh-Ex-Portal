import { Component, OnDestroy, OnInit } from "@angular/core";
import { ReplaySubject, combineLatest } from "rxjs";
import { select, Store } from '@ngrx/store';
import { takeUntil } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "header",
    templateUrl: "header.component.html",
    styleUrls: ["header.component.scss"]
})
export class HeaderComponent implements OnInit, OnDestroy {
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private store: Store,
        public route: ActivatedRoute
    ) {
        
    }

    /**
     * This will be use for component initialization
     *
     * @memberof HeaderComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1]) {
                this.storeData = response[1]['folderName'][response[0].companyDomainUniqueName];
            }
        });
    }

    /**
     * This will ve use for component destory
     *
     * @memberof HeaderComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
