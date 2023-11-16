import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { Store } from '@ngrx/store';
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { setPortalDomain } from "../store/actions/session.action";
import { SessionState } from "../store/reducer/session.reducer";
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

  constructor(
    private route: ActivatedRoute,
    private store: Store<SessionState>,
    private snackBar: MatSnackBar
  ) {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.domain = params.companyDomainUniqueName;
        this.store.dispatch(setPortalDomain({ domain: this.portalParamsRequest.domain }));
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
    let configuration = {
      referenceId: "117230p1697093599652797df30cea",
      addInfo: {
        redirect_path: this.url
      },
      success: (data: any) => {
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
    };
    document.getElementById("117230p1697093599652797df30cea").appendChild(scriptTag);

  }

/**
 * This will be use for show snackbar
 *
 * @param {string} message
 * @return {*}
 * @memberof LoginComponent
 */
public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

/**
 * This will be use for component destroyed
 *
 * @memberof LoginComponent
 */
public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
