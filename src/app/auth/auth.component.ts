import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Store } from '@ngrx/store';
import { setSessionToken, setUserDetails } from '../store/actions/session.action';
import { FormBuilder, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
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
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private generalService: GeneralService,
        private fb: FormBuilder,
        private store: Store
    ) {
        this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
            if (params) {
                this.portalParamsRequest.proxyAuthToken = params.proxy_auth_token;
                this.getPortalUrlParams();
            }
        });
        this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
            if (params) {
                this.portalParamsRequest.subDomain = params.companyDomainUniqueName;
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
                this.store.dispatch(setUserDetails({ userDetails: this.savePortalUserSession }));
                this.store.dispatch(setSessionToken({ session: response.body.session }));
                let url = '/' + this.portalParamsRequest.subDomain + '/welcome';
                this.router.navigate([url]);
            } else {
                this.isLoading = false;
                this.generalService.showSnackbar(response?.data?.message);
            }
        });
    }

    /**
     * This will be use for get portal authorization
     *
     * @memberof AuthComponent
     */
    public getPortalUrlParams(): void {
        this.isLoading = true;
        this.authService.authenticateProxy(this.portalParamsRequest.proxyAuthToken).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            if (response && response.status === 'success') {
                this.portalParamsRequest.emailId = response.data[0]?.email;
                this.authService.verifyPortalLogin(this.portalParamsRequest).pipe(takeUntil(this.destroyed$)).subscribe((portal) => {
                    if (portal && portal.status === 'success') {
                        this.users = portal.body;
                        if (this.users?.length > 1) {
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
                            this.store.dispatch(setUserDetails({ userDetails: this.savePortalUserSession }));
                            this.store.dispatch(setSessionToken({ session: this.users[0]?.session }));
                            let url = '/' + this.portalParamsRequest.subDomain + '/welcome'
                            this.router.navigate([url]);
                        }
                    } else {
                        this.generalService.showSnackbar(portal?.message);
                        this.isLoading = false;
                    }
                });
            } else {
                this.generalService.showSnackbar(response?.data?.message);
                this.isLoading = false;
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
