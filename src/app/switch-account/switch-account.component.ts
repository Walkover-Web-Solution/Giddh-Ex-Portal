import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { select, Store } from '@ngrx/store';

@Component({
    selector: "switch-user",
    templateUrl: "./switch-account.component.html"
})
export class SwitchAccountComponent implements OnInit, OnDestroy {
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold region */
    public region: string = "";

    constructor(
        private store: Store,
        private route: ActivatedRoute,
        private router: Router
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof SwitchAccountComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1]) {
                let storeData = response[1]['folderName'][response[0].companyDomainUniqueName];
                this.region = storeData?.region;
                let url = `/${storeData.domain}/${this.region}/welcome`;
                this.router.navigate([url]);
            }
        });
    }

    /**
     * This will ve use for component destory
     *
     * @memberof SwitchAccountComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}