import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { select, Store } from '@ngrx/store';
import { setSessionToken } from '../store/actions/session.action';
import { AppState } from '../store';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Request body for get shopify url params */
  public portalParamsRequest = {
    token: undefined,
    domain: undefined
  }
  /** This will be use for snackbar duration */
  public durationInSeconds = 3;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    // get url query params
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.token = params.proxy_auth_token;
        this.store.dispatch(setSessionToken({ session: this.portalParamsRequest.token }));
        this.getPortalUrlParams();
      }
    });
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.domain = params.companyDomainUniqueName;
      }
    });
    // this.store.pipe(select(state => state.domain), takeUntil(this.destroyed$)).subscribe(res => {
    //   console.log('domain', res);
    // });
  }

  /**
   * This will be use for component initialization
   *
   * @memberof AuthComponent
   */
  public ngOnInit(): void {
  }

  /**
 * This will be use for get shopify authorization
 *
 * @memberof AuthComponent
 */
  public getPortalUrlParams(): void {
    this.isLoading = true;
    this.authService.authenticateProxy(this.portalParamsRequest.token).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      this.isLoading = false;
      if (response && response.status === 'success') {
        this.authService.verifyPortalLogin(response.data[0].email, this.portalParamsRequest.token, this.portalParamsRequest.domain).pipe(takeUntil(this.destroyed$)).subscribe((data) => {
          if (data && data.status === 'success') {
            console.log("yes");

            } else {
            this.showSnackbar(data?.message);
            this.isLoading = false;
          }
        });
      } else {
        this.showSnackbar(response?.data?.message);
        this.isLoading = false;
      }
    });
  }

  /**
   * This will be use for show snackbar
   *
   * @param {string} message
   * @return {*}
   * @memberof AuthComponent
   */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
 *This function will use for component destroy
 *
 * @memberof AuthComponent
 */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
