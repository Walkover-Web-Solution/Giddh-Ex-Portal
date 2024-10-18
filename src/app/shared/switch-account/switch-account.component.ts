import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { select, Store } from '@ngrx/store';
import { AuthService } from "src/app/services/auth.service";
import { setFolderData } from "src/app/store/actions/session.action";
import { GeneralService } from "src/app/services/general.service";

@Component({
    selector: "switch-account",
    templateUrl: "./switch-account.component.html",
    styleUrls: ["./switch-account.component.scss"]
})
export class SwitchAccountComponent implements OnInit, OnDestroy {
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Hold  store data */
    public storeData: any = {};
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold region */
    public region: string = "";

    constructor(
        private store: Store,
        public route: ActivatedRoute,
        private authService: AuthService,
        private generalService: GeneralService,
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
                this.storeData = response[1]['folderName'][response[0].companyDomainUniqueName];
                this.region = this.storeData?.region;
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

    /**
     * This will be use for on user selection
     *
     * @param {number} index
     * @memberof SwitchAccountComponent
     */
    public onUserSelected(user: any): void {
        this.isLoading = true;
        let savePortalUserSession = {
            account: {
                name: user.account.name,
                uniqueName: user.account.uniqueName
            },
            vendorContactUniqueName: user.vendorContactUniqueName,
            proxyAuthToken: this.storeData.proxyAuthToken,
            subDomain: this.storeData.domain
        };

        this.authService.savePortalUserSession(savePortalUserSession).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            if (response && response.status === 'success') {
                this.isLoading = false;
                savePortalUserSession['companyUniqueName'] = response.body.companyUniqueName;
                this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { userDetails: savePortalUserSession, session: response.body.session } }));
                let url = `/${this.storeData.domain}/${this.region}/switch-account`;
                this.router.navigate([url]);
            } else {
                this.isLoading = false;
                if (response?.status === 'error') {
                    this.generalService.showSnackbar(response?.data?.message);
                }
            }
        });
    }
}
