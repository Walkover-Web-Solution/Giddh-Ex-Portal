import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { Store } from '@ngrx/store';
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as UserActions from '../store/actions/session.action';
declare var initVerification: any;
@Component({
  selector: "login",
  templateUrl: "login.component.html",
  styleUrls: ["login.component.scss"]
})
export class LoginComponent implements OnInit, OnDestroy {

  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Request body for get portal url params */
  public portalParamsRequest = {
    domain: undefined
  }
  public url: string = '';

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    // get url query params
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.domain = params.companyDomainUniqueName;
        this.store.dispatch(UserActions.setPortalDomain({ domain: this.portalParamsRequest.domain }));
        this.url = `/auth/${this.portalParamsRequest.domain}`;
      }
    });
  }
  public ngOnInit(): void {
    let configuration = {
      referenceId: "117230p1697093599652797df30cea",
      addInfo: {
        redirect_path: this.url
      },
      success: (data: any) => {
        console.log(data);
        // this.ngZone.run(() => {
        // this.initiateLogin(data);
        // });
      },
      failure: (error: any) => {
        this.showSnackbar(error?.message);
      }
    };

    /* OTP LOGIN */
    let scriptTag = document.createElement('script');
    scriptTag.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
    scriptTag.type = 'text/javascript';
    scriptTag.defer = true;
    scriptTag.onload = () => {
      initVerification(configuration);
      // this.loaderService.hide();

    };
    document.getElementById("117230p1697093599652797df30cea").appendChild(scriptTag);

  }

  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }


  public login(): void {


  }

  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
