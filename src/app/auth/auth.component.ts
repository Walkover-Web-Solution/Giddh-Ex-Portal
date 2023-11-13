import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { select, Store } from '@ngrx/store';
import { setPortalDomain, setSessionToken, setUserDetails } from '../store/actions/session.action';
import { AppState } from '../store';
import { FormBuilder, UntypedFormArray, UntypedFormGroup } from '@angular/forms';

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
    proxyAuthToken: undefined,
    subDomain: undefined,
    emailId: undefined
  }
  /** This will be use for snackbar duration */
  public durationInSeconds = 3;
  public checkboxForm: UntypedFormGroup;
  public users: any[] = [];
  public savePortalUserSession = {
    account: {
      name: undefined,
      uniqueName: undefined
    },
    vendorContactUniqueName: undefined,
    proxyAuthToken: undefined,
    subDomain: undefined
  };
  public companyUniqueName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {

    // get url query params
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.proxyAuthToken = params.proxy_auth_token;
        this.getPortalUrlParams();
      }
    });
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params: any) => {
      if (params) {
        this.portalParamsRequest.subDomain = params.companyDomainUniqueName;
        this.store.dispatch(setPortalDomain({ domain: this.portalParamsRequest.subDomain }));
      }
    });

  }

  /**
 * This will be use for component initialization
 *
 * @memberof AuthComponent
 */
  public ngOnInit(): void {
    this.usersForm();
  }

  public usersForm() {
    this.checkboxForm = this.fb.group({
      checkboxes: this.fb.array([])
    });


  }

  public onCheckboxChange(index: number) {
    const isChecked = this.checkboxForm.value.checkboxes[index];
    const selectedOption = isChecked ? this.users[index] : null;
    this.savePortalUserSession = {
      account: {
        name: selectedOption.account.name,
        uniqueName: selectedOption.account.uniqueName
      },
      vendorContactUniqueName: selectedOption.vendorContactUniqueName,
      proxyAuthToken: this.portalParamsRequest.proxyAuthToken,
      subDomain: this.portalParamsRequest.subDomain
    }
    this.isLoading = true;
    this.authService.savePortalUserSession(this.savePortalUserSession).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      this.isLoading = false;
      if (response && response.status === 'success') {
        // this.companyUniqueName = response.companyUniqueName;
        this.savePortalUserSession['companyUniqueName'] = response.body.companyUniqueName;
        this.store.dispatch(setUserDetails({ userDetails: this.savePortalUserSession }));
        this.store.dispatch(setSessionToken({ session: response.body.session }));
        let url = '/' + this.portalParamsRequest.subDomain + '/welcome';
        this.router.navigate([url]);
      } else {
        this.showSnackbar(response?.data?.message);
        this.isLoading = false;
      }
    });
  }



  /**
 * This will be use for get shopify authorization
 *
 * @memberof AuthComponent
 */
  public getPortalUrlParams(): void {
    this.isLoading = true;
    this.authService.authenticateProxy(this.portalParamsRequest.proxyAuthToken).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      this.isLoading = false;
      if (response && response.status === 'success') {
        this.isLoading = true;
        this.portalParamsRequest.emailId = response.data[0].email;
        // this.portalParamsRequest.emailId = 'portal@walkover.in';
        this.authService.verifyPortalLogin(this.portalParamsRequest).pipe(takeUntil(this.destroyed$)).subscribe((portal) => {
          if (portal && portal.status === 'success') {
            this.isLoading = false;
            this.users = portal.body;
            this.users.forEach(() => {
              const control = this.fb.control(false);
              (this.checkboxForm.get('checkboxes') as UntypedFormArray).push(control);
            });
            if (this.users?.length >1) {
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
              }
              this.isLoading = true;
              this.authService.savePortalUserSession(this.savePortalUserSession).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                this.isLoading = false;
                if (response && response.status === 'success') {
                  this.companyUniqueName = response.companyUniqueName;
                  this.savePortalUserSession['companyUniqueName'] = this.companyUniqueName;
                  this.store.dispatch(setUserDetails({ userDetails: this.savePortalUserSession }));
                  this.store.dispatch(setSessionToken({ session: response.body.session }));
                  let url = '/'+this.portalParamsRequest.subDomain + '/welcome'
                  this.router.navigate([url]);
                } else {
                  this.showSnackbar(response?.data?.message);
                  this.isLoading = false;
                }
              });
            }

          } else {
            this.showSnackbar(portal?.message);
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
