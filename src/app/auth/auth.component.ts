import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit , OnDestroy{
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Request body for get shopify url params */
  public portalParamsRequest = {
    proxy_auth_token: undefined
  }
  /** This will be use for snackbar duration */
  public durationInSeconds = 3;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    // get url query params
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.proxy_auth_token = params.proxy_auth_token;
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
    console.log("clg");
  }

  /**
 * This will be use for get shopify authorization
 *
 * @memberof AuthComponent
 */
  public getPortalUrlParams(): void {
    this.isLoading = true;
    this.authService.authenticateProxy(this.portalParamsRequest.proxy_auth_token).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
      this.isLoading = false;
      if (response && response.status === 'success') {

      } else {
        this.showSnackbar(response?.message);
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
