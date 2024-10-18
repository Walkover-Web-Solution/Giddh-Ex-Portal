import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { select, Store } from '@ngrx/store';
import { setFolderData } from '../store/actions/session.action';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { GeneralService } from '../services/general.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Request body for get portal url params */
    public portalParamsRequest = {
        proxyAuthToken: undefined,
        subDomain: undefined,
        emailId: undefined
    };
    /** User form group */
    public userForm: UntypedFormGroup;
    /** Hold users*/
    public users: any[] = [];
    /** This will be use for save portal session */
    public savePortalUserSession = {
        account: {
            name: undefined,
            uniqueName: undefined
        },
        vendorContactUniqueName: undefined,
        proxyAuthToken: undefined,
        subDomain: undefined
    };
    /** This will be use for  company uniqueName*/
    public companyUniqueName: string = '';
    /** Hold redirect url */
    public redirectUrl: any = "";
    /** Hold region */
    public region: string = "";

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private generalService: GeneralService,
        private fb: FormBuilder,
        private store: Store
    ) {
        combineLatest([this.route.queryParams, this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && response[2] && !this.portalParamsRequest.proxyAuthToken) {
                this.portalParamsRequest.proxyAuthToken = response[0].proxy_auth_token;
                this.portalParamsRequest.subDomain = response[1].companyDomainUniqueName;
                this.region = response[2]['folderName'][this.portalParamsRequest.subDomain]?.region;
                this.redirectUrl = response[2]['folderName'][this.portalParamsRequest.subDomain]?.redirectUrl;
                this.getPortalUrlParams();
            }
        });
    }

    /**
     * This will be use for component initialization
     *
     * @memberof AuthComponent
     */
    public ngOnInit(): void {
        this.initializeUserForm();
    }

    /**
     * This will be use for user form
     *
     * @memberof AuthComponent
     */
    public initializeUserForm() {
        this.userForm = this.fb.group({
            user: this.fb.array([])
        });
    }

    /**
     * This will be use for on user selection
     *
     * @param {number} index
     * @memberof AuthComponent
     */
    public onUserSelected(user: any): void {
        this.isLoading = true;
        this.savePortalUserSession = {
            account: {
                name: user.account.name,
                uniqueName: user.account.uniqueName
            },
            vendorContactUniqueName: user.vendorContactUniqueName,
            proxyAuthToken: this.portalParamsRequest.proxyAuthToken,
            subDomain: this.portalParamsRequest.subDomain
        };

        this.authService.savePortalUserSession(this.savePortalUserSession).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            if (response && response.status === 'success') {
                this.savePortalUserSession['companyUniqueName'] = response.body.companyUniqueName;
                this.store.dispatch(setFolderData({ folderName: this.portalParamsRequest.subDomain, data: { userDetails: this.savePortalUserSession, session: response.body.session } }));
                let url = '';
                if (!this.redirectUrl) {
                    url = '/' + this.portalParamsRequest.subDomain + `/${this.region}/welcome`;
                    this.router.navigate([url]);
                } else {
                    url = `/${this.portalParamsRequest.subDomain}/${this.region}/${this.redirectUrl}`;
                    const updatedUrl = url.split('?');
                    if (updatedUrl.length > 1) {
                        const baseUrl = updatedUrl[0];
                        const queryParams = this.parseQueryParams(updatedUrl[1]);
                        this.router.navigate([baseUrl], { queryParams: queryParams });
                    }
                }
            } else {
                this.isLoading = false;
                if (response?.status === 'error') {
                    this.generalService.showSnackbar(response?.data?.message);
                }
            }
        });
    }

    /**
     * This will be use for parse query parameters
     *
     * @param {string} queryString
     * @return {*}  {*}
     * @memberof AuthComponent
     */
    public parseQueryParams(queryString: string): any {
        const params = {};
        const pairs = queryString.split('&');

        for (const pair of pairs) {
            const keyValue = pair.split('=');
            const key = decodeURIComponent(keyValue[0]);
            const value = keyValue.length > 1 ? decodeURIComponent(keyValue[1]) : null;

            params[key] = value;
        }

        return params;
    }

    /**
     * This will be use for get portal authorization
     *
     * @memberof AuthComponent
     */
    public getPortalUrlParams(): void {
        if (!this.portalParamsRequest.proxyAuthToken || !this.portalParamsRequest.subDomain) {
            return;
        }
        this.isLoading = true;
        this.authService.authenticateProxy(this.portalParamsRequest.proxyAuthToken).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            if (response && response.status === 'success') {
                this.portalParamsRequest.emailId = response.data[0]?.email;
                this.authService.verifyPortalLogin(this.portalParamsRequest).pipe(takeUntil(this.destroyed$)).subscribe((portal: any) => {
                    if (portal && portal.status === 'success') {
                        this.users = portal.body;
                        if (this.users?.length > 1) {
                            this.store.dispatch(setFolderData({ folderName: this.portalParamsRequest.subDomain, data: { portalUsers: portal.body, proxyAuthToken: this.portalParamsRequest.proxyAuthToken } }));
                            this.isLoading = false;
                        } else {
                            this.savePortalUserSession = {
                                account: {
                                    name: this.users[0].account.name,
                                    uniqueName: this.users[0].account.uniqueName
                                },
                                vendorContactUniqueName: this.users[0].vendorContactUniqueName,
                                proxyAuthToken: this.portalParamsRequest.proxyAuthToken,
                                subDomain: this.portalParamsRequest.subDomain
                            };
                            this.companyUniqueName = this.users[0]?.companyUniqueName;
                            this.savePortalUserSession['companyUniqueName'] = this.companyUniqueName;
                            this.store.dispatch(setFolderData({ folderName: this.portalParamsRequest.subDomain, data: { userDetails: this.savePortalUserSession, session: this.users[0]?.session } }));
                            let url = '';
                            if (!this.redirectUrl) {
                                url = '/' + this.portalParamsRequest.subDomain + `/${this.region}/welcome`;
                                this.router.navigate([url]);
                            } else {
                                url = `/${this.portalParamsRequest.subDomain}/${this.region}this.redirectUrl`;
                                const updatedUrl = url.split('?');
                                if (updatedUrl.length > 1) {
                                    const baseUrl = updatedUrl[0];
                                    const queryParams = this.parseQueryParams(updatedUrl[1]);
                                    this.router.navigate([baseUrl], { queryParams: queryParams });
                                }
                            }
                        }
                    } else {
                        if (portal?.status === 'error') {
                            this.generalService.showSnackbar(portal?.message);
                            this.isLoading = false;
                            const url = '/' + this.portalParamsRequest.subDomain + `/${this.region}/login/`;
                            this.router.navigate([url]);
                        }
                    }
                });
            } else {

                if (response?.status === 'error') {
                    this.generalService.showSnackbar(response?.data?.message);
                    this.isLoading = false;
                    const url = '/' + this.portalParamsRequest.subDomain + `/${this.region}/login/`;
                    this.router.navigate([url]);
                }
            }
        });
    }

    /**
     * This function will use for component destroy
     *
     * @memberof AuthComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
