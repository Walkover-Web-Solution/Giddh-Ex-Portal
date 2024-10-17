import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, ReplaySubject, combineLatest } from "rxjs";
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { DashboardService } from "src/app/services/dashboard.service.";
import { AuthService } from "src/app/services/auth.service";
import * as dayjs from 'dayjs';
import { setFolderData } from "src/app/store/actions/session.action";
import { select, Store } from '@ngrx/store';
import { GeneralService } from "src/app/services/general.service";
import { WelcomeService } from "src/app/services/welcome.service";

@Component({
    selector: "sidebar",
    templateUrl: "sidebar.component.html",
    styleUrls: ["sidebar.component.scss"]
})
export class SidebarComponent implements OnInit, OnDestroy {
    /** Is side bar expanded*/
    public isExpanded: boolean;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1); public isMobile$: Observable<boolean>;
    /* Hold user details from localStorage*/
    public userDetails: any = '';
    /* Hold user details from localStorage*/
    public portalDomain: string = '';
    /** Request body for get account details url params */
    public accountUrlRequest = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
    };
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Hold menu items*/
    public menuItems: any = [];
    /** Instance of dayjs*/
    public dayjs = dayjs;
    /** This will be use for date format*/
    public dateFormat: string = 'DD-MM-YYYY h:m:s';
    /** Hold  store data */
    public storeData: any = {};
    /** Request body for get portal url params */
    public companyDetailsQueryParams = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
    };

    constructor(
        private router: Router,
        public route: ActivatedRoute,
        public breakpointObserver: BreakpointObserver,
        public dialog: MatDialog,
        private dashboardService: DashboardService,
        private welcomeService: WelcomeService,
        private authService: AuthService,
        private store: Store,
        private generalService: GeneralService
    ) {
        this.isMobile$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(map(result => result.matches), shareReplay());
    }

    /**
     * This will be use for component initialization
     *
     * @memberof SidebarComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.queryParams, this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && !this.storeData?.session) {
                this.storeData = response[2]['folderName'][response[1].companyDomainUniqueName];
                this.portalDomain = this.storeData?.domain;
                this.accountUrlRequest.accountUniqueName = this.storeData?.userDetails?.account?.uniqueName;
                this.accountUrlRequest.companyUniqueName = this.storeData?.userDetails?.companyUniqueName;
                this.accountUrlRequest.sessionId = this.storeData?.session?.id;
                if (!this.storeData?.session?.id) {
                    this.storeData = {
                        session: {
                            createAt: null,
                            expiresAt: null,
                            id: null
                        },
                        sidebarState: true,
                        domain: response[1].companyDomainUniqueName,
                    }
                }
                this.setActiveMenuItem();
                this.menuItems = [
                    { icon: "home.svg", label: "Home", url: '/' + this.portalDomain + "/welcome" },
                    { icon: "invoice.svg", label: "Invoices", url: '/' + this.portalDomain + "/invoice" },
                    { icon: "payment.svg", label: "Payments Made", url: '/' + this.portalDomain + "/payment" }
                ];
                this.isExpanded = this.storeData?.sidebarState;
                this.getAccountDetails();
                this.getCompanyDetails();
            }
        });
    }

    /**
     * This will be use for set active menu item
     *
     * @memberof SidebarComponent
     */
    public setActiveMenuItem(): void {
        const currentUrl = this.router.url.split('/')[2]; // Assuming the structure is /domain/welcome
        this.menuItems.forEach(item => item.url === currentUrl);
    }

    /**
     * This will be use for get account details
     *
     * @memberof SidebarComponent
     */
    public getAccountDetails(): void {
        if (this.storeData?.session?.id) {
            this.isLoading = true;
            this.dashboardService.getAccountDetails(this.accountUrlRequest).pipe(takeUntil(this.destroyed$)).subscribe((accountsResponse: any) => {
                if (accountsResponse && accountsResponse.status === 'success') {
                    this.isLoading = false;
                    this.userDetails = accountsResponse.body;
                    let userName = this.generalService.getInitialsFromString(this.userDetails.name);
                    this.userDetails.name = userName;
                } else {
                    this.isLoading = false;
                    if (accountsResponse?.status === 'error') {
                        this.generalService.showSnackbar(accountsResponse?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for get company details
     *
     * @memberof SidebarComponent
     */
    public getCompanyDetails(): void {
        if (this.storeData?.session?.id) {
            this.companyDetailsQueryParams.accountUniqueName = this.storeData.userDetails?.account?.uniqueName;
            this.companyDetailsQueryParams.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
            this.companyDetailsQueryParams.sessionId = this.storeData.session.id;
            this.welcomeService.getCompanyDetails(this.companyDetailsQueryParams).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
                if (response && response.status === 'success') {
                    this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { companyDetails: response?.body } }));
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for toggle menu
     *
     * @memberof SidebarComponent
     */
    public toggleMenu(): void {
        this.isExpanded = !this.isExpanded;
        this.store.dispatch(setFolderData({ folderName: this.storeData?.domain, data: { sidebarState: this.isExpanded } }));
    }

    /**
     * This will be use for redirection
     *
     * @param {*} url
     * @memberof SidebarComponent
     */
    public redirectionToUrl(url: any): void {
        let updatedUrl = `/${this.portalDomain}/${url}`;
        this.router.navigate([updatedUrl]);
    }

    /**
     * This will be use for logout user
     *
     * @memberof SidebarComponent
     */
    public logoutUser(): void {
        this.accountUrlRequest.accountUniqueName = this.storeData.userDetails.account?.uniqueName;
        this.accountUrlRequest.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
        this.accountUrlRequest.sessionId = this.storeData.session?.id;

        this.authService.logoutUser(this.accountUrlRequest).pipe().subscribe(response => {
            localStorage.removeItem('country-region');
            this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { userDetails: null, session: null, domain: null, redirectUrl: null, companyDetails: null, sidebarState: false, portalDetails: null } }));
            this.generalService.showSnackbar('You have successfully logged out.', 'success');
            const region = localStorage.getItem('country-region') || '';

            const url = this.portalDomain + `/login/${region}/`;
            this.router.navigate([url]);
        });
    }

    /**
     * This listner is used for mouse move events
     *
     * @param {MouseEvent} event
     * @memberof SidebarComponent
     */
    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (this.storeData.session?.id) {
            this.checkAndRenewUserSession();
        }
    }

    /**
     * This will be use for keypress events
     *
     * @param {KeyboardEvent} event
     * @memberof SidebarComponent
     */
    @HostListener('document:keypress', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.storeData.session?.id) {
            this.checkAndRenewUserSession();
        }
    }

    /**
     * This will check and renew user session if close to expiry
     *
     * @memberof HeaderComponent
     */
    public checkAndRenewUserSession(): void {
        if (this.storeData.session && this.storeData.session.expiresAt) {
            let expiresAtList = this.storeData.session?.expiresAt?.split(" ");
            if (expiresAtList) {
                let expiryDate = expiresAtList[0]?.split("-").reverse().join("-");
                let sessionExpiresAt = dayjs(expiryDate + " " + expiresAtList[1]);
                if (sessionExpiresAt.diff(dayjs(), 'hours') < 24) {
                    this.authService.renewSession(this.storeData?.userDetails?.vendorContactUniqueName, this.storeData?.session?.id).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                        if (response && response.status === 'success') {
                            this.store.dispatch(setFolderData({ folderName: this.storeData.domain, data: { session: response.body.session } }));
                        } else {
                            if (response?.status === 'error') {
                                this.generalService.showSnackbar(response?.message);
                            }
                        }
                    });
                }
            }
        }
    }

    /**
     * Cleans up resources when the component is destroyed
     *
     * @memberof SidebarComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
