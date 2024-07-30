import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from '@ngrx/store';
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { setFolderData } from "../store/actions/session.action";
import { SessionState } from "../store/reducer/session.reducer";
import { GeneralService } from "../services/general.service";
import { environment } from "src/environments/environment";

declare var initVerification: any;

@Component({
    selector: "login",
    templateUrl: "login.component.html",
    styleUrls: ["login.component.scss"]
})
export class LoginComponent implements OnInit, OnDestroy {
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Request body for get portal url params */
    public portalParamsRequest = {
        domain: undefined
    }
    /** Hold current url*/
    public url: string = '';
    /** Hold proxy button  id */
    public loginId = environment.proxyReferenceId;

    constructor(
        private route: ActivatedRoute,
        private store: Store<SessionState>,
        private generalService: GeneralService
    ) {
        localStorage.removeItem("folderName");
        this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
            if (params) {
                this.portalParamsRequest.domain = params.companyDomainUniqueName;
                this.store.dispatch(setFolderData({
                    folderName: this.portalParamsRequest.domain,
                    data: {
                        domain: this.portalParamsRequest.domain,
                        sidebarState: true
                    },
                    reset: true
                }));
                this.url = `/${this.portalParamsRequest.domain}/auth`;
            }
        });
    }

    /**
     * This will be use for components initialization
     *
     * @memberof LoginComponent
     */
    public ngOnInit(): void {
        document.querySelector('body').classList.add('login-body');
        this.loginButtonScriptLoaded();
    }

    /**
     *  This will be use for login button script loading
     *
     * @memberof LoginComponent
     */
    public loginButtonScriptLoaded(): void {
        setTimeout(() => {
            let configuration = {
                referenceId: environment.proxyReferenceId,
                addInfo: {
                    redirect_path: this.url
                },
                success: (data: any) => {
                },
                failure: (error: any) => {
                    this.generalService.showSnackbar(error?.message);
                }
            };
            this.generalService.loadScript(environment.proxyReferenceId, configuration);
        }, 200)
    }

    /**
     * This will be use for component destroyed
     *
     * @memberof LoginComponent
     */
    public ngOnDestroy(): void {
        document.querySelector('body').classList.remove('login-body');
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
